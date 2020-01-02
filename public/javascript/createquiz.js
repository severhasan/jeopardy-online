document.addEventListener('DOMContentLoaded', (event) => {
    if (author && isNew) openInfoMenu('initiate create quiz');
    
    initiateCreateQuiz();
    
    document.querySelector('#add-category').onclick = function(){
        const name = document.querySelector('#setCategoryName').value;
        addCategory(name);
    }
    
    document.querySelector('#add-row').onclick = function(){
        const value = Number(document.querySelector('#row-value').value);
        addRow(value);
    }
    if(!author) {
        unauthorize();
    }
});

// const categoryList = ['science', 'geography'];

function initiateCreateQuiz(){
    const content = document.querySelector('#content');

    // CREATE THE HEAD OF THE TABLE USING THE CATEGORIES
    const categories = document.createElement('table');
    categories.setAttribute('id', 'categories');

    const headRow = document.createElement('tr');
    headRow.setAttribute('id', 'header-row');

    const infoCol = document.createElement('th');
    infoCol.setAttribute('class', 'first-info-row title-row categoryTitle width1');

    const setIcon = document.createElement('i');
    setIcon.tile = "Update or Delete Rows";
    setIcon.setAttribute('class', 'fas fa-cog iconSet');
    setIcon.onclick = function(){
        const row = document.querySelector('.selected');
        if(row) openInfoMenu('settings icon', row);
    }
    
    infoCol.appendChild(setIcon);

    headRow.appendChild(infoCol);

    categories.appendChild(headRow);
    content.appendChild(categories);

    for(const c of quizCategories){
        addCategory(c);
    }
    for(var i of quizValues){
        addRow(i)
    }
}

function titleIcons(title){
    const iconsDiv = document.createElement('div');
    iconsDiv.setAttribute('class', 'titleIcons');
    
    // UPDATE CATEGORY-TITLE BUTTON
    const updateIcon = document.createElement('i');
    updateIcon.setAttribute('class', 'update-category fas fa-edit');
    updateIcon.title = 'Update title';     // could be a pen icon instead
    updateIcon.onclick = function(){        // should open a panel where the user can edit the name of the category
        // const oldTitle = title.textContent.replace(/\s/g, '');
        const oldTitle = title.textContent;

        iconsDiv.classList.add('invisible');
        title.classList.add('editing');
        title.contentEditable = true;
        title.focus();
        
        // <i class="far fa-save"></i>
        const saveBtn = document.createElement('i');
        saveBtn.setAttribute('class', 'far fa-save saveTitle');
        saveBtn.onclick = function(){
            // const categoryName = oldTitle.replace(/\s/g, '');
            const categoryColumn = document.querySelectorAll(`[data-category="${oldTitle}"]`);
            
            // const newCategoryName = title.textContent.replace(/\s/g, '');
            const newCategoryName = title.textContent;
            for (const cell of categoryColumn) {
                // if(cell.id === oldTitle) cell.id = newCategoryName;
                cell.dataset.category = newCategoryName;
            }
            
            iconsDiv.classList.remove('invisible');
            title.classList.remove('editing');
            title.style.backgroundColor = 'inherit';
            title.contentEditable = false;
            // SAVE TO NECESSARY PLACES 
            
            this.remove();
        }
        title.parentNode.appendChild(saveBtn);
    }

    const removeCategoryIcon = document.createElement('i');
    removeCategoryIcon.setAttribute('class', 'delete-category fas fa-trash-alt');
    removeCategoryIcon.title = 'Remove entire category'
    removeCategoryIcon.onclick = function(){
        // OPEN UP A PANEL TO DELETE THE CATEGORY
        openInfoMenu('delete category', title.textContent);
        // remove category from the DB;
    };

    iconsDiv.appendChild(updateIcon);
    iconsDiv.appendChild(removeCategoryIcon);
    return iconsDiv;
}

function openInfoMenu(type, data){
    const shadow = document.createElement('div');
    shadow.setAttribute('class', 'shadow');

    const content = document.querySelector('#main-container');
    content.classList.add('blurred');

    const container = document.createElement('div');
    container.setAttribute('class', 'info-screen');

    shadow.onclick = function(e) {
        // e.stopPropagation();
        exitMenu();
    }

    // <i class="fas fa-window-close"></i>
    const cancelDiv = document.createElement('div');
    cancelDiv.setAttribute('class', 'cancel-div');

    const cancelIcon = document.createElement('i');
    cancelIcon.title = 'Exit';
    cancelIcon.setAttribute('class', 'fas fa-times-circle cancel-icon');
    cancelIcon.onclick = exitMenu;

    cancelDiv.appendChild(cancelIcon);

    const makeChangesDiv = document.createElement('div');
    makeChangesDiv.setAttribute('class', 'make-changes');

    if(type === 'initiate create quiz'){
        shadow.onclick = function(){
            exitMenu();
            openInfoMenu('adding first category');
        };
        const containerDiv = document.createElement('div');
        containerDiv.setAttribute('class', 'reminders');
        cancelIcon.onclick = () => {
            exitMenu();
            openInfoMenu('adding first category');
        }

        const welcomeText = document.createElement('h1');
        welcomeText.textContent = 'Welcome to quiz creator!';

        const reminders = document.createElement('div');
        const reminderText = document.createElement('h4');
        reminderText.textContent = 'Quick reminders for the quiz creator:';

        const reminderHelpers = document.createElement('div');
        const updateIcon = document.createElement('p');
        updateIcon.innerHTML = '<i class="fas fa-pen-square iconUpdate"/> icon will update your category or rows';

        const deleteIcon = document.createElement('p');
        deleteIcon.innerHTML = '<i class=" fas fa-trash-alt iconDelete"/> icon will delete your category or rows';


        const addCategoryDiv = document.createElement('div');
        addCategoryDiv.setAttribute('class', 'reminder-section');
        const categoryText = document.createElement('p');
        categoryText.textContent = 'You can add a new category easily. The below buttons will be located at the top and help you add a new category.';
        const mockInput = document.createElement('input');
        // mockInput.id = 'setCategoryName';
        mockInput.type = 'text';
        mockInput.placeholder = 'capitals etc...';

        const mockButton = document.createElement('button');
        mockButton.setAttribute('class', 'btn-add');
        mockButton.textContent = 'Add category';
        // mockButton.id = 'add-category';
        addCategoryDiv.appendChild(categoryText);
        addCategoryDiv.appendChild(mockInput);
        addCategoryDiv.appendChild(mockButton);

        const addRowDiv = document.createElement('div');
        addRowDiv.setAttribute('class', 'reminder-section');
        const rowText = document.createElement('p');
        rowText.textContent = 'The below buttons will be located at the bottom and help you add a new row.';

        const mockInput2 = document.createElement('input');
        // mockInput.id = 'setCategoryName';
        mockInput2.type = 'number';
        mockInput2.min = 0
        mockInput2.step = 10
        mockInput2.max = 1000;
        mockInput2.value = 10;

        const mockButton2 = document.createElement('button');
        mockButton2.setAttribute('class', 'btn-add');
        mockButton2.textContent = 'Add row';
        // mockButton.id = 'add-category';
        addRowDiv.appendChild(rowText);
        addRowDiv.appendChild(mockInput2);
        addRowDiv.appendChild(mockButton2);

        const continueBtn = document.createElement('button');
        continueBtn.setAttribute('class', 'btn btn-success')
        continueBtn.textContent = 'Understood';
        continueBtn.onclick = () => {
            exitMenu();
            openInfoMenu('adding first category');
        }

        reminderHelpers.appendChild(updateIcon);
        reminderHelpers.appendChild(deleteIcon);
        reminders.appendChild(reminderText);
        reminders.appendChild(reminderHelpers);
        
        containerDiv.appendChild(welcomeText);
        containerDiv.appendChild(reminders);
        containerDiv.appendChild(addCategoryDiv);
        containerDiv.appendChild(addRowDiv);
        containerDiv.appendChild(continueBtn);
        makeChangesDiv.appendChild(containerDiv);
    }

    const initiateRows = () => {
        for(let i = 1; i < 6; i++) {
            addRow(i*10);
        }
    }

    if(type === 'adding first category'){
        shadow.onclick = null;
        cancelIcon.onclick = () => {
            initiateRows();
            addCategory('my first category');
            exitMenu();
            // display message???
        }

        const label = document.createElement('p');
        label.textContent = 'Adding the first category';
        label.setAttribute('class', 'label-category');

        const text = document.createElement('p');
        text.textContent = 'You will be provided with 5 values of rows; however, you can always modify or delete them.'
        const text2 = document.createElement('p');
        text2.textContent = 'Let\'s start by adding our first category.';

        const categoryName = document.createElement('p');
        categoryName.setAttribute('class', 'question-title question-border');
        categoryName.setAttribute('data-placeholder', 'Name your category here');
        categoryName.contentEditable = true;
        // categoryName.focus();

        const continueBtn = document.createElement('button');
        continueBtn.setAttribute('class', 'btn btn-success');
        continueBtn.textContent = 'Create';
        continueBtn.onclick = () => {
            addCategory(categoryName.textContent);
            initiateRows();
            exitMenu();
        }

        makeChangesDiv.appendChild(label);
        makeChangesDiv.appendChild(text);
        makeChangesDiv.appendChild(text2);
        makeChangesDiv.appendChild(categoryName);
        makeChangesDiv.appendChild(continueBtn);
    }

    if(type === 'delete category') {
        const categoryInfo = document.createElement('p');
        categoryInfo.textContent = `Category: ${data.toUpperCase()}`;
        categoryInfo.setAttribute('class', 'label-category');

        const deleteText = document.createElement('p');
        deleteText.textContent = 'Are you sure you want to delete entire column?';
        
        // <i class="fas fa-undo"></i>
        const cancelDelete = document.createElement('i');
        cancelDelete.setAttribute('class', 'fas fa-undo btn-warning btn');
        cancelDelete.title = 'Turn Back';
        cancelDelete.onclick = exitMenu;
        
        // confirmDelete.textContent = 'OK';
        // cancelDelete.textContent = 'cancel';
        // <i class="fas fa-check-circle"></i> <i class="fas fa-trash-alt"></i>
        const confirmDelete = document.createElement('i');
        confirmDelete.setAttribute('class', 'fas fas fa-trash-alt btn-danger btn');
        confirmDelete.title = 'Confirm deletion';
        
        confirmDelete.onclick = async function(){
            const categoryColumn = document.querySelectorAll(`[data-category="${data}"]`);
            const cellIds = [];
            for(const cell of categoryColumn) {
                if(cell.id !== '') cellIds.push(cell.id);
            }
            const sendData = {
                type: 'delete category',
                questions: cellIds,
                category: `${data}`
            }
            const response = await deleteQuestions(sendData);

            for(const cell of categoryColumn) {
                cell.remove();
            }
            let message = `The category of ${data} has been entirely removed.`
            if (document.querySelectorAll('.category').length === 0) {
                cancelDelete.remove();
                cancelIcon.remove();
                this.style.display = 'none';
                categoryInfo.textContent = 'Setting a new one...';
                deleteText.textContent = 'You have no categories set for the quiz. Please add a new category:';
                
                const newCategory = document.createElement('p');
                newCategory.setAttribute('class', 'question-title question-border');
                newCategory.setAttribute('data-placeholder', 'Enter a new category');
                newCategory.contentEditable = true;
                newCategory.focus();
                
                makeChangesDiv.appendChild(newCategory);

                const create = document.createElement('button');
                makeChangesDiv.appendChild(create);
                create.setAttribute('class', 'btn btn-success');
                create.textContent = 'Submit';
                create.onclick = function(){
                    if(newCategory.textContent !== ''){
                        this.onclick = addCategory(newCategory.textContent);
                        exitMenu();
                    } else {
                        const hint = document.createElement('p');
                        hint.setAttribute('class', 'hint')
                        hint.textContent = 'Category cannot be empty';
                        makeChangesDiv.appendChild(hint);
                    }
                }
            } else {
                exitMenu();
            }
            displayMessage(message, 'info');
        }

        makeChangesDiv.appendChild(categoryInfo);
        makeChangesDiv.appendChild(deleteText);
        makeChangesDiv.appendChild(confirmDelete);
        makeChangesDiv.appendChild(cancelDelete);
    }
    
    if(type === 'update row value') {
        const val = data.dataset.value;

        const label = document.createElement('p');
        label.textContent = `Current Value: ${val}`;
        label.setAttribute('class', 'label-category');

        const updateText = document.createElement('p');
        updateText.textContent = 'Set a new value for the row:';

        const valueInput = document.createElement('input');
        valueInput.type = 'number';
        valueInput.value = val;
        valueInput.min = 0;
        valueInput.max = 1000;
        valueInput.step = 10;

        const saveIcon = document.createElement('i');
        saveIcon.setAttribute('class', 'fas fa-save save-icon');
        saveIcon.onclick = () => {
            updateRowValues({
                newValue: valueInput.value,
                oldValue: val
            });
        }

        makeChangesDiv.appendChild(saveIcon);
        makeChangesDiv.appendChild(updateText);
        makeChangesDiv.appendChild(label);
        makeChangesDiv.appendChild(valueInput);
    }

    if(type === 'delete row') {
        const label = document.createElement('p');
        label.textContent = `Deleting the row with the value of: ${data.dataset.value}`;
        label.setAttribute('class', 'label-category');

        const deleteText = document.createElement('p');
        deleteText.textContent = 'Are you sure you want to delete the entire row?';

        const cancelDelete = document.createElement('i');
        cancelDelete.setAttribute('class', 'fas fa-undo btn-warning btn');
        cancelDelete.title = 'Turn Back';
        cancelDelete.onclick = exitMenu;
        
        const confirmDelete = document.createElement('i');
        confirmDelete.setAttribute('class', 'fas fas fa-trash-alt btn-danger btn');
        confirmDelete.title = 'Confirm deletion';
        confirmDelete.onclick = async function(){
            // send postData to server. if okay, delete from front-end too.
            const currentRow = document.querySelectorAll(`[data-value="value${data.dataset.value}"]`);
            const cellIds = [];
            
            for(const cell of currentRow) {
                if(cell.parentNode.id !== '') cellIds.push(cell.parentNode.id);
            }

            const sendData = {
                type: 'delete row',
                questions: cellIds
            }
            const response = await deleteQuestions(sendData);

            this.style.display = 'none';
            data.remove();
            cancelDelete.remove();

            if(document.querySelectorAll('.row').length === 0){
                label.textContent = 'Create a new row';
                deleteText.textContent = 'You have run out of rows. Please insert a value for the new row before you go on:';
                
                const newValue = document.createElement('input');
                newValue.type = 'number';
                newValue.min = '0';
                newValue.max = '1000';
                newValue.step = '10';

                makeChangesDiv.appendChild(newValue);

                const create = document.createElement('button');
                makeChangesDiv.appendChild(create);
                create.setAttribute('class', 'btn btn-success');
                create.textContent = 'Submit';
                create.onclick = function(){
                    if(newValue.value !== ''){
                        this.onclick = addRow(Number(newValue.value));
                        exitMenu();
                    } else {
                        const hint = document.createElement('p');
                        hint.setAttribute('class', 'hint');
                        hint.textContent = 'Please insert a number for the row value';
                        makeChangesDiv.appendChild(hint);
                    }
                }
            } else {
                exitMenu();
            }
        }

        makeChangesDiv.appendChild(label);
        makeChangesDiv.appendChild(deleteText);
        makeChangesDiv.appendChild(confirmDelete);
        makeChangesDiv.appendChild(cancelDelete);
    }
    
    if(type === 'set question'){
        const questionTitle = document.createElement('p');
        questionTitle.setAttribute('class', 'question-title question-border');
        questionTitle.setAttribute('data-placeholder', 'Write your question here...');
        questionTitle.contentEditable = true;
        
        if(data.title){
            questionTitle.textContent = data.title;
            questionTitle.focus();
        }
        
        const currentVal = data.node.parentNode.parentNode.dataset.value;
        const currentCategory = data.node.parentNode.dataset.category;
        data.value = currentVal;
        data.category = currentCategory;


        const label = document.createElement('p');
        label.textContent = `Category: ${data.category} | Value: ${currentVal}`;
        label.setAttribute('class', 'label-category');

        const saveIcon = document.createElement('i');
        saveIcon.setAttribute('class', 'fas fa-save save-icon');
        saveIcon.onclick = () => saveQuestion(makeChangesDiv, data);

        const optionsDiv = document.createElement('div');
        optionsDiv.setAttribute('class', 'question-options options-flex'); // make this flex and use flexbox to arrange items

        for (let count = 0; count < 4; count++){
            const option = document.createElement('div');
            option.setAttribute('class', 'question-option-div'); // make this flex or use spans

            // const optionLabel = document.createElement('span');
            // optionLabel.textContent = count;
            const optionLabel = document.createElement('i');
            optionLabel.setAttribute('class', 'far fa-dot-circle option-marker');
            if(data.options) {
                if(data.options[count].answer) {
                    optionLabel.setAttribute('class', 'fas fa-check-circle option-marked');
                }
            }
            optionLabel.onclick = function(){
                setOptionMarks(optionText, optionLabel);
            }

            const optionText = document.createElement('p');
            optionText.setAttribute('class', 'question-option question-border');
            optionText.setAttribute('data-placeholder', '...');
            optionText.contentEditable = true;
            if(data.options){
                optionText.setAttribute('data-answer', data.options[count].answer);
                optionText.textContent = data.options[count].title;
            } else {
                optionText.setAttribute('data-answer', 'false');

            }

            option.appendChild(optionLabel);
            option.appendChild(optionText);
            optionsDiv.appendChild(option);
        }
        makeChangesDiv.appendChild(saveIcon);
        makeChangesDiv.appendChild(questionTitle);
        makeChangesDiv.appendChild(label);
        makeChangesDiv.appendChild(optionsDiv);
    }

    if(type === 'settings icon'){
        const buttonsDiv = document.createElement('div');
        buttonsDiv.setAttribute('class', 'settings-buttons');

        const updateDiv = document.createElement('div');

        const updateRowValue = document.createElement('i');
        updateRowValue.setAttribute('class', 'fas fa-pen update-row');
        updateRowValue.title = 'Update the row value';
        updateRowValue.onclick = function(){
            exitMenu();
            openInfoMenu('update row value', data.dataset.value);
        };
        
        const deleteDiv = document.createElement('div');

        const deleteRowIcon = document.createElement('i');
        deleteRowIcon.title = 'Delete entire row';
        deleteRowIcon.setAttribute('class', 'fas fa-trash-alt delete-row');
        deleteRowIcon.onclick = function(){
            exitMenu();
            const row = document.querySelector(`[data-value=${data}]`);
            openInfoMenu('delete row', data);
        };
        updateDiv.appendChild(updateRowValue);
        deleteDiv.appendChild(deleteRowIcon);
        buttonsDiv.appendChild(updateDiv);
        buttonsDiv.appendChild(deleteDiv);
        makeChangesDiv.appendChild(buttonsDiv);
    }

    makeChangesDiv.appendChild(cancelDiv);
    container.appendChild(makeChangesDiv);
    document.querySelector('body').appendChild(container);
    document.querySelector('body').appendChild(shadow);
}

function exitMenu(){
    document.querySelector('#main-container').classList.remove('blurred');
    document.querySelector('.shadow').remove();
    document.querySelector('.info-screen').remove();
    // content.classList.remove('blurred');
    // shadow.remove();
    // container.remove();
}

function setOptionMarks(optionText, optionLabel){
    const highlightedMarks = document.querySelectorAll('.option-highlight');
    if(highlightedMarks.length > 1) {
        for(const mark of highlightedMarks){
            mark.classList.remove('option-highlight');
        }
    }
    optionLabel.classList.toggle('fas');
    optionLabel.classList.toggle('far');
    optionLabel.classList.toggle('fa-dot-circle');
    optionLabel.classList.toggle('fa-check-circle');
    optionLabel.classList.toggle('option-marked');
    optionLabel.classList.toggle('option-marker');
    if(optionText.dataset.answer === 'true'){
        optionText.dataset.answer = 'false';
    } else {
        optionText.dataset.answer = 'true';
    }
}

function redirectLink(){
    let timerSeconds = 3;
    displayMessage('You don\'t seem to have signed in. Redirecting you to login page in: 3 seconds...', 'warning');
    setInterval(() => {
        const notificationMessage = document.querySelector('.notification-message');
        timerSeconds--;
        notificationMessage.textContent = `You don\'t seem to have signed it. Redirecting you to login page in: ${timerSeconds} seconds...`;
    }, 1000);
    window.setTimeout(() => {
        window.location.href = '/login';
    }, 3000);
}

// update or save question;
async function saveQuestion(makeChangesDiv, data){
    
    const questionTitle = document.querySelector('.question-title').textContent;
    const titleEmpty = questionTitle === '';

    let questionsEmpty = true;
    const questionOptions = [];
    for (const opt of document.querySelectorAll('.question-option')){
        if(opt.textContent !== '') questionsEmpty = false;

        questionOptions.push({title: opt.textContent, answer: opt.dataset.answer === 'true' ?true :false});
    }
    const categoryCol = document.querySelectorAll('.category');
    let categoryIndex = 0;
    for(let i in categoryCol){
        if(categoryCol[i] === data.node.parentNode) {
            categoryIndex = i;
        }
    };
    
    const questionData = {
        quizId: quizData.id,
        id: data.id,
        title: questionTitle,
        category: {
            title: data.category,
            column: categoryIndex,
        },
        value: Number(data.value),
        options: questionOptions
    }

    const optionMarked = document.querySelector('[data-answer=true]');
    let noOptionMarked = false;
    if(!optionMarked) {
        const oldHint = document.querySelector('.hint');
        if(oldHint) {
            oldHint.textContent = 'You can choose answers by clicking on the markers next to the options.'
        } else {
            const hint = document.createElement('p');
            hint.setAttribute('class', 'hint')
            hint.textContent = 'You can choose answers by clicking on the markers next to the options.';
            makeChangesDiv.appendChild(hint);
        }
        document.querySelectorAll('.option-marker').forEach(opt => {
            opt.classList.add('option-highlight');
        });
        noOptionMarked = true;
    }

    const feedback = questionFeedback(titleEmpty, questionsEmpty, noOptionMarked);
    if(!feedback) return;
    
    if(data.function === 'update') questionData.type = 'question'; // needed for backend
    const response = await postData('/quiz/' + quizData.id + data.link, questionData, data.method);
    
    if(response.err) {
        displayMessage('Your question could not be saved.', 'warning');
    } else {
        if(quizData[`"${data.category}"`]){
            // replace the new question with the old one using it's id
            if(data.function === 'update') {
                quizData[`"${data.category}"`].map(item => item._id === response.id ? {...questionData} : item);
            }
            if(data.function === 'add') {
                questionData.id = response.id;
                data.node.parentNode.setAttribute('id', response.id);
                
                quizData[`"${data.category}"`].push(questionData);
            }
        } else {
            quizData[`"${data.category}"`] = [questionData];
        }
        displayMessage('Successfully saved', 'info');

        updateQuestionButton(data.node.nextElementSibling.firstChild, {
            node: data.node,
            link: '/update',
            function: 'update',
            method: 'PUT',
            category: data.category,
            id: response.id,
            value: Number(data.value),
            title: questionTitle,
            options: questionOptions
        });
        exitMenu();
    }
};

function questionFeedback(title, options, marks){
    let message;
    if(title && options && marks) message = 'All your inputs are empty. Why save? :)';
    else if(title) message = 'Please do not leave title blank.';
    else if(options) message = 'Please do not leave any option blank.';
    else if(marks) message = 'Please choose at least one answer for the question.';

    if(message) {
        displayMessage(message, 'warning');
        return;
    } else return true;
}

// update row values;
async function updateRowValues(data){
    // change data-values and text-contents with the new value
    
    const currentValues = document.querySelectorAll(`[data-value=value${data.oldValue}]`);
    const newValues = document.querySelectorAll(`[data-value=value${data.newValue}]`);

    if(newValues.length > 0){
        const message = 'You already have a row with the selected value';
        return displayMessage(message, 'warning');
    }
    const questionsIds = [];
    currentValues.forEach(node => {
        if(node.parentNode.id !== '') questionsIds.push(node.parentNode.id);
    });
    
    data.type = 'update row';
    data.quizId = quizData.id;
    data.questions = questionsIds;
    data.value = Number(data.newValue);
    data.link = '/update';
    data.method = 'PUT';
    
    let response = {};
    if(questionsIds.length > 0) {
        response = await postData('/quiz/' + quizData.id + data.link, data, data.method);
    }
    
    // change row's datavalue in case of future changes.
    if(response.err){
        displayMessage('New values could not be set.', 'warning');
    } else {
        document.querySelector(`[data-value="${data.oldValue}"]`).dataset.value = data.newValue;
        for (const value of currentValues) {
            value.textContent = data.newValue;
            value.dataset.value = `value${data.newValue}`

            if(value.parentNode.id !== '') {
                const category = value.parentNode.dataset.category;
                quizData[`"${category}"`].map(question => question.value === Number(data.oldValue) ?question.value = Number(data.newValue) :question);
            }
        }
        displayMessage('Row successfully updated', 'info');
        exitMenu();
    }
}

async function deleteQuestions(data){
    // DO SOME CLEANING
    data.quizId = quizData.id;
    data.link = '/delete';
    data.method = 'DELETE';

    const response = await postData('/quiz/' + quizData.id + data.link, data, data.method);

    if(response.err){
        displayMessage(response.err, 'warning');
    } else if(response.message){
        if(data.type === 'delete category') {
            delete quizData[`"${data.category}"`];
        } else if(data.type === 'delete row') {
            // change row's datavalue in case of future changes.
            const categories = [];
            document.querySelectorAll('.category').forEach(c => {
                categories.push(c.dataset.category);
            });
            for(const c of categories){
                const updatedCategory = quizData[`"${c}"`].map(q => q.value !== data.value);
                quizData[`"${c}"`] = [...updatedCategory];
            }
        }
        displayMessage('Rows successfully deleted', 'info');
    }
}

function addRow(val){
    if(!val) return displayMessage('Please select a value for the question', 'warning');

    if(val > 1000 || val < 1) return displayMessage('We have restricted the maximum limit to the numbers between 0 and 1000 for this quiz type', 'info');

    const allRowValues = document.querySelectorAll('.question-value');
    for (const i of allRowValues){
        if(val === Number(i.textContent)){
            const message = 'You already have a row with the selected value';
            // highlight the necessary row;

            return displayMessage(message, 'warning');
        }
    }

    const newRow = document.createElement('tr');
    newRow.setAttribute('class', 'row');
    newRow.setAttribute('data-value', val);

    const rowInfo = document.createElement('td');
    rowInfo.setAttribute('class', 'width1 row-height info-row borderBottom');
    newRow.appendChild(rowInfo);
    rowInfo.onclick = function(){
        const oldSelectedRow = document.querySelector('.selected');
        if(oldSelectedRow && oldSelectedRow !== newRow) oldSelectedRow.classList.remove('selected');
        newRow.classList.toggle('selected');
    }

    rowInfo.onmouseover = function(){
        newRow.classList.add('highlighted');
    }
    rowInfo.onmouseout = function(){
        newRow.classList.remove('highlighted');
    }

    const buttonsDiv = document.createElement('div');
    buttonsDiv.setAttribute('class', 'flex-column');
    // add the buttons // fas fa-pen-square
    const updateRowValue = document.createElement('i');
    updateRowValue.setAttribute('class', 'fas fa-pen update-row funnyicon');
    updateRowValue.title = 'Update the row value';
    updateRowValue.onclick = function(e){
        e.stopPropagation();
        openInfoMenu('update row value', newRow);
    };

    // <i class="fas fa-times-circle btn btn-danger btn-lg"></i>
    const deleteRowIcon = document.createElement('i');
    deleteRowIcon.title = 'Delete entire row';
    deleteRowIcon.setAttribute('class', 'fas fa-trash-alt delete-row funnyicon');
    deleteRowIcon.onclick = function(e){
        e.stopPropagation();
        openInfoMenu('delete row', newRow);
    };

    // append buttons
    buttonsDiv.appendChild(updateRowValue);
    buttonsDiv.appendChild(deleteRowIcon);
    rowInfo.appendChild(buttonsDiv);

    const categoryColumns = document.querySelectorAll('.category');
    for (const col of categoryColumns){
        addCell(newRow, val, col.dataset.category);
    }

    document.querySelector('#categories').appendChild(newRow);
}

function addCell(parentNode, value, categoryName){
    const cell = document.createElement('td');
    cell.setAttribute('class', 'width4 row-height category-row borderLeft borderBottom');
    // cell.setAttribute('data-category', dataName.replace(/\s/g, ''));
    cell.setAttribute('data-category', categoryName);
    if(quizData[`"${categoryName}"`]) {
        for(const question of quizData[`"${categoryName}"`]){
            if(question.value === value) {
                cell.setAttribute('id', question.id);  
            }
        }
    }
    
    const cellValue = document.createElement('p');
    cellValue.setAttribute('class', 'question-value');
    cellValue.textContent = value;
    cellValue.setAttribute('data-value', `value${value}`);
    
    // <i class="fas fa-plus-circle"></i>
    // create.textContent = 'Create';
    // const createContainer = document.createElement('div');
    // createContainer.setAttribute('class', 'icon-white-bg');
    
    const createDiv = document.createElement('div');
    createDiv.setAttribute('class', 'white-circle question-button');

    const create = document.createElement('i');
    let questionTitle;
    let questionOptions;
    if(quizData[`"${categoryName}"`]) {
        quizData[`"${categoryName}"`].forEach(question => {
            if(question.value === value) {
                questionTitle = question.title;
                questionOptions = [...question.options];
            }
        });
    }

    if(cell.id) {
        createDiv.setAttribute('class', 'question-button');
        create.setAttribute('class', 'fas fa-edit update-category funnyicon2');
        updateQuestionButton(create, {
            node: cellValue,
            link: '/update',
            function: 'update',
            method: 'PUT',
            category: categoryName,
            id: cell.id,
            value: value,
            title: questionTitle,
            options: questionOptions
        });
    } else {
        create.onclick = () => openInfoMenu('set question', {
            node: cellValue,
            link: '/question',
            function: 'add',
            method: 'POST'
        });
        create.setAttribute('class', 'fas fa-plus-circle funnyicon2');
        create.title = 'Add a new question';
    }
    
    createDiv.appendChild(create);
    cell.appendChild(cellValue);
    cell.appendChild(createDiv);

    parentNode.appendChild(cell);
}

function updateQuestionButton(cellBtn, data){
    cellBtn.onclick = () => openInfoMenu('set question', data);
    cellBtn.setAttribute('class', 'fas fa-edit update-category funnyicon');
    cellBtn.title = 'Edit the question';
}

function addCategory(title){
    if(title === ''){
        document.querySelector('#setCategoryName').focus();
        return displayMessage(`Category name cannot be blank :)`, 'warning');
    }

    const titleList = document.querySelectorAll('th');
    for(const t of titleList) {
        if(t.dataset.category === title){
            return displayMessage(`You already have a category named ${title}`, 'warning');
        }
    }
    // create a new header
    const newCategory = document.createElement('th');
    // newCategory.setAttribute('id', categoryId);

    newCategory.setAttribute('class', 'category title-row categoryTitle width4 borderLeft');
    newCategory.setAttribute('data-category', title);

    categoryTitle = document.createElement('p');
    categoryTitle.textContent = title;

    newCategory.appendChild(titleIcons(categoryTitle));
    newCategory.appendChild(categoryTitle);
    document.querySelector('#header-row').appendChild(newCategory);

    // Configure Category Column for Values
    const rowList = document.querySelectorAll('.row');
    for (row of rowList){
        addCell(row, row.dataset.value, title);
    }

    // highlight the whole column
    newCategory.onmouseover = function(){
        document.querySelectorAll('.category-row').forEach(cell => {
            if(cell.dataset.category === this.dataset.category) {
                cell.classList.add('highlighted');
            }
        });
    }
    newCategory.onmouseout = function(){
        document.querySelectorAll('.category-row').forEach(cell => {
            if(cell.dataset.category === this.dataset.category) {
                cell.classList.remove('highlighted');
            }
        });
    }
}

async function postData(url = '', data = {}, type) {
    const response = await fetch(url, {
        method: type, // *GET, POST, PUT, DELETE, etc.
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
    

    if(response.redirect){
        redirectLink();
    }
    return response; // parses JSON response into native JavaScript objects
}

// refactor later
function unauthorize(){
    // remove buttons
    document.querySelectorAll('.question-button').forEach(btn => {
        btn.remove();
    });
    
    document.querySelectorAll('.width1').forEach(info => {
        info.remove();
    });

    document.querySelectorAll('.titleIcons').forEach(div => {
        div.remove();
    });
    
    document.querySelector('#form').remove();
    document.querySelector('#new-row').remove();
}