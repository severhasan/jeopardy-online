const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {User, validateUser} = require('../models/user');
const {parseError, sessionizeUser} = require('../util/helpers');
require('dotenv').config()


const variables = require('../variables');


// LOGIN
router.get(variables.login.route, async(req, res) => {
    try{
        if(req.session.user){
            res.send('You are already logged in. You can go to /logout to logout.')
            return;
        }
        res.locals.title = variables.login.title
        res.render("user/login", {variables: variables})
    } catch(ex){
        console.log(ex);
    }
});

router.post(variables.login.route, async(req, res) => {
    try{
        const { error } = validateUser(req.body)
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ email: req.body.email });

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword)  return res.status(400).send('Invalid email or password');

        if (user && validPassword) {
            const sessionUser = sessionizeUser(user);
            req.session.user = sessionUser
            
            req.session.save(function(err) {
                console.log(err)
              });
            res.redirect('/')
            
        } else {
            throw new Error('Invalid login credentials');
        }
    } catch(ex){
        res.status(401).send(parseError(ex));
    }
});


// LOGOUT
router.get(variables.logout.route, async (req, res) => {
    try{
        const user = req.session.user;
        if(user){
            req.session.destroy(err => {
                if (err) throw (err);
                res.clearCookie(process.env.SESS_NAME);
                //req.session = null;
                res.send('logged you out');
            });
        } else {
            res.redirect('/');
            // throw new Error('Something went wrong');
        }
    } catch(ex){
        res.status(422).send(parseError(ex));
    }
})



// REGISTER
router.get(variables.register.route, async(req, res) => {
    try {
        res.locals.title = variables.register.title;
        res.render("user/register", {variables: variables});
    } catch(ex){
        console.log(ex);
    }
});

router.post('/register', async(req, res)=> {
    try {
        const { error } = validateUser(req.body); 
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({email: req.body.email});
        if(user) return res.status(400).send('User already registered');

        user = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt)
        await user.save();
        res.redirect(variables.login.route);
    } catch(ex){
        console.log(ex);
        
    }
});



module.exports = router;