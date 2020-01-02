function initiateQuiz(quizCategories, quizValues){
    const content = document.querySelector('#content');

    // CREATE THE HEAD OF THE TABLE USING THE CATEGORIES
    const categories = document.createElement('table');
    categories.setAttribute('id', 'categories');

    const headRow = document.createElement('tr');
    headRow.setAttribute('id', 'header-row');

    categories.appendChild(headRow);
    content.appendChild(categories);

    for(const c of quizCategories){
        addCategory(c);
    }
    for(var i of quizValues){
        addRow(i)
    }
}

function addCategory(title){
    const newCategory = document.createElement('th');
    // newCategory.setAttribute('id', categoryId);

    newCategory.setAttribute('class', 'category title-row categoryTitle width4 borderLeft');
    newCategory.setAttribute('data-category', title);

    categoryTitle = document.createElement('p');
    categoryTitle.textContent = title;

    newCategory.appendChild(categoryTitle);
    document.querySelector('#header-row').appendChild(newCategory);
}

function addCell(parentNode, value, categoryName){
    const cell = document.createElement('td');
    cell.setAttribute('class', 'width4 question-active row-height category-row borderLeft borderBottom');
    cell.setAttribute('data-category', categoryName);
    // cell.setAttribute('id', id); // or just use categoryName & value
    
    const cellValue = document.createElement('p');
    cellValue.setAttribute('class', 'question-value');
    cellValue.textContent = value;
    cellValue.setAttribute('data-value', `value${value}`);

    cell.appendChild(cellValue);
    // cell.onclick = function(){} // ADD FUNCTION TO CHOOSE A QUESTION

    parentNode.appendChild(cell);
}

function addRow(val){
    const newRow = document.createElement('tr');
    newRow.setAttribute('class', 'row');
    newRow.setAttribute('data-value', val);

    const categoryColumns = document.querySelectorAll('.category');
    for (const col of categoryColumns){
        addCell(newRow, val, col.dataset.category);
    }
    document.querySelector('#categories').appendChild(newRow);
}

function questionMenu(type, data){
    const shadow = document.createElement('div');
    shadow.setAttribute('class', 'shadow');

    const content = document.querySelector('#categories');
    content.classList.add('blurred');

    const container = document.createElement('div');
    container.setAttribute('class', 'info-screen2');

    const makeChangesDiv = document.createElement('div');
    makeChangesDiv.setAttribute('class', 'make-changes2');

    if(type === 'bring question') {
        const label = document.createElement('p');
        label.textContent = `Category: ${data.category} | Value: ${data.value}`;
        label.setAttribute('class', 'label-category2');
        
        const questionTitle = document.createElement('p');
        questionTitle.setAttribute('class', 'question-title');
        questionTitle.textContent = data.title;
        
        const optionsDiv = document.createElement('div');
        optionsDiv.setAttribute('class', 'question-options options-flex'); // make this flex and use flexbox to arrange items

        for (let count = 0; count < 4; count++){
            const option = document.createElement('div');
            option.setAttribute('class', 'question-option-div option-active option-disabled'); // make this flex or use spans

            const optionLabel = document.createElement('i');
            optionLabel.setAttribute('class', 'far fa-dot-circle option-marker');

            const optionText = document.createElement('p');
            optionText.textContent = data.options[count]

            option.appendChild(optionLabel);
            option.appendChild(optionText);
            optionsDiv.appendChild(option);
        }
        makeChangesDiv.appendChild(label);
        makeChangesDiv.appendChild(questionTitle);
        makeChangesDiv.appendChild(optionsDiv);
    }

    if(type === 'bring scores') {
        const table = createScoreTable(data.scores);
        table.setAttribute('class', 'big-fonts');
        makeChangesDiv.append(table);
    }
    container.appendChild(makeChangesDiv);
    document.querySelector('body').appendChild(container);
    document.querySelector('body').appendChild(shadow)
}

function exitMenu(){
    document.querySelector('#categories').classList.remove('blurred');
    document.querySelector('.shadow').remove();
    document.querySelector('.info-screen2').remove();
}