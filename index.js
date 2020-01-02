const express = require('express');
const app = express();
const {handleIO} = require('./util/socket-functions');

const http = require('http').createServer(app);
const io = require('socket.io')(http);

const {Quiz} = require('./models/quiz');


// SET ROUTES
require('./startup/routes')(app);
require('./startup/db')();

// CONFIGURE EXPRESS
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


// MAINPAGE -to be replaced
app.get('/', async (req, res) => {
    const query = await Quiz.find({})
    const quizes = query.map(q => ({id: q._id, title: q.title, username: q.author.username}));
    res.render('index', {title: 'Jeopardy Online', quizes: quizes});
});

app.get('/about', (req, res) => {
    res.render('about/about', {title: 'About'});
});

io.on('connection', function(socket) {
    let user;

    socket.on('connect-to-game', data => {
        // ON CONNECT PAGE, CHECK IF SUCH A USERNAME EXISTS. IF TRUE, THEN ASK FOR ANOTHER USERNAME
        user = {id: socket.id, name: data.username, gamePin: data.pin}
        handleIO.connectToGame(socket, io, data, user);
    });

    socket.on('player-add', (data) => {
        socket.join(data.pin);
        user = {name: data.username, gamePin: data.pin}

        handleIO.addPlayer(socket, io, data);
        handleIO.updateLobby(socket, io, data);
    });

    socket.on('start-game', async (data) => {
        try{
            handleIO.setGame(socket, io, data);
            
        } catch (ex){
            console.log('[socket, start-game]', ex);
        }
    });

    socket.on('question-chosen', data => {
        handleIO.questionChosen(socket, io, data);
    });

    socket.on('check-question', data => {
        handleIO.checkQuestion(socket, io, data);
    });

    socket.on('question-bought', data => {
        handleIO.questionBought(socket, io, data);
    });

    socket.on('check-question-bought', data => {
        handleIO.checkQuestionBought(socket, io, data);
    });

    socket.on('next-question', async data => {
        handleIO.nextQuestion(socket, io, data);
    });

    socket.on('finish-game', data => {
        handleIO.finishGame(socket, io, data);
    });

    socket.on('disconnect', async function(){
        handleIO.disconnect(socket, io, user);
    });
});



// START APP
const port = process.env.PORT || 3000;
http.listen(port, () => console.log(`Listening on port ${port}...`))

exports.http = http;