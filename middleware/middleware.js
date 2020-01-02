const variables = require('../variables');

const middleware = {};

middleware.isLoggedIn = (req, res, next) => {
    if(!req.session.user){
        // req.flash("error", "You need to be logged in to do that!");
        console.log('user not logged in')
        return res.redirect(variables.login.route);
    }
    return next();
};

middleware.isCreator = (req, res, next) => {
    if(!req.session.creator){
        return res.redirect('/socket/connect');
    }
    next();
}

module.exports = middleware;
