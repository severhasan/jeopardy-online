const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')

const auth = require('../routes/auth');
const user = require('../routes/user');
const quiz = require('../routes/quiz');
const game = require('../routes/game');
const MongoStore = require('connect-mongo')(session);
require('dotenv').config();


module.exports = function(app){
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(session({
        name: process.env.SESS_NAME, 
        secret: process.env.SESS_SECRET,
        saveUninitialized: false,
        resave: false,
        store: new MongoStore({
            url: process.env.DB_LINK,
            collection: 'user-session',
            secret: "newsecret",
            ttl: 60*60,
            autoRemove: 'native'
        }),
        cookie: {
            sameSite: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60*60*1000
        }
    }));	
    app.use('/', auth);
    app.use('/user', user);
    app.use('/quiz', quiz);
    app.use('/game', game);
}