const socket = io();

socket.on('connect-user', data => {
    // change message;
    const pin = document.querySelector('#pin');
    const username = document.querySelector('#username');
    const message = document.querySelector('#message');
    message.textContent = data.message;
    if(data.next){
        username.classList.remove('invisible');
        pin.classList.add('almost-full-transparent');
        pin.contentEditable = 'false';
    }

    if(data.permission){
        document.querySelector('#form-username').value = username.textContent;
        document.querySelector('#form-pin').value = pin.textContent;
        document.querySelector('#form-submit').click();
    }
});

document.querySelector('#submit').onclick = function(){
    const pin = document.querySelector('#pin');
    const username = document.querySelector('#username');
    socket.emit('connect-to-game', {username: username.textContent, pin: pin.textContent});
}