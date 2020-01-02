const express = require('express');
const router = express.Router();
const {gameSession} = require('../models/game-session');

require('dotenv').config();


router.get('/connect', (req, res) => {
    req.session.player = null
    req.session.save(err => {
        if(err) console.log(err)
    });

    res.locals.title = 'Connect Page';
    res.render('game/connect');
});

router.post('/connect', async function(req, res){
    try{
        req.session.player = req.body.player;
        req.session.save(function(err){
            if(err) console.log(err)
            //console.log('player saved?')
        })
        res.locals.title = 'Connect Page';
        const pin = req.body.pin;
        
        const game = await gameSession.findOne({pin: pin});
        const path = await game.path;
        if(!game) return res.send('the game cannot be found. Maybe you made a mistake typing the Pin Number?')
        if(game.isLive) return res.send('the game has already started. You can\'t join the game now');

        res.redirect('/game/play/' + path);

    } catch(ex) {
        console.log(ex)
    }
});

router.get('/play/:gamepath', async (req, res) => {
    try {
        const game = await gameSession.findOne({path: req.params.gamepath}).populate('quizId');
        const pin = game.pin;
        const title = game.quizId.title;
        
        // const creator = null;
        // creator = game.creator
        res.locals.title = 'Game Page';
        res.render('game/play', {player: req.session.player, pin: pin, quizTitle: title});
    } catch(ex) {
        console.log(ex);
    }
});

module.exports = router;