function createTable(tableConfig, tableWrapper) {
    const table = document.createElement("table");
    table.classList.add("custom-table");

    // Create header row
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    if (tableConfig.rows) {
        // Add an empty cell to align with the data rows
        headerRow.appendChild(document.createElement("th"));
    }

    // Create header cells based on tableConfig.columns
    Object.keys(tableConfig.columns).forEach(colName => {
        const actual_colName = tableConfig.columns[colName];
        const th = document.createElement("th");
        if (colName === "CHECKMARK") {
            th.innerHTML = `<input type="checkbox" id="select-all" title="Выбрать все">`;
            th.addEventListener("click", function () {
                // select only visible checkboxes in the table (exclude hidden rows that have "Закрыто" status)
                const checkboxes = Array.from(table.querySelectorAll("tbody input[type='checkbox']")).filter(cb => cb.offsetParent !== null);
                const selectAllCheckbox = document.getElementById("select-all");
                checkboxes.forEach(checkbox => checkbox.checked = selectAllCheckbox.checked);
            });
        } else {
            th.textContent = actual_colName?.label || colName;
        }
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    if (tableConfig.rows) {
        tableConfig['rows'].forEach(rowData => {
            const tr = document.createElement("tr");
            let columns_length = Object.keys(tableConfig.columns).length;
            for (let i = 0; i < columns_length; i++) {
                const td = document.createElement("td");
                td.textContent = i === 0 ? rowData : "";
                tr.appendChild(td);
            }
            const emptyCell = document.createElement("td");
            tr.appendChild(emptyCell);
            tbody.appendChild(tr);
        });
    }

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
}


function addDataToTable(tableConfig, tableWrapper, data, page) {
    const tbody = tableWrapper.querySelector("tbody");
    const prev_rows = [...tbody.children];
    tbody.innerHTML = ''; // Clear existing rows

    data.forEach(item => {
        const tr = document.createElement("tr");
        if (tableConfig.rows) {
            const emptyCell = document.createElement("td");
            tr.appendChild(emptyCell);  // Add empty cell to align with header
        }
        Object.keys(tableConfig.columns).forEach(colName => {
            const actual_colName = tableConfig.columns[colName];  // column name in the api response
            const td = document.createElement("td");
            // Set data-column attribute for easier access to row title later when deleting rows
            td.setAttribute("data-column", colName);

            if (colName === "CHECKMARK") {
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                td.appendChild(checkbox);
            } else if (colName === "№" && !item[actual_colName]) {
                td.textContent = tbody.children.length + 1;  // Fill with row number if data row does not have ID
            } else if (colName === "Наименование заявки") {
                // Create a link to the application edit form
                const link = document.createElement("a");
                link.href = `#${item["id"]}`;
                link.textContent = item[actual_colName] || "";  // Fill with item name
                link.onclick = function (e) {
                    e.preventDefault();
                    edit_or_create_form(item["id"]); // Call edit or create form for an application with item id
                }
                td.appendChild(link);
            } else if (colName === "Заявитель") {
                // instead of just filling with item[actual_colName], we need to make that a link to the user info modal
                const userLink = document.createElement("a");
                userLink.href = "#";
                userLink.textContent = page_data["Пользователь"][item["user_id"]]["fio"].split(" ").slice(0, 2).join(" ") || "";
                userLink.onclick = function (e) {
                    e.preventDefault();
                    toggleModal('user_info_modal', item["user_id"]);
                }
                td.appendChild(userLink);
            } else if (colName === "Статус") {
                // Fill with status from CONFIG[page]["form_fields"] if it has "Статус" and options
                if (CONFIG[page]["form_fields"] && "Статус" in CONFIG[page]["form_fields"] && CONFIG[page]["form_fields"]["Статус"].length > 2)
                    td.textContent = CONFIG[page]["form_fields"]["Статус"][2]["options"][item[actual_colName]] || ""; // Fill with status
                else {  // If no options, use "Статус" from page_data
                    td.textContent = page_data["Статус"][item[actual_colName]]["name"] || ""; // Fill with status
                }
                // skip if status is "Закрыто"
                if (td.textContent === "Закрыто")
                    tr.style.display = "none"; // Hide the row
            } else if (colName === "Действия") {
                // Create a div with actions for edit and delete buttons
                const actions = document.createElement("div");
                actions.classList.add("table-actions");
                actions.innerHTML = `
                    <button id="table-delete-button">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 5H4.16667H17.5" stroke="#069EA1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.8337 5.00002V16.6667C15.8337 17.1087 15.6581 17.5326 15.3455 17.8452C15.0329 18.1578 14.609 18.3334 14.167 18.3334H5.83366C5.39163 18.3334 4.96771 18.1578 4.65515 17.8452C4.34259 17.5326 4.16699 17.1087 4.16699 16.6667V5.00002M6.66699 5.00002V3.33335C6.66699 2.89133 6.84259 2.4674 7.15515 2.15484C7.46771 1.84228 7.89163 1.66669 8.33366 1.66669H11.667C12.109 1.66669 12.5329 1.84228 12.8455 2.15484C13.1581 2.4674 13.3337 2.89133 13.3337 3.33335V5.00002" stroke="#069EA1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.33301 9.16669V14.1667" stroke="#069EA1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.667 9.16669V14.1667" stroke="#069EA1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button id="table-edit-button">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2364_3487)"><path d="M9.16699 3.33331H3.33366C2.89163 3.33331 2.46771 3.50891 2.15515 3.82147C1.84259 4.13403 1.66699 4.55795 1.66699 4.99998V16.6666C1.66699 17.1087 1.84259 17.5326 2.15515 17.8452C2.46771 18.1577 2.89163 18.3333 3.33366 18.3333H15.0003C15.4424 18.3333 15.8663 18.1577 16.1788 17.8452C16.4914 17.5326 16.667 17.1087 16.667 16.6666V10.8333" stroke="#069EA1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.417 2.08332C15.7485 1.7518 16.1982 1.56555 16.667 1.56555C17.1358 1.56555 17.5855 1.7518 17.917 2.08332C18.2485 2.41484 18.4348 2.86448 18.4348 3.33332C18.4348 3.80216 18.2485 4.2518 17.917 4.58332L10.0003 12.5L6.66699 13.3333L7.50033 9.99999L15.417 2.08332Z" stroke="#069EA1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_2364_3487"><rect width="20" height="20" fill="white"/></clipPath></defs></svg>
                    </button>
                `;
                actions.querySelector('#table-delete-button').onclick = function () {
                    const row = actions.closest('tr');
                    delete_form(row);
                };
                actions.querySelector('#table-edit-button').onclick = function () {
                    edit_or_create_form(item["id"]);
                };
                td.appendChild(actions);
            } else if (colName === "Всего") {
                // calculate the sum of the row
                let sum = 0;
                for (let key in item) {
                    if (key !== "CHECKMARK" && key !== "Действия" && !isNaN(parseFloat(item[key]))) {
                        sum += parseFloat(item[key]);
                    }
                }
                td.textContent = sum;
            } else if (colName === "Имя") {
                td.textContent = item["fio"].split(" ").slice(0, 2).join(" "); // Fill with first name and last name
            } else if (colName.toLowerCase().includes("дата") || colName.toLowerCase().includes("срок")) {
                // Format date if the column name contains "дата"
                const dateValue = item[actual_colName];
                if (dateValue) {
                    const date = new Date(dateValue);
                    // Check if the value includes a time part (datetime)
                    if (typeof dateValue === "string" && (dateValue.includes("T") || dateValue.match(/\d{2}:\d{2}/))) {
                        // Include time
                        td.textContent = date.toLocaleString("ru-RU", {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    } else {  // Only date
                        td.textContent = date.toLocaleDateString("ru-RU", {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                    }
                } else {
                    td.textContent = ""; // If no date, leave empty
                }
            } else if (actual_colName.includes("_id")) {
                // If the column name ends with "_id", we need to find the corresponding name in page_data
                if (actual_colName === "user_id")
                    td.textContent = page_data["Пользователь"][item[actual_colName]]["fio"].split(" ").slice(0, 2).join(" ") || "";
                else if (colName in page_data)
                    td.textContent = page_data[colName][item[actual_colName]]["name"] || "";
            } else {
                td.textContent = item[actual_colName] || ""; // Fill with item data
            }
            tr.appendChild(td);
        });
        // Set row ID for easier access later when editing or deleting
        tr.setAttribute("row-id", item["id"]);
        tbody.appendChild(tr);
    });
    let headers = tableWrapper.querySelector(".custom-table thead tr").children;
    for (let i = 0; i < prev_rows.length; i++) {
        if (prev_rows[i].textContent === "Всего") {
            // go thru all the current row's children and sum up the values of that child's columns
            // i.e. tbody's children[i].children[j].textContent
            // then put the sum in that child's column textContent
            for (let j = 1; j < prev_rows[i].children.length; j++) {
                let sum = 0;
                for (let k = 0; k < tbody.children.length; k++) {
                    // Skip if the cell is not a number or is the ID cell
                    if (headers[j].textContent === "№" || isNaN(parseFloat(tbody.children[k].children[j].textContent))) {
                        sum = "";
                        break;
                    }
                    const value = parseFloat(tbody.children[k].children[j].textContent) || 0;
                    sum += value;
                }
                prev_rows[i].children[j].textContent = sum; // Set the sum in the previous row
            }
        }
        tbody.appendChild(prev_rows[i]); // Re-add previous rows
    }
}
