function edit_or_create_form(row){
    toggleModal('make_edit_or_create_form', row);
}


function make_edit_or_create_form(row) {
    // get the text of a navbar link that has active class
    let page = document.querySelector('a.active').textContent.trim();
    if (page === "Главная")
        page = "Заявки";
    let fields = {};
    if (CONFIG[page]['form_fields']){
        fields = CONFIG[page]['form_fields'];
    } else {
        // Create an object with keys from columns and value "text"
        (CONFIG[page]['table']['columns']).forEach(col => {
            if (col.toLowerCase().includes("дата"))
                fields[col] = "date";
            else if (col === "Описание" || col === "Комментарий")
                fields[col] = "textarea";
            else if (col === "Статус" || col === "Тип" || col === "Категория")
                fields[col] = "select";
            else if (col.toLowerCase().includes("индекс") || col.toLowerCase().includes("номер"))
                fields[col] = "number";
            else
                fields[col] = "text";
        });
    }
    const columns = CONFIG[page]['form_fields'] ? Object.keys(CONFIG[page]['form_fields']) : CONFIG[page]['table']['columns'];
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
        if (
            column === '№' ||
            column === 'Действия' ||
            column === 'CHECKMARK' ||
            column === 'Всего' ||
            column === ''
        ) { return; }
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'edit-form-field';

        const label = document.createElement('label');
        label.textContent = column;
        label.htmlFor = `input_${column}`;

        let field;
        switch (fields[column]) {
            case 'select':
                field = document.createElement('select');
                if (page_data[column]) {
                    page_data[column].forEach(option => {
                        const opt = document.createElement('option');
                        opt.value = option;
                        opt.textContent = option;
                        if (row && page_data["t-rows"][row.getAttribute("row-id")][column] === option) {
                            opt.selected = true;
                        }
                        field.appendChild(opt);
                    });
                }
                else
                    console.error(`No options found for select field "${column}" in page "${page}".`);
                break;
            case 'textarea':
                field = document.createElement('textarea');
                field.value = row ? page_data["t-rows"][row.getAttribute("row-id")][column] : '';
                field.placeholder = `Введите ${column.toLowerCase()}`;
                break;
            case 'date':
                field = document.createElement('input');
                field.type = 'date';
                if (row) {
                    const dateValue = page_data["t-rows"][row.getAttribute("row-id")][column];
                    field.value = dateValue ? new Date(dateValue).toISOString().split('T')[0] : '';
                }
                break;
            default:
                field = document.createElement('input');
                field.type = fields[column];
                if (fields[column] !== 'file')
                    field.value = row ? page_data["t-rows"][row.getAttribute("row-id")][column] : '';
        }
        field.name = column;
        field.id = `input_${column}`;
        fieldContainer.appendChild(label);
        fieldContainer.appendChild(field);
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
            addDataToTable(CONFIG[page]["table"], document.querySelector('.table-wrapper'), [data])
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
    let delete_text = '';
    const cells = rows[0].querySelectorAll('td[data-column]');
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const columnName = cell.getAttribute('data-column').toLowerCase();
        if (columnName.includes('наименование') || columnName.includes('имя') || columnName.includes('номер')) {
            delete_text = cell.textContent.trim();
            break;
        }
    }
    p.textContent = `Удалить ${delete_text}${rows.length > 1 ? ` и еще ${rows.length-1}` : ""}?`;

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