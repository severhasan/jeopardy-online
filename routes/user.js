const express = require('express');
const router = express.Router();
const {User, validateUser} = require('../models/user');
const {Quiz} = require('../models/quiz');
const {parseError, sessionizeUser} = require('../util/helpers');
require('dotenv').config()


const variables = require('../variables');

router.get('/:username', async(req, res) => {
    try{
        res.locals.title = `${req.params.username}'s profile`;
        //const user = await User.findOne({ username: req.params.username }).populate('collections').populate('questions');
        const query = await Quiz.find({'author.username': req.params.username}).populate('questions');
        const quizes = query.map(q => ({title: q.title, questions: q.questions.map(x => ({title: x.title}))}));

        //console.log(quizes)
        res.render("user/profile", {variables: variables, quizes: quizes})
    } catch(ex){
        console.log(ex);
    }
});


module.exports = router;