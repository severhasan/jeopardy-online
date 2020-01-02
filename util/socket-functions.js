const {gameSession} = require('../models/game-session');
const {Quiz} = require('../models/quiz');
const {Question} = require('../models/question');

let game = {}; // holds game data with a pin /pin: {players: ..., curTurn...}/

const socketFunctions = {}


// SOCKET FUNCTIONS START HERE


// connect-to-game
socketFunctions.connectToGame = (socket, io, data, user) => {
    if(!game[data.pin]){
        io.to(`${user.id}`).emit('connect-user', {permission: false, message: 'Such game doesn\'t exist.'});
        return
    }
    if(game[data.pin].isLive){
        io.to(`${user.id}`).emit('connect-user', {permission: false, message: 'Game already started; you cannot join.'});
        return;
    }
    if(!data.username && game[data.pin]){
        io.to(`${user.id}`).emit('connect-user', {permission: false, next: true, message: 'Your place is reserved in the server. Please enter a username.'});
        return;
    }
    if(data.pin && data.username){
        const nameExist = game[data.pin].players.filter(p => p.username === data.username)[0];
        if(nameExist){
            io.to(`${user.id}`).emit('connect-user', {permission: false, message: 'Username already taken. Please choose another name.'});
        } else {
            io.to(`${user.id}`).emit('connect-user', {permission: true, message: 'Redirecting to the game...'});
        }
    }
}

// socket.on('player-add')
socketFunctions.addPlayer = (socket, io, data) => {
    if(game[data.pin]) {
        game[data.pin].players = [...game[data.pin].players, {id: socket.id, username: data.username, score: 0}];
    } else {
        game[data.pin] = {};
        game[data.pin].players = [{id: socket.id, username: data.username, score: 0}];  // ADD PLAYER SCORE
        game[data.pin].creator = {username: data.username, id: socket.id};

        io.to(`${game[data.pin].creator.id}`).emit('creator-play', {username: game[data.pin].creator.username})
    }
}

socketFunctions.updateLobby = (socket, io, data) => {
    const playerList = game[data.pin].players.map(x => x.username);
    io.in(`${data.pin}`).emit('game-lobby', {username: data.username, playerList: playerList});
}


// socket.on('start-game')
socketFunctions.setGame = (socket, io, data) => {
    if(!game[data.pin]) return;

    if (game[data.pin].players.length > 1) {
        startGame(socket, io, data);
    }
    else io.in(`${data.pin}`).emit('radio', {
        from: 'start-game',
        message: "Need more players to play",
        scores: [],
        isLive: false
    });
}

async function startGame(socket, io, data){
    const queries = await handleQueries(data);
    setGameLogs(queries, data);
    const sendData = setSendData(queries, data);
    
    const playerTurn = game[data.pin].playerTurn;

    // SEND ALL PLAYERS QUESTIONS AND OTHER NECESSARY INFO
    io.in(`${data.pin}`).emit('game-live', sendData);

    // INFORM ALL PLAYERS ABOUT THE FIRST PLAYER/FIRST TURN
    io.in(`${data.pin}`).emit('radio', {
        from: 'game-live',
        currentPlayer: playerTurn.username,
        isLive: game[data.pin].isLive,
        scores: game[data.pin].scores
    });

    // INFORM THE FIRST PLAYER, AND LET THEM CHOOSE A VALUE FOR A QUESTION
    io.to(`${playerTurn.id}`).emit('choose-question', {message: 'it\'s your turn'});
}

async function handleQueries(data){
    const session = await gameSession.findOne({pin: data.pin});
    session.isLive = true;
    await session.save();
    game[data.pin].isLive = true;
    
    const quizQuery = await Quiz.findById(session.quizId);
    const questionsQuery = await Question.find({quizId: quizQuery._id});
    const questionsUnsorted = questionsQuery.map(question => (
        {
            id: question._id,
            title: question.title,
            category: question.category,
            value: question.value,
            options: question.options.map(opt => ({title: opt.title, answer: opt.answer}))
        }
    ));

    const questions = questionsUnsorted.sort((x, y) => x.category.column - y.category.column);

    const valuesUnsorted = [];
    const categories = [];
    const logs = {};
    for(const q of questions){
        logs[q.id] = {answeredBy: [], boughtBy: [], passedBy: [], playerTurn: ''};
        if(!valuesUnsorted.includes(q.value)) valuesUnsorted.push(q.value);
        if(!categories.includes(q.category.title)) categories.push(q.category.title);
    }
    const values = valuesUnsorted.sort((x, y) => y - x);

    return {quiz: quizQuery, questions: questions, values: values, logs: logs, categories: categories}
}

function setGameLogs(queries, data){
    const shuffledList = shuffleList(game[data.pin].players);
    game[data.pin].players = [...shuffledList];
    
    game[data.pin].playerIndex = 0 // use for the current player turn regardless of the given answer
    game[data.pin].playerTurn = {...game[data.pin].players[0]};

    game[data.pin]['quizTitle'] = queries.quiz.title;
    game[data.pin]['quizId'] = queries.quiz._id;
    game[data.pin]['questions'] = queries.questions;
    game[data.pin]['values'] = queries.values;
    game[data.pin]['categories'] = queries.categories;
    game[data.pin]['logs'] = queries.logs;

    // SET THE SCORES OF THE PLAYERS - WILL BE USED TO INFORM THE PLAYERS VIA RADIO
    const playerScores = game[data.pin].players.map(x => ({username: x.username, score: x.score}));
    game[data.pin]['scores'] = playerScores;
}

function shuffleList(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function setSendData(queries, data){
    return {
        values: queries.values,
        categories: queries.categories,
        quizTitle: queries.quiz.title,
        isLive: game[data.pin].isLive,
        currentPlayer: game[data.pin].playerTurn.username,
        scores: game[data.pin].scores,
        message: "Game has started!"
    }
}


// socket.on('question-chosen');
socketFunctions.questionChosen = (socket, io, data) => {
    if(!game[data.pin]) return;

    setQuestionLogs(data);      // update game[pin] logs;
    sendTurnInfo(io, data);     // inform players about the new turn;
    startTurnTimer(io, data);   // set timer for the turn;
}

function setQuestionLogs(data){
    // FIND THE QUESTION - REMOVE ANSWERS WHEN SENDING TO FRONT-END
    const question = {...game[data.pin].questions.filter(q => q.value === data.value && q.category.title === data.category)[0]};
    const playerTurn = game[data.pin].playerTurn

    // REMOVE THE CURRENT VALUE FROM THE GAME.VALUES SO THAT IT WON'T BE USED AGAIN
    const questionsLeft = game[data.pin].questions.filter(q => q.id !== question.id);
    
    game[data.pin].questions = [...questionsLeft];
    game[data.pin].curQuestion = {...question};
    game[data.pin].logs[question.id].playerTurn = playerTurn;
}

function sendTurnInfo(io, data){
    const question = game[data.pin].curQuestion;
    const playerTurn = game[data.pin].playerTurn;
    const options = [...question.options.map(x => x.title)]; // can't give answers

    // SEND MESSAGE TO PLAYERS
    io.in(`${data.pin}`).emit('radio', {
        from: 'question-chosen',
        currentPlayer: playerTurn.username,
        isLive: true,
        value: question.value,
        message: 'question chosen'
    });

    // BRING THE QUESTION
    io.in(`${data.pin}`).emit('bring-question', {
        title: question.title,
        options: options,
        value: question.value,
        category: question.category.title,
        isLive: true
    });

    io.to(`${playerTurn.id}`).emit('user-turn', {from: 'question-chosen', turn: playerTurn.username, isLive: true});
}

function startTurnTimer(io, data){
    // START THE TIMER
    io.in(`${data.pin}`).emit('time-out', {
        from: 'question-chosen',
        ended: false,
        isLive: game[data.pin].isLive,
        timeout: 30
    });

    // SETOUT THE TIMER. IF TIME IS UP BEFORE THE CURRENT PLAYER ANSWERS, END IT AND PROCEED WITH THE NEXT STEP.
    game[data.pin].timeout = setTimeout(() => {
        io.in(`${data.pin}`).emit('time-out', {
            from: 'question-chosen',
            ended: true,
            isLive: game[data.pin].isLive,
            timeout: 30
        });
    }, 30100);
}


// socket.on('check-question')
socketFunctions.checkQuestion = (socket, io, data) => {
    if(!game[data.pin]) return;

    const playerTurn = game[data.pin].playerTurn;

    // CURRENT PLAYER HAS GIVEN AN ANSWER, SO WE HAVE TO CLEAR TIMER THAT STARTED WITH QUESTION-CHOSEN
    if(!data.overtime){
        clearTimeout(game[data.pin].timeout);
        io.in(`${data.pin}`).emit('time-out', {
            from: 'check-question',
            currentPlayer: playerTurn.username,
            ended: true,
            isLive: game[data.pin].isLive,
            timeout: 30
        });
    }

    const question = game[data.pin].curQuestion
    
    let option;
    let answer;
    if(data.option) {
        option = data.option;
        answer = question.options.filter(opt => opt.title === option)[0].answer;
    }

    if(answer) correctAnswer(io, data, question, option, playerTurn);
    
    else if(!answer || data.overtime) incorrectAnswer(io, data, answer, question, option, playerTurn)
}

function correctAnswer(io, data, question, option, playerTurn){
    game[data.pin].logs[question.id].answeredBy.push(data.username);
    for(player of game[data.pin].scores){
        if(player.username === playerTurn.username) player.score += question.value;
    }
    
    // SEND SCORES WHEN SOMEONE GETS THE RIGHT ANSWER.
    sendScores(io, data.pin);

    io.in(`${data.pin}`).emit('check-answers', {
        option: option,
        answer: true,
        isLive: game[data.pin].isLive
    });

    io.in(`${data.pin}`).emit('radio', {
        from: 'check-answers-true',
        isLive: game[data.pin].isLive,
        value: question.value,
        currentPlayer: playerTurn.username,
        message: `${playerTurn.username} has earned ${question.value} points!`
    });

    io.to(`${game[data.pin].creator.id}`).emit('correct-answer', {message: 'answer found', isLive: game[data.pin].isLive});
}

function incorrectAnswer(io, data, answer, question, option, playerTurn){
    // PREVENT SENDING MULTIPLE MESSAGES. NO NEED FOR MESSAGES FOR OVERTIMES
    if(playerTurn.username !== data.username) return;

    let message;
    if(!answer) message = `${playerTurn.username} could not find the correct answer. `;
    if(data.overtime) message = `Time out! ${playerTurn.username} did not answer in time. `

    io.in(`${data.pin}`).emit('check-answers', {
        currentPlayer: playerTurn.username,
        value: question.value / 2,
        option: option,
        message: message,
        answer: false,
        isLive: game[data.pin].isLive,
    });

    const canBuy = game[data.pin].scores.find(p => p.username !== data.username && p.score >= question.value / 2);

    // scores should stay here
    io.in(`${data.pin}`).emit('radio', {
        from: 'check-answers-false',
        currentPlayer: playerTurn.username,
        creator: game[data.pin].creator.username,
        isLive: game[data.pin].isLive,
        scores: game[data.pin].scores,
        value: question.value / 2,
        canBuy: !!canBuy,
        message: message
    });

    // BELOW PART ACTIVATES THE TIMEOUT FOR BUY-QUESTION SESSION FOR OTHER USERS.
    if(canBuy) setBuyTime(io, data, playerTurn);
}

function setBuyTime(io, data, playerTurn){
    io.in(`${data.pin}`).emit('time-out', {
        from: 'check-answers-false',
        currentPlayer: playerTurn.username,
        ended: false,
        isLive: game[data.pin].isLive,
        timeout: 30
    });

    game[data.pin].timeout = setTimeout(() => {
        io.in(`${data.pin}`).emit('time-out', {
            from: 'check-answers-false',
            ended: true,
            isLive: game[data.pin].isLive,
            timeout: 30,
            creator: game[data.pin].creator.username
        });
        io.to(`${game[data.pin].creator.id}`).emit('user-turn' , {
            from: 'check-answers-false',
            message: 'Time for buying questions ended.',
            isLive: game[data.pin].isLive,
        });
    }, 30100);
}



// socket.on('question-bought')
socketFunctions.questionBought = (socket, io, data) => {
    if(!game[data.pin]) return;

    const question = game[data.pin].curQuestion;
    const playerTurn = game[data.pin].playerTurn;

    if(data.bought) {
        const buyer = game[data.pin].scores.find(p => p.username === data.username);
        
        if(buyer.score >= question.value / 2){
            game[data.pin].logs[question.id].boughtBy.push(data.username);
        }
        else return; // in case of receiving some different data from front-end...
    }
    if(!data.bought) {
        game[data.pin].logs[question.id].passedBy.push(data.username);
        checkLastUser(io, data);
        return;
    }

    // SEND SCORES SINCE SCORES NEED UPDATING ON FRONT-END
    sendScores(io, data.pin);
    // send those who bought data so they can click and answer;
    userBought(io, data, question, playerTurn);
}

function userBought(io, data, question, playerTurn){
    const userId = game[data.pin].players.filter(p => p.username === data.username)[0].id;

    let message;
    for(const player of game[data.pin].scores) {
        if(player.username === data.username) {
            player.score -= question.value / 2
            message = `You now have ${player.score} points. Please choose an option.`
        }
    }

    io.to(`${userId}`).emit('radio', {
        isLive: game[data.pin].isLive,
        from: 'question-bought',
        message: message
    });

    io.to(`${userId}`).emit('user-turn', {from: 'question-bought', turn: playerTurn.username, isLive: true});
}


// socket.on('check-question-bought')
socketFunctions.checkQuestionBought = (socket, io, data) => {
    if(!game[data.pin]) return;

    const question = game[data.pin].curQuestion;
    game[data.pin].logs[question.id].answeredBy.push(data.username);
    checkLastUser(io, data);

    const checkObj = setBoughtMessage(data);

    // SEND INDIVIDUAL MESSAGE TO THE PLAYER THEMSELF
    const userId = game[data.pin].players.filter(p => p.username === data.username)[0].id;
    io.to(`${userId}`).emit('radio', {
        from: 'check-question-bought',
        answer: checkObj.answer,
        message: checkObj.message,
        isLive: true
    });
    
    // UPDATE USER SCORE BECAUSE OF A CHANGE IN THE GAME
    sendScores(io, data.pin);
}

function setBoughtMessage(data){
    const question = game[data.pin].curQuestion;
    const option = data.option;
    const answer = question.options.find(o => o.title === option).answer;

    let message;
    for(player of game[data.pin].scores){
        if(player.username === data.username) {
            if(answer){
                player.score += question.value;
                message = `The answer is correct. Now you have ${player.score} points.`
            } else {
                // message = `You failed yet another question. Now you have ${player.score} points.`
                message = 'You failed yet another question.'
            }
        }
    }
    return {message: message, answer: answer};
}

function checkLastUser(io, data){
    const question = game[data.pin].curQuestion;
    const scores = game[data.pin].scores;
    const usersCannotBuy = scores.filter(p => p.score < question.value / 2 || p.username === game[data.pin].playerTurn.username).length;
    
    const logs =  game[data.pin].logs[question.id];
    const answeredCount = logs.answeredBy.length + logs.passedBy.length + usersCannotBuy;
    const lastUser = answeredCount >= game[data.pin].players.length; // if score is not updated simultaneously, then use '==='
    
    // console.log(usersCannotBuy);
    // console.log(answeredCount);
    // console.log(game[data.pin].players.length);

    if(lastUser) allUsersClicked(io, data);
}

function allUsersClicked(io, data){
    clearTimeout(game[data.pin].timeout);
    io.in(`${data.pin}`).emit('time-out', {
        from: 'check-question-bought',
        ended: true,
        isLive: game[data.pin].isLive,
        timeout: 30,
        message: 'Buying question session is over.'
    });
    io.to(`${game[data.pin].creator.id}`).emit('user-turn' , {
        from: 'check-question-bought',
        isLive: game[data.pin].isLive
    });
}


// socket.on('next-question')
socketFunctions.nextQuestion = (socket, io, data) => {
    if(!game[data.pin]) return;
    if(game[data.pin].creator.username !== data.username) return;

    // UPDATE THE CURRENT PLAYER
    updatePlayer(data);

    // SEND SCORES TO PLAYERS
    sendScores(io, data.pin)

    // IF THERE IS NO MORE QUESTION LEFT INFORM THE PLAYERS THAT THE GAME HAS ENDED.
    if(game[data.pin].questions.length === 0){
        noQuestionsLeft(io, data);
        return;
    }

    nextQuestionIO(io, data);
}

function updatePlayer(data){
    let playerIndex = game[data.pin].playerIndex;
    if(playerIndex < game[data.pin].players.length - 1) {
        playerIndex++
    } else {
        playerIndex = 0;
    }
    game[data.pin].playerIndex = playerIndex;

    const playerTurn = game[data.pin].players[playerIndex];
    game[data.pin].playerTurn = {...playerTurn};
}

async function noQuestionsLeft(io, data){
    const playerTurn = game[data.pin].playerTurn;

    game[data.pin].isLive = false;
    io.in(`${data.pin}`).emit('radio', {
        from: 'game-ended',
        currentPlayer: playerTurn.username,
        scores: game[data.pin].scores,
        ended: true,
        message: 'Game has ended.'
    });
    const session = await gameSession.findOne({pin: data.pin});
    session.isLive = false;
    session.save();
}

function nextQuestionIO(io, data){
    const playerTurn = game[data.pin].playerTurn;
    io.in(`${data.pin}`).emit('radio', {
        from: 'next-question',
        currentPlayer: playerTurn.username,
        isLive: true,
        message: 'Choosing a value for the next question'
    });

    io.to(`${playerTurn.id}`).emit('choose-question', {isLive: true});
}



// socket.on('finish-game') 
socketFunctions.finishGame = (socket, io, data) => {
    if(!game[data.pin]) return;

    const isCreator = data.username === game[data.pin].creator.username;
    const scores = game[data.pin].scores;

    if(!game[data.pin].isLive && isCreator) {
        io.in(`${data.pin}`).emit('radio', {
            message: 'Game Ended for all users',
            isLive: game[data.pin].isLive,
            scores: scores
        });
    }
}



// socket.on('disconnect')
socketFunctions.disconnect = async (socket, io, user) => {
    try{
        // console.log(`${user.name} disconnected`);
        if(!user) return;

        if(game[user.gamePin]){
            let oldPlayerList = game[user.gamePin].players;
            var newList = oldPlayerList.filter(item => {
                return item.username !== user.name;
            });

            game[user.gamePin].players = newList;
            io.to(`${user.gamePin}`).emit('game-lobby', {playerList: game[user.gamePin].players.map(x => x.username)});
            
            if(game[user.gamePin].players.length == 0){
                io.in(`${user.gamePin}`).emit('radio', {
                    from: 'game-ended',
                    ended: true,
                    message: 'You\'re the only one left in the game to play, so we had to dispand the game. GG!',
                    scores: game[user.gamePin].scores
                })

                await gameSession.deleteOne({pin: user.gamePin}, err => {
                    if (err) console.log(err);
                });
                delete game[user.gamePin];
            };
        } else console.log('unidentified disconnect');
    } catch(ex){
        console.log('[disconnect io]', ex);
    }
}


// COMMON FUNCTIONS
function sendScores(io, pin){
    const sortedScores = game[pin].scores.sort((a, b) => b.score - a.score);
    game[pin].scores = [...sortedScores];
    io.in(`${pin}`).emit('set-scores', sortedScores);
}


exports.handleIO = socketFunctions;