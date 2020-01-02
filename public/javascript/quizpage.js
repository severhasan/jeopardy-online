// NEEDS REFACTORING
const data = {};
function proceed(type, id){
    const shadow = document.createElement('div');
    shadow.setAttribute('class', 'shadow');

    const content = document.querySelector('#container-quiz');
    content.classList.add('blurred');

    const container = document.createElement('div');
    container.setAttribute('class', 'info-screen');

    container.onclick = function(e) {
        if(e.target !== this) return;
        e.stopPropagation();
        exitMenu();
    }

    const exitMenu = () => {
        // Save to data;
        data.title = document.querySelector('.title-input').textContent;
        data.tags = [];
        for (const tag of document.querySelectorAll('.tag-text')){
            tag.textContent
            data.tags.push(tag.textContent);
        }

        content.classList.remove('blurred');
        shadow.remove();
        container.remove();
    }

    const makeChangesDiv = document.createElement('div');
    makeChangesDiv.setAttribute('class', 'make-changes');

    const label = document.createElement('p');
    label.setAttribute('class', 'label-category');

    const cancelDiv = document.createElement('div');
    cancelDiv.setAttribute('class', 'cancel-div');

    const cancelIcon = document.createElement('i');
    cancelIcon.title = 'Exit';
    cancelIcon.setAttribute('class', 'fas fa-times-circle cancel-icon');
    cancelIcon.onclick = exitMenu;

    cancelDiv.appendChild(cancelIcon);

    const titleLabel = document.createElement('div');
    titleLabel.setAttribute('class', 'input-label');

    const title = document.createElement('p');
    title.setAttribute('class', 'title-input question-title question-border');
    title.contentEditable = true;

    const submit = document.createElement('button');
    submit.setAttribute('id', 'submit-quiz')
    submit.textContent = 'Submit';

    if(type === 'create'){
        label.textContent = 'Creating a quiz...';
        titleLabel.textContent = 'Quiz Title:';
        title.setAttribute('data-placeholder', 'Type a quiz title here');


        if(data.title) {
            title.textContent = data.title;
        }
        const inputsLabel = document.createElement('div');
        inputsLabel.setAttribute('class', 'input-label');
        inputsLabel.textContent = 'Insert tags:'
    
        const inputs = document.createElement('div');
        inputs.setAttribute('class', 'display-flex');
    
        const tagInput = document.createElement('p');
        tagInput.setAttribute('data-placeholder', 'science etc');
        tagInput.setAttribute('class', 'tag-input question-title question-border');
        tagInput.contentEditable = true;
        
        const tags = document.createElement('div');
        tags.setAttribute('class', 'tags');
    
        if(data.tags){
            for(const tag of data.tags){
                tags.appendChild(createTag(tag));
            }
        }
        
        const tagSubmit = document.createElement('button');
        tagSubmit.textContent = 'Add tag';
        tagSubmit.onclick = function(){
            const tagText = tagInput.textContent.trim().replace(/\s\s+/g, ' ');
            if(tagText === '') return false // displayMessage?
            
            const allTags = document.querySelectorAll('.tag-text');
            for (const t of allTags) {
                if(t.textContent === tagText) return // displayMessage
            }
            
            const tag = createTag(tagText);
            tags.appendChild(tag);
            tagInput.textContent = '';
        }
        
        inputs.appendChild(tagInput);
        inputs.appendChild(tagSubmit);
    
        submit.onclick = async function(){
            try {
                if((title.textContent).trim().length < 1) return // displayMessage ('should be at least one character');
                
                // send a post request to save the quiz and redirect to quizID
                const allTags = []
                document.querySelectorAll('.tag-text').forEach(tag => {
                    allTags.push(tag.textContent);
                })
                const itemSent = {
                    title: title.textContent,
                    tags: allTags,
                }
                
                const data = await postData(`/quiz/create/quiz`, itemSent);
                console.log(data);
    
                const quizId = data.id; // USE FOR REDIRECTING
                
                let msg = 'Successfully saved to the DB';
                if(data.err){
                    msg = data.err;
                } else {
                    let count = 5;
                    console.log(quizId);
                    window.setTimeout(() => {
                        window.location.href = '/quiz/' + quizId;
                    }, 5000);
    
                    label.textContent = `Redirecting in ${count} seconds`;
                    const timer = setInterval(() => {
                        count--;
                        label.textContent = `Redirecting in ${count} seconds`;
                        if(count === 0) clearInterval(timer);
                    }, 1000);
                }
                console.log(msg);
            } catch (error) {
                console.error(error);
                // saved.textContent = 'Something went wrong/Network error'
            }
        }
        makeChangesDiv.appendChild(inputsLabel);
        makeChangesDiv.appendChild(inputs);
        makeChangesDiv.appendChild(tags);
    }

    else if (type === 'play'){
        label.textContent = 'Setting up the game...';
        titleLabel.textContent = 'Enter username for the game:';
        title.setAttribute('data-placeholder', 'Username');
        
        if(user){
            title.textContent = user;
        }
        
        const form = document.createElement('form');
        form.setAttribute('class', 'invisible');
        form.method = 'POST';
        form.action = '/quiz';
        
        const quizId = document.createElement('input');
        quizId.type = 'hidden';
        quizId.name = 'quizId';

        const username = document.createElement('input');
        username.type = 'hidden';
        username.name = 'username';

        const btn = document.createElement('button');

        form.appendChild(quizId);
        form.appendChild(username);
        form.appendChild(btn);

        document.querySelector('body').appendChild(form);
        
        submit.onclick = function(){
            const titleText = document.querySelector('.title-input').textContent;
            if(titleText === '') {
                titleLabel.textContent = 'Username cannot be empty.'
            } else {
                quizId.value = id;
                username.value = document.querySelector('.title-input').textContent;
                btn.click();
            }
        }
    }
    

    makeChangesDiv.appendChild(label);
    makeChangesDiv.appendChild(titleLabel);
    makeChangesDiv.appendChild(title);
    makeChangesDiv.appendChild(submit);

    makeChangesDiv.appendChild(cancelDiv);
    container.appendChild(makeChangesDiv);
    document.querySelector('body').appendChild(container);
    document.querySelector('body').appendChild(shadow);
}

function createTag(text){
    const tag = document.createElement('div');
    tag.setAttribute('class', 'tag');
    
    const tagText = document.createElement('span');
    tagText.setAttribute('class', 'tag-text');
    tagText.textContent = text;

    const deleteDiv = document.createElement('div');
    deleteDiv.setAttribute('class', 'delete-tag');
    
    const deleteTag = document.createElement('i');
    deleteTag.setAttribute('class', 'fas fa-times-circle cancel-icon');
    deleteTag.onclick = function(){
        tag.remove();
    }
    deleteDiv.appendChild(deleteTag);
    tag.appendChild(tagText);
    tag.appendChild(deleteDiv);
    return tag;
}


async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
        .then(function(response){
            return response.json()
        }).then(function(body){
            //console.log(body);
            return body;
        });
    return response; // parses JSON response into native JavaScript objects
}