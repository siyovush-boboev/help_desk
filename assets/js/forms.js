function transliterate(str) {
  const map = {
    'а': 'a',  'б': 'b',  'в': 'v',  'г': 'g',  'д': 'd',
    'е': 'e',  'ё': 'yo', 'ж': 'zh', 'з': 'z',  'и': 'i',
    'й': 'y',  'к': 'k',  'л': 'l',  'м': 'm',  'н': 'n',
    'о': 'o',  'п': 'p',  'р': 'r',  'с': 's',  'т': 't',
    'у': 'u',  'ф': 'f',  'х': 'kh', 'ц': 'ts', 'ч': 'ch',
    'ш': 'sh', 'щ': 'shch','ъ': '',  'ы': 'y',  'ь': '',
    'э': 'e',  'ю': 'yu', 'я': 'ya',

    'А': 'A',  'Б': 'B',  'В': 'V',  'Г': 'G',  'Д': 'D',
    'Е': 'E',  'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z',  'И': 'I',
    'Й': 'Y',  'К': 'K',  'Л': 'L',  'М': 'M',  'Н': 'N',
    'О': 'O',  'П': 'P',  'Р': 'R',  'С': 'S',  'Т': 'T',
    'У': 'U',  'Ф': 'F',  'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch',
    'Ш': 'Sh', 'Щ': 'Shch','Ъ': '',  'Ы': 'Y',  'Ь': '',
    'Э': 'E',  'Ю': 'Yu', 'Я': 'Ya',

    " ": "_",  "-": "_",  ".": "_",  ",": "_",  "/": "_",
  };

  return str.split('').map(char => map[char] ?? char).join('');
}


function make_form_field(fields, column, page, row=null){
    let field;
    switch (fields[column][1]) {
        case 'select':
            field = document.createElement('select');
            field.append(document.createElement('option'));  // empty option

            if (column === "Статус" && fields["Статус"].length > 2) {
                const statuses = fields["Статус"][2]["options"];
                statuses.forEach(status => {
                    const opt = document.createElement('option');
                    opt.value = statuses.indexOf(status);
                    opt.textContent = status;
                    if (row && statuses[page_data["t-rows"][row.getAttribute("row-id")][fields[column][0]]] === status) {
                        opt.selected = true;
                    }
                    field.appendChild(opt);
                });
            } else if (page_data[column]) {
                Object.keys(page_data[column]).forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = page_data[column][option]["id"];
                    opt.textContent = page_data[column][option]["name"];
                    if (row && page_data["t-rows"][row.getAttribute("row-id")][fields[column][0]] === page_data[column][option]["id"]) {
                        opt.selected = true;
                    }
                    field.appendChild(opt);
                });
            } else if (column === "Исполнитель") {
                const executors = page_data["Пользователь"] || [];
                Object.keys(executors).forEach(executor => {
                    const opt = document.createElement('option');
                    opt.value = executors[executor]["id"];
                    opt.textContent = executors[executor]["fio"].split(" ").slice(0, 2).join(" ");
                    if (row && page_data["t-rows"][row.getAttribute("row-id")][fields[column][0]] === executor) {
                        opt.selected = true;
                    }
                    field.appendChild(opt);
                });
            } else
                console.error(`No options found for select field "${column}" in page "${page}".`);
            break;
        case 'textarea':
            field = document.createElement('textarea');
            field.value = row ? page_data["t-rows"][row.getAttribute("row-id")][fields[column][0]] : '';
            field.placeholder = `Введите ${column.toLowerCase()}`;
            break;
        case 'date':
            field = document.createElement('input');
            field.type = 'date';
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const maxDate = `${yyyy}-${mm}-${dd}`;
            field.min = '2000-01-01';
            field.max = maxDate;
            if (row) {
                const dateValue = page_data["t-rows"][row.getAttribute("row-id")][fields[column][0]];
                field.value = dateValue ? new Date(dateValue).toISOString().split('T')[0] : '';
            }
            break;
        default:
            field = document.createElement('input');
            field.type = fields[column][1] || 'text';  // default to text if type is not specified
            if (fields[column][1] !== 'file')
                field.value = row ? page_data["t-rows"][row.getAttribute("row-id")][fields[column][0]] : '';
            if (column === "Логин") {
                if (row) {
                    field.value = page_data["t-rows"][row.getAttribute("row-id")]["email"].split("@")[0];
                }
                field.disabled = true;  // disable login field for editing
            }
    }
    field.name = column;
    field.id = `input_${transliterate(column)}`;

    return field;
}


function make_edit_or_create_form(row) {
    // get the text of a navbar link that has active class
    let page = document.querySelector('a.active').textContent.trim();
    if (page === "Главная")
        page = "Заявки";

    const columns = CONFIG[page]['form_fields'] ? Object.keys(CONFIG[page]['form_fields']) : CONFIG[page]['table']['columns'];
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

    const modal = document.createElement('div');

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const h3 = document.createElement('h3');
    h3.textContent = row ? "Редактирование" : "Создание";
    modalContent.appendChild(h3);

    const form = document.createElement('form');
    form.id = 'editForm';
    form.className = 'edit-form';

    columns.forEach(column => {
        if (column === '№' || column === 'Действия' || column === 'CHECKMARK' || column === 'Всего' || column === '')
            return;
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'edit-form-field';

        const label = document.createElement('label');
        label.textContent = column;
        label.htmlFor = `input_${transliterate(column)}`;

        let field = make_form_field(fields, column, page, row);

        fieldContainer.appendChild(label);
        fieldContainer.appendChild(field);
        form.appendChild(fieldContainer);
    });

    const go_back_btn = document.createElement('button');
    go_back_btn.textContent = 'Вернуться';
    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.textContent = 'Сохранить';

    const buttons = document.createElement('div');
    buttons.className = 'form-buttons';
    buttons.appendChild(go_back_btn);
    buttons.appendChild(saveBtn);

    saveBtn.onclick = (e) => {
        const form = document.querySelector("#editForm");
        e.preventDefault();
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        if (!validate_form(form)){
            return;
        }

        if (row) {
            console.log(data);
            // #TODO: call API here to update
        } else {
            addDataToTable(CONFIG[page]["table"], document.querySelector('.table-wrapper'), [data])
            // #TODO: call API here to create new row
        }
        // update page to show up-to-date data
        toggleModal();
        // location.reload();
    }

    go_back_btn.onclick = () => {
        toggleModal();
    };

    modalContent.appendChild(form);
    modalContent.appendChild(buttons);
    modalContent.onclick = (e) => e.stopPropagation();
    modal.appendChild(modalContent);
    return modal;
}


function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}


function validate_form(form){
    const fields = form.querySelectorAll(".edit-form-field");
    let no_errors = true;

    for (let field of fields){
        const [label, control] = field.children;
        let field_is_valid = true;

        if (control.tagName === "INPUT" || control.tagName == "TEXTAREA"){
            let content = control.value;

            if (control.type === "text" && content === ""){
                field_is_valid = no_errors = false;
            } else if (control.type === "email" && !isValidEmail(content)){
                field_is_valid = no_errors = false;
            } else if (control.type === "file"){
                field_is_valid = true;
            }
        }

        else if (control.tagName === "SELECT"){
            const options = control.querySelectorAll("option");
            for (let option of options){
                if (option.selected){
                    let content = option.textContent;
                    if (content === ""){
                        field_is_valid = no_errors = false;
                    }
                }
            }
        }

        // Mark field's validity with setting a green or red border
        control.style.border = "2px solid " + (field_is_valid ? "#0f0" : "#f00");
    }
    return no_errors;
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

    // Add event listeners for buttons
    cancelBtn.onclick = () => {
        modal.remove();
        toggleModal();
    }
    confirmBtn.onclick = () => {
        rows.forEach(row => {
            console.log(`Удаление ${row.textContent}`);
            // #TODO: Call API to delete rows
        });
        location.reload();
    };
    modalContent.onclick = (e) => e.stopPropagation();
    return modal;
}


function edit_or_create_form(row){
    toggleModal('make_edit_or_create_form', row);
}


function delete_form(...rows) {
    toggleModal('make_delete_form', ...rows);
}
