const express = require('express');
const router = express.Router();
const {Quiz, validateQuiz} = require('../models/quiz');
const {Question, validateQuestion} = require('../models/question');
const {gameSession} = require('../models/game-session');
const ObjectId = require('mongoose').Types.ObjectId;


const middleware = require('../middleware/middleware');

const variables = require('../variables');

// GET QUIZ PAGE
router.get('/', async(req, res) => {
    try{
        res.locals.title = variables.quiz.title
        const query = await Quiz.find({})
        const quizes = query.map(q => ({id: q._id, title: q.title, username: q.author.username}));
        const user = req.session.user ?req.session.user.username :false
        res.render("quiz/index", {variables: variables, quizes: quizes, user: user});
    } catch(ex){
        console.log(ex);
    }
});

// POST TO QUIZ and CREATE A GAME with QUIZ ID
// MOVE THIS TO ROUTER/SOCKET.JS
router.post('/', async function(req, res) {
    try {
        const path = Date.now().toString(32);

        req.session.player = req.body.username;
        req.session.save();

        //req.session.creator = true; // use this for the middleware
        
        let pin = (Math.floor(Math.random() * 100000) + 10000).toString();
        const query = gameSession.findOne({pin: pin});
        
        if(query) pin += (Math.floor(Math.random() * 10)).toString();
        const game = await new gameSession({
            path: path,
            pin: pin,
            quizId: req.body.quizId,
            creator: req.session.player,
            isLive: false
        });
        await game.save();
        res.redirect('/game/play/' + path)
    } catch (ex) {
        console.log(ex)
    }
});


// QUIZ CREATE PAGE
router.get(variables.createQuiz.route, middleware.isLoggedIn, async function(req, res) {
    try{
        res.locals.title = variables.createQuiz.title;
        res.locals.count = 10;
        
        res.render("quiz/createQuiz", {variables: variables})
    } catch(ex){
        console.log(ex);
    }
});


// GET AN INDIVIDUAL QUIZ WITH ID / NO NEED FOR isLoggedIn;
router.get('/:id', async function(req, res){
    try{
        const quizId = req.params.id;

        if(!ObjectId.isValid(quizId)) return res.redirect('back');
        
        // RETURN IF QUIZ DOESN'T EXIST
        const quiz = await Quiz.findOne({_id: quizId});
        if(!quiz) return res.redirect('back');

        res.locals.title = quiz.title;
        // FIND QUESTIONS RELATED TO QUIZ
        const questionQuery = await Question.find({quizId: quizId});
        
        let isAuthor = false;
        if(req.session.user) {
            isAuthor = req.session.user.username === quiz.author.username;
        }

        // RETURN IF THERE IS NO QUESTION RELATED TO QUIZ
        let isNew = true;
        if(questionQuery.length === 0) {
            res.render('quiz/createQuiz', {
                isNew: isNew,
                quizData: {id: quizId},
                categories: [],
                values: [],
                author: isAuthor
            });
            return;
        }

        const newQuery = questionQuery.map(q => ({
            id: q._id,
            title: q.title, 
            category: q.category,
            value: q.value,
            options: q.options
        }));
        
        const sortedQuery = [...newQuery];
        sortedQuery.sort((a, b) => a.category.column - b.category.column);
        
        isNew = false;
        
        // use quizData for all the questions and categories for table header;
        const quizData = {};
        const categories = [];
        const values = [];
        for(const q of sortedQuery){
            if(quizData[`"${q.category.title}"`]){
                quizData[`"${q.category.title}"`].push(q);
            } else {
                quizData[`"${q.category.title}"`] = [q];
                categories.push(q.category.title);
            }
            if(!values.includes(q.value)) values.push(q.value);
        }
        
        for(const i in quizData){
            const sortedCategory = [...quizData[i]];
            quizData[i] = [...sortedCategory.sort((x, y) => x.value - y.value)];
        }
        quizData.id = quizId;
        res.render('quiz/createQuiz', {isNew: isNew,
            quizData: quizData,
            quizId: quizId,
            categories: categories,
            values: values,
            author: isAuthor
        });
    } catch(ex){
        console.log('get [quiz/:id]', ex)
    }
});

// SAVE QUIZ ID with TAGS
router.post('/create/quiz', middleware.isLoggedIn, async function(req, res){
    // create quiz only;
    try {
        const { error } = validateQuiz({
            title: req.body.title,
            author: {id: req.session.user.userId, username: req.session.user.username}
        });
        if (error) {
            //console.log(error)
            return res.json({err: error.details[0].message});
        }

        const quiz = new Quiz({
            title: req.body.title,
            author: {id: req.session.user.userId, username: req.session.user.username},
            tags: req.body.tags
        });

        await quiz.save(function(err){
            if(err){
                return res.json({err: 'quiz not saved'});
            }
            res.json({message: 'Quiz successfully created. Redirecting you to the quiz page...', id: quiz._id});
        });
    } catch(ex){
        console.log(ex);
    }

});

// SAVE QUESTION ON THE QUIZ PAGE
router.post('/:id/question', async function(req, res){
    try {
        // create question only;

        const quizId = req.body.quizId;
        
        if(!req.session.user) return res.json({err: 'user not signed in', redirect: '/login'});
        
        const isValid = await handleValidation(quizId, 'check question validity', req, res);
        if(isValid.err) return res.json({err: 'question is not valid'});
        
        const question = new Question({
            title: req.body.title,
            value: req.body.value,
            category: req.body.category,
            options: req.body.options,
            quizId: quizId,
            author: {id: req.session.user.userId, username: req.session.user.username}
        });
        await question.save(function(err){
            if(err){
                //console.log('LOOKIEEEEE HEREEEE:', err.message)
                return res.json({err: 'quiz not saved'});
            }
            res.json({id: question._id, message: 'successfully saved'});
        });
    } catch(ex){
        console.log('post [:quizid/question]', ex)
    }
});

// UPDATE QUESTION AND CATEGORIES
router.put('/:quizId/update', async function(req, res){
    try {
        // update QUESTION WITH ID
        const quizId = req.body.quizId;
        if(!req.session.user) return res.json({err: 'user not signed in', redirect: '/login'});
        
        let isValid = await handleValidation(quizId, 'update row', req, res);
        if(isValid.err) return res.json({err: 'question could not be updated.'});
    
        let message;
        let error = false;
        if(req.body.type === 'question'){
            message = 'question successfully updated'
            const question = await Question.findById(req.body.id);
            
            if(!question) return res.json({err: 'quiz not saved'});
            
            question.title = req.body.title;
            question.options = req.body.options;
            
            await question.save(function(err){
                if(err){
                    error = true;
                    message = 'question could not be updated';
                }
            });
        }
    
        if(req.body.type === 'update row'){
            // find by ids and update rows;
            message = 'all row values updated';
            
            const questionList = req.body.questions;
            const value = req.body.value;
            
            for (const id of questionList){
                const question = await Question.findById(id);
                
                if(!question) return res.json({err: 'quiz not saved'});
    
                question.value = value;
                await question.save(function(err){
                    if(err){
                        error = true;
                        message = 'values could not be updated';
                    }
                });
            }
        }
    
        if(error) return res.json({err: message});
        res.json({message: message});
    } catch (ex){
        console.log('[update route]', ex);
    }
});

// DELETE CATEGORY OR QUESTIONS IN A ROW...
router.delete('/:quizId/delete', async function(req, res){
    try {
        const quizId = req.body.quizId;
        if(!req.session.user) return res.json({err: 'user not signed in', redirect: '/login'});
        
        // need to check if IDs are valid and questions exist?
        // const isValid = await handleValidation(quizId, 'update row', req, res);
        // if(isValid.err) return res.json({err: 'question could not be updated.'}); 
    
        const questionList = req.body.questions;
        let error = false;
        for(const id of questionList){
            await Question.findByIdAndDelete(id, function(err){
                if(err){
                    console.log('[delete route]', err);
                    error = true;
                }
            });
        }
    
        if(error) return res.json({err: 'some questions could not be deleted'});
        res.json({message: 'all questions successfully deleted'});
    } catch(ex){
        console.log('[delete route]', ex);
    }
});

async function handleValidation(quizId, type, req, res){
    const quiz = await Quiz.findById(quizId);
    // console.log(req.session.user.userId !== quiz.author.id); // work this out later
    if(req.session.user.username !== quiz.author.username) {
        return {err: 'question is not valid'};
        // return res.redirect(variables.login.route);
    }
    if(type === 'check question validity') return isQuestionValid(req, res);
    return {};
}

function isQuestionValid(req, res){
    let optionsValid = true;
    for(const opt of req.body.options){
        if(opt.title === '') optionsValid = false;
    }
    const isValid = validateQuestion({
        title: req.body.title,
        value: req.body.value,
        options: req.body.options.length
    });
    if(isValid.error || !optionsValid){
        console.log('error in validation of question')
        console.log(isValid.error.details[0].message)
        return {err: 'question is not valid'};
    } else return {};
}


module.exports = router;