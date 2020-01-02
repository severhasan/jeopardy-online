function displayMessage(msg, type){
    const oldNotification = document.querySelector('#notification');

    if(oldNotification){
        if (document.querySelector('.notification-message').textContent === msg) return;
        oldNotification.classList.remove('fade-in-out');
        oldNotification.classList.add('fade-out');
        setTimeout(() => {
            oldNotification.remove();
            displayMessage(msg, type);
        }, 400);
        return;
    }

    const notification = document.createElement('div');
    notification.setAttribute('id', 'notification');
    notification.setAttribute('class', 'fade-in-out');

    const message = document.createElement('div');
    message.setAttribute('class', `notification-message ${type}`);
    message.textContent = msg;

    notification.appendChild(message);
    document.querySelector('body').appendChild(notification);

    const deleteMessageDiv = document.createElement('div');
    deleteMessageDiv.setAttribute('class', 'icon-white-bg');

    const deleteMessage = document.createElement('i');
    deleteMessage.title = 'Close Notification';
    deleteMessage.setAttribute('class', 'fas fa-times-circle delete-message funnyicon2');
    deleteMessage.onclick = () => notification.remove();

    deleteMessageDiv.appendChild(deleteMessage);
    message.appendChild(deleteMessageDiv);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}