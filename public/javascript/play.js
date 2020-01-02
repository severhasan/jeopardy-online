document.addEventListener('DOMContentLoaded', (event) => {
    socket.emit('player-add', {pin: pin, username: player});
});

let timer;
const socket = io();
socket.on('creator-play', data => {
    let div = document.createElement('div');
    div.setAttribute('id', 'play');

    let btn = document.createElement('button');
    btn.setAttribute('id', 'playButton');
    btn.setAttribute('class', 'btn btn-info');
    btn.textContent = 'Play'
    btn.addEventListener('click', e=>{
        e.preventDefault();
        initiate();
    });
    div.appendChild(btn);
    document.querySelector('#game-info').appendChild(div);
})

socket.on('game-lobby', data => {
    setPlayers(data.playerList);
});

socket.on('radio', data => {
    setMessage(data)
    if (data.from === 'next-question'){
        exitMenu();
        mutePreviousQuestion();
    } else if (data.from === 'check-answers-false') {
        wrongAnwer(data);
    } else if (data.from === 'game-ended') {
        exitMenu();
        bringScores(data);
    }
});

socket.on('set-scores', data => {
    updateScoreTable(data);
});

socket.on('bring-question', data =>{
    syncScreens('question-chosen', data);
    bringQuestion(data);
});

socket.on('choose-question', () => {
    const cells = document.querySelectorAll('.question-active');
    for(const cell of cells){
        cell.classList.add('active');
        cell.onclick = function(){
            const value = Number(this.parentNode.dataset.value);
            socket.emit('question-chosen', {category: this.dataset.category, value: value, pin: pin, username: player});
            questionChosen(cells);
        }
    }
});

socket.on('user-turn', data => {
    if(data.from === 'question-chosen' ){
        const options = document.querySelectorAll('.question-option-div');
        setTimeout(() => {
            chooseOption(options, 'check-question');
        }, 100);
    }
    else if(data.from === 'question-bought') {
        const options = document.querySelectorAll('.option-active');
        chooseOption(options, 'check-question-bought');
    } else if(data.from === 'check-question-bought' || data.from === 'check-answers-false'){
        proceed(data);
    }
});

socket.on('correct-answer', data => {
    proceed(data);
});

socket.on('check-answers', data => {
    syncScreens('check-answers', data);
});

socket.on('game-live', data => {
    document.querySelector('#game-info').remove();
    
    initiateQuiz(data.categories, data.values);

    createScoreTable(data.scores)
});

socket.on('time-out', data => {
    const allOptions = document.querySelectorAll('.question-option-div');
    if(data.ended){
        timeRunningOut('ended');
        nullifyOptionClicks(allOptions);

        clearInterval(timer);
        document.querySelector('.timer-seconds').textContent = 'Session is over.'
        document.querySelector('#time').classList.add('full-transparent');
        // continue with the next question OR DISPLAY SCORES?
    } else {
        setTimer(data);
    }
});

function setMessage(data){
    const message = document.querySelector('.info-text');
    message.textContent = data.message;

    const btnBuy = document.querySelector('.buy-question');
    const btnCancel = document.querySelector('.cancel-question');
    if(btnBuy) btnBuy.remove();
    if(btnCancel) btnCancel.remove();

    if (data.from === 'game-live') {
        message.textContent = player === data.currentPlayer
            ?`Lucky, you! You will start the game. Choose a value for the next question.`
            :`${data.currentPlayer} is choosing a question`;
    }

    else if (data.from === 'next-question') {
        if(player === data.currentPlayer) message.textContent = 'Choose a value for the next question.';
        else message.textContent = `${data.currentPlayer} is choosing a question.`;
    }
    else if (data.from === 'question-chosen') {
        if(player === data.currentPlayer) message.textContent = `Please answer the question below.`;
        else message.textContent = `${data.currentPlayer} is answering the question.`;
    } else if (data.from === 'check-answers-true' && player === data.currentPlayer) {
        message.textContent = `You have earned ${data.value} points!`;
    }
    
}

function createScoreTable(scores){
    document.querySelector('#scorelist').classList.remove('invisible');

    const table = document.createElement('div');
    table.setAttribute('class', 'score-table');

    for(let idx = 0; idx < scores.length; idx++){
        const row = document.createElement('div');
        row.setAttribute('class', 'score-row');

        const playerName = document.createElement('span');
        playerName.setAttribute('class', 'table-player');
        playerName.textContent = `${idx + 1}. ${scores[idx].username}`;

        const scoreSpan = document.createElement('span');
        scoreSpan.setAttribute('class', 'table-score');
        scoreSpan.textContent = scores[idx].score;

        if(player === scores[idx].username){
            row.setAttribute('class', 'player-self');
        }

        row.appendChild(playerName);
        row.appendChild(scoreSpan);
        table.appendChild(row);
    }
    const tableDiv = document.querySelector('.table-div');
    tableDiv.appendChild(table);
    
    document.querySelector('#score-info').onclick = function(){
        tableDiv.classList.toggle('collapsed');
        tableDiv.classList.toggle('expanded');
    }
    return table;
}

function updateScoreTable(scores){
    const playerCells = document.querySelectorAll('.table-player');
    const scoreCells = document.querySelectorAll('.table-score');
    for(let i = 0; i < playerCells.length; i++){
        if(player === scores[i].username) {
            playerCells[i].parentNode.classList.add('player-score');
            document.querySelector('#score-info').innerHTML = `<i class='far fa-list-alt'></i> Score: ${scores[i].score}`
        } else {
            playerCells[i].parentNode.classList.remove('player-score');
        }
        playerCells[i].textContent = `${i + 1} ${scores[i].username}`;
        scoreCells[i].textContent = scores[i].score;
    }
}

function wrongAnwer(data){
    // const options = document.querySelectorAll('.question-option');
    // for(const opt of options){
    //     if(opt.textContent === data.option) {
    //         console.log('here')
    //         opt.parentNode.classList.remove('option-div-highlight');
    //         opt.parentNode.classList.remove('option-active');
    //         opt.parentNode.classList.add('wrong-option');
    //         opt.parentNode.classList.add('transparent');
    //         opt.parentNode.setAttribute('data-choise', 'false');
    //     }
    // }
    const message = document.querySelector('.info-text');
    let playerMessage = 'You have failed. Better luck next time.';
    if(data.canBuy){
        playerMessage = `You have failed. Your friends will be given a chance to buy the question for ${data.value} points`;
    } else {
        if(player === data.creator) proceed(data)
    }

    if(player === data.currentPlayer){
        message.textContent = playerMessage;
    } else {
        const score = data.scores.find(p => p.username === player).score
        const canBuy = score >= data.value;
        if(canBuy){
            buyQuestion(message);
            message.textContent += `Would you like to buy the question for ${data.value} points?`
        }
        else message.textContent = data.message + `You need ${data.value - score} points more to buy the question.`;
    }
}

function buyQuestion(message){
    const btnAccept = document.createElement('button');
    btnAccept.setAttribute('class', 'btn-success buy-question');
    btnAccept.textContent = 'YES';

    const btnCancel = document.createElement('button');
    btnCancel.setAttribute('class', 'btn-danger cancel-question');
    btnCancel.textContent = 'NO';

    btnAccept.onclick = function(){
        socket.emit('question-bought', {bought: true, pin: pin, username: player});
        message.textContent = '...';

        nullifyBtns(btnAccept, btnCancel);
    }
    btnCancel.onclick = function(){
        socket.emit('question-bought', {bought: false, pin: pin, username: player});
        message.textContent = 'We understand that not every question is easy. Good luck with the next one.';
        
        nullifyBtns(btnAccept, btnCancel);
    }
    message.parentNode.appendChild(btnAccept);
    message.parentNode.appendChild(btnCancel);
}

function nullifyOptionClicks(options){
    for(opt of options){
        opt.onclick = null;
        opt.classList.add('transparent');
        opt.classList.add('option-disabled');
        opt.classList.remove('option-div-highlight');
    }
}

function nullifyBtns(btn1, btn2){
    btn1.classList.add('option-disabled');
    btn2.classList.add('option-disabled');
    btn1.classList.add('transparent');
    btn2.classList.add('transparent');
    
    btn1.onclick = null;
    btn2.onclick = null;
}

function setPlayers(playerList){
    const mainDiv = document.querySelector('#player-list');
    
    const oldPlayers = document.querySelector('#players');
    if(oldPlayers) oldPlayers.remove();

    const players = document.createElement('div');
    players.setAttribute('id', 'players');
    mainDiv.appendChild(players);

    for(const i of playerList){
        const p = document.createElement('p');
        p.textContent = i;
        p.setAttribute('class', 'player');
        players.appendChild(p);
    }
}

function initiate(){
    socket.emit('start-game', {pin: pin, username: player});
}

function setTimer(data){
    const timeDiv = document.querySelector('#time');
    const timerCount = document.querySelector('.timer-seconds');
    const hr = document.querySelector('.timer-hr');

    timeDiv.classList.remove('full-transparent');
    hr.style.width = '100%';
    let hrwidth;

    let count = data.timeout
    const decrease = 100 / count;
    timerCount.innerHTML = `<span class='big-font'>${count}</span> seconds`;
    timer = setInterval(() => {
        hrwidth = Number(hr.style.width.match(/(\d+)/g)[0]);
        hrwidth -= decrease;
        hr.style.width = `${hrwidth}%`
        count--;
        timerCount.textContent = `${count} seconds`;
        
        if(count === 5) {
            timeRunningOut('running out');
        }

        if(count === 0) {
            timeRunningOut('ended');
            clearInterval(timer);
            timerCount.textContent = `Time ended.`;
            hr.style.width = '0%';

            const allOptions = document.querySelectorAll('.question-option-div');
            nullifyOptionClicks(allOptions);
            resetTimerInterval(data)
        }
    }, 1000);
}

function timeRunningOut(type){
    if(type === 'running out'){
        document.querySelector('#time').classList.add('running-out');
        document.querySelector('#time').classList.remove('time-flexible');
        
        document.querySelector('.timer-hr').classList.add('hr-running-out');
        document.querySelector('.timer-hr').classList.remove('hr-flexible');
    } else {
        document.querySelector('#time').classList.add('time-flexible');
        document.querySelector('#time').classList.remove('running-out');
        
        document.querySelector('.timer-hr').classList.add('hr-flexible');
        document.querySelector('.timer-hr').classList.remove('hr-running-out');
    }
}

function resetTimerInterval(data){
    if(data.from === 'question-chosen') {
        setTimeout(() => {
            socket.emit('check-question', {overtime: true, pin: pin, username: player});
        }, 1000);
    } else if(data.from === 'check-answers-false' && player !== data.currentPlayer) {
        document.querySelector('.info-text').textContent = 'Time\'s up. You haven\'t answered the question.';
        document.querySelector('.buy-question').remove();
        document.querySelector('.cancel-question').remove();
    }
}

function proceed(data){
    const screen = document.querySelector('.make-changes2');
    const nextBtn = document.createElement('button');
    screen.appendChild(nextBtn);
    
    nextBtn.setAttribute('id', 'next');
    nextBtn.setAttribute('class', 'btn btn-success');

    nextBtn.textContent = data.ended ?'End the Game' :'Next';

    // CHANGE DATA.ISLIVE LOGIC // now it's data.ended
    nextBtn.onclick = data.ended
    ?function(){
        finishGame();
    }
    :function(){
        socket.emit('next-question', {pin: pin, username: player});
    }
}

function syncScreens(type, data){
    if(type === 'question-chosen'){
        // from bring question
        document.querySelector('#categories').classList.add('transparent');
        const cells = document.querySelectorAll(`[data-value=value${data.value}]`);
        
        for(const cell of cells){
            if(cell.parentNode.dataset.category === data.category){
                cell.parentNode.classList.add('current-question');
            }
        }
    } else if (type === 'check-answers'){
        const options = document.querySelectorAll('.question-option-div p');
        for(const opt of options){
            if(opt.textContent === data.option){
                if(data.answer){
                    opt.parentNode.classList.add('correct-option');
                } else {
                    opt.parentNode.classList.add('wrong-option');
                    opt.parentNode.classList.add('option-disabled');
                    opt.parentNode.classList.remove('option-div-highlight');
                    opt.parentNode.classList.remove('option-active');

                    opt.parentNode.classList.add('transparent');    // necessary?
                    opt.parentNode.setAttribute('data-choise', 'false');
                }
            }
        }
    }
}

function bringQuestion(data){
    questionMenu('bring question', data);
}

function mutePreviousQuestion(){
    const currentQuestion = document.querySelector('.current-question');
    if(currentQuestion){
        document.querySelector('#categories').classList.remove('transparent');
        currentQuestion.classList.remove('current-question');
        currentQuestion.classList.remove('question-active');
        currentQuestion.classList.add('transparent');
        currentQuestion.classList.add('question-disabled');
    }
}

function chooseOption(opts, whereTo){
    opts.forEach(o => {
        if(o.dataset.choice === 'false') return;
        o.classList.add('option-div-highlight');
        o.classList.remove('option-disabled');
        o.classList.remove('transparent');
        o.onclick = function(){
            this.classList.add('selected-option');
            socket.emit(whereTo, {option: this.textContent, pin: pin, username: player});
            choiceMade(opts);
        };
    });
}

// used to nullify for question options and question values
function choiceMade(nodes){
    nodes.forEach(item =>{
        item.classList.remove('option-div-highlight');
        item.classList.add('option-disabled');
        item.onclick = null;
    });
}

function questionChosen(nodes){
    nodes.forEach(item =>{
        item.classList.remove('active');
        item.onclick = null;
    });
}

function finishGame(){
    socket.emit('finish-game', {pin: pin, username: player})
}

function bringScores(data){
    questionMenu('bring scores', data)
}