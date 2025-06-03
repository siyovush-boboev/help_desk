function edit_or_create_form(row){
    toggleModal('make_edit_or_create_form', row);
}


function make_edit_or_create_form(row) {
    // get the text of a navbar link that has active class
    const page = document.querySelector('a.active').textContent.trim();
    const columns = config[page]['table']['columns'];
    // create a modal window's content which is a field for each column except some special columns
    // and 2 buttons (reset, save)
    const modal = document.createElement('div');
    modal.className = 'modal';
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    const h3 = document.createElement('h3');
    h3.textContent = row ? "Редактирование" : "Создание";
    modalContent.appendChild(h3);
    const form = document.createElement('form');
    form.id = 'editForm';
    form.className = 'edit-form';
    columns.forEach(column => {
        if (column === '№' || column === 'Действия' || column === 'CHECKMARK' || column === 'Всего' || column === "") {
            return; // skip special columns
        }
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'edit-form-field';

        const label = document.createElement('label');
        label.textContent = column;
        label.htmlFor = `input_${column}`;

        const input = document.createElement('input');
        input.type = 'text'; // default to text
        input.name = column;
        input.id = `input_${column}`;
        input.value = row ? row.querySelector(`td[data-column="${column}"]`).textContent.trim() : '';

        fieldContainer.appendChild(label);
        fieldContainer.appendChild(input);
        form.appendChild(fieldContainer);
    });
    const buttons = document.createElement('div');
    buttons.className = 'form-buttons';
    const go_back_btn = document.createElement('button');
    go_back_btn.textContent = 'Вернуться';
    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.textContent = 'Сохранить';
    buttons.appendChild(go_back_btn);
    buttons.appendChild(saveBtn);
    modalContent.appendChild(form);
    modalContent.appendChild(buttons);
    // Add event listeners for form submission and reset

    saveBtn.onclick = (e) => {
        e.preventDefault(); // Prevent default form submission
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        if (row) {
            // Update existing row
            Object.keys(data).forEach(key => {
                const cell = row.querySelector(`td[data-column="${key}"]`);
                if (cell) {
                    cell.textContent = data[key];
                }
            });
            // #TODO: call API here to update
        } else {
            addDataToTable(config[page]["table"], document.querySelector('.table-wrapper'), [data])
            // #TODO: call API here to create new row
        }
        toggleModal();
    }
    go_back_btn.onclick = () => {
        form.reset();
        toggleModal();
    };
    modalContent.onclick = (e) => e.stopPropagation();
    modal.appendChild(modalContent);
    return modal;
}


function delete_form(...rows) {
    toggleModal('make_delete_form', ...rows);
}


function make_delete_form(...rows){
    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const h3 = document.createElement('h3');
    h3.textContent = 'Вы уверены?';

    const p = document.createElement('p');
    p.textContent = `Удалить ${rows[0].textContent.trim()}${rows.length > 1 ? ` и еще ${rows.length-1} строк` : ""}?`;

    const modalButtons = document.createElement('div');
    modalButtons.className = 'modal-buttons';

    const confirmBtn = document.createElement('button');
    confirmBtn.id = 'confirmDeleteBtn';
    confirmBtn.textContent = 'Да ✅';

    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'cancelBtn';
    cancelBtn.textContent = 'Нет ❌';

    // Append buttons
    modalButtons.appendChild(confirmBtn);
    modalButtons.appendChild(cancelBtn);

    // Assemble modal
    modalContent.appendChild(h3);
    modalContent.appendChild(p);
    modalContent.appendChild(modalButtons);
    modal.appendChild(modalContent);

    // Optional: Add event listeners for buttons
    cancelBtn.onclick = () => {
        modal.remove();
        toggleModal();
    }
    confirmBtn.onclick = () => {
        rows.forEach(row => row.remove());
        modal.remove();
        // #TODO: call API here to delete
        toggleModal();
    };
    modalContent.onclick = (e) => e.stopPropagation();
    return modal;
}