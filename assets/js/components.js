function make_breadcrumb(text) {
    const parts = text.split("/");
    const spans = parts.map(part => `<span>${part}</span>`);
    return spans.join(" / ");
}


function make_control_bar(container, page) {
    // Clear previous content
    container.innerHTML = '';
    if (CONFIG[page]["searchbar"]) {
      // a container with search input and X-icon
        const searchContainer = document.createElement("div");
        searchContainer.classList.add("search-container");
        // Create the input field
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "🔍 Поиск";
        input.id = "search-input";
        searchContainer.appendChild(input);        
        // output to console when user types and hits enter in the searchbar
        input.addEventListener("keydown", (e) => {
            searchContainer.querySelector("#clear-button").style.display = "inline-flex";
            if (e.key === "Enter") {
                console.log(`Searching for: ${input.value}`);
                // #TODO: implement search functionality here
                // For now, just log the search term
            }
        });
        // Add a clear button to the search input
        const clearButton = document.createElement("button");
        clearButton.id = "clear-button";
        clearButton.innerText = "❌"; // You can replace this with an SVG icon if needed
        clearButton.style.display = "none"; // Initially hidden
        clearButton.addEventListener("click", () => {
            input.value = ""; // Clear the input
            clearButton.style.display = "none"; // Hide the clear button
        });
        searchContainer.appendChild(clearButton);
        container.appendChild(searchContainer);
    }
    if (CONFIG[page]["delete_button"]) {
        const button = document.createElement("button");
        button.id = "delete_button";
        button.innerHTML = `<span><svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 5H4.16667H17.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.8333 5.00008V16.6667C15.8333 17.1088 15.6577 17.5327 15.3452 17.8453C15.0326 18.1578 14.6087 18.3334 14.1667 18.3334H5.83332C5.3913 18.3334 4.96737 18.1578 4.65481 17.8453C4.34225 17.5327 4.16666 17.1088 4.16666 16.6667V5.00008M6.66666 5.00008V3.33341C6.66666 2.89139 6.84225 2.46746 7.15481 2.1549C7.46737 1.84234 7.8913 1.66675 8.33332 1.66675H11.6667C12.1087 1.66675 12.5326 1.84234 12.8452 2.1549C13.1577 2.46746 13.3333 2.89139 13.3333 3.33341V5.00008" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.33334 9.16675V14.1667" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.6667 9.16675V14.1667" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>&nbsp;Удалить`;
        container.appendChild(button);
        // output to console the checkmarked rows when user clicks the delete button
        button.addEventListener("click", () => {
            const checkboxes = document.querySelectorAll(".custom-table tbody input[type='checkbox']:checked");
            if (checkboxes.length === 0) {
                return;
            }
            const rows_to_delete = [];
            checkboxes.forEach(checkbox => {
                const row = checkbox.closest("tr");
                rows_to_delete.push(row);
            });
            delete_form(...rows_to_delete);
        });
    }
    if (CONFIG[page]["filters"]) {
        const button = document.createElement("button");
        button.innerHTML = `<span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.75 5C0.75 4.58579 1.08579 4.25 1.5 4.25H14.5C14.9142 4.25 15.25 4.58579 15.25 5C15.25 5.41421 14.9142 5.75 14.5 5.75H1.5C1.08579 5.75 0.75 5.41421 0.75 5ZM3.25 8C3.25 7.58579 3.58579 7.25 4 7.25H12C12.4142 7.25 12.75 7.58579 12.75 8C12.75 8.41421 12.4142 8.75 12 8.75H4C3.58579 8.75 3.25 8.41421 3.25 8ZM5.75 11C5.75 10.5858 6.08579 10.25 6.5 10.25H9.5C9.91421 10.25 10.25 10.5858 10.25 11C10.25 11.4142 9.91421 11.75 9.5 11.75H6.5C6.08579 11.75 5.75 11.4142 5.75 11Z" fill="#8F8F8F"/></svg></span>&nbsp;Фильтры`;
        container.appendChild(button);
        // output a message to console when user clicks the filter button
        button.addEventListener("click", () => {
            filter_form();
        });
    }
    if (CONFIG[page]["show_hide_button"]) {
        const button = document.createElement("button");
        button.innerHTML = `Показать закрытые`;
        // onclick show/hide table rows that have "Статус" column with value "Закрыто"
        button.addEventListener("click", () => {
            const rows = document.querySelectorAll(".custom-table tbody tr");
            // find the cell index by order (find the head column's index with "Статус" text)
            const statusIndex = Array.from(document.querySelectorAll(".custom-table thead th")).findIndex(th => th.textContent.trim() === "Статус");
            if (statusIndex === -1) {
                console.warn("Столбец 'Статус' не найден в таблице.");
                return;
            }
            rows.forEach(row => {
                const statusCell = row.querySelector(`td:nth-child(${statusIndex + 1})`); // +1 because nth-child is 1-based index
                if (statusCell && statusCell.textContent.trim() === "Закрыто") {
                    row.style.display = row.style.display === "none" ? "table-row" : "none"; // Toggle visibility
                } 
            });
            // Set the button text based on the current state
            button.textContent = button.textContent === "Показать закрытые" ? "Скрыть закрытые" : "Показать закрытые";
        });
        container.appendChild(button);
    }
    if (CONFIG[page]["create_button"]) {
        const button = document.createElement("button");
        button.id = "create_button";
        button.innerHTML = `<span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12H16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>&nbsp;Создать`;
        // output a message to console when user clicks the create button
        button.addEventListener("click", () => {
          edit_or_create_form()
            // #TODO: Implement create functionality here
            // For now, just log the action
        });
        container.appendChild(button);
    }
}

function createTable(tableConfig, tableWrapper) {
  const table = document.createElement("table");
  table.classList.add("custom-table");

  // Create header row
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  let startIndex = 0;
  if (tableConfig.rows) {
    startIndex = 1; // Skip the first column when inserting row data
    headerRow.appendChild(document.createElement("th"));
  }

  Object.keys(tableConfig.columns).forEach(colName => {
    const actual_colName = tableConfig.columns[colName];
    const th = document.createElement("th");
    if (colName === "CHECKMARK") {
        th.innerHTML = `<input type="checkbox" id="select-all" title="Выбрать все">`;
        th.style.cursor = "pointer";
        th.addEventListener("click", function() {
            // select only visible checkboxes in the table (exclude hidden rows that have "Закрыто" status)
            const checkboxes = Array.from(table.querySelectorAll("tbody input[type='checkbox']")).filter(cb => cb.offsetParent !== null);
            const selectAllCheckbox = document.getElementById("select-all");
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    } else {
        th.textContent = actual_colName?.label || colName;
    }
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create body
  const tbody = document.createElement("tbody");

  if (tableConfig.rows) {
      tableConfig['rows'].forEach(rowData => {
          const tr = document.createElement("tr");
          let columns_length = Object.keys(tableConfig.columns).length;
          for (let i = startIndex; i < columns_length + startIndex; i++) {
            // create a checkmark if column is "CHECKMARK"
            const td = document.createElement("td");
            td.textContent = i === startIndex ? rowData : "";
            tr.appendChild(td);
          }
          if (startIndex === 1) {
            const emptyCell = document.createElement("td");
            tr.appendChild(emptyCell);
          }
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
  // Ensure data is an array
  const rows = Array.isArray(data) ? data : (Array.isArray(data.result) ? data.result : []);
  let row_id = 0;
  rows.forEach(item => {
    const tr = document.createElement("tr");
    if (tableConfig.rows) {
      const emptyCell = document.createElement("td");
      tr.appendChild(emptyCell); // Add empty cell for row number
    }
    Object.keys(tableConfig.columns).forEach(colName => {
      const actual_colName = tableConfig.columns[colName];
      const td = document.createElement("td");
      td.setAttribute("data-column", colName);
      if (colName === "CHECKMARK") {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        td.appendChild(checkbox);
      } else if (colName === "№" && !item[actual_colName]) {
        td.textContent = tbody.children.length + 1; // Fill with row number
      } else if (colName === "Статус") {
        if (CONFIG[page]["form_fields"] && "Статус" in CONFIG[page]["form_fields"] && CONFIG[page]["form_fields"]["Статус"].length > 2) {
          td.textContent = CONFIG[page]["form_fields"]["Статус"][2]["options"][item[actual_colName]] || ""; // Fill with status
        }
        else {
          td.textContent = page_data["Статус"][item[actual_colName]]["name"] || ""; // Fill with status
        }
        // skip if status is "Закрыто"
        if (td.textContent === "Закрыто") {
          tr.style.display = "none"; // Hide the row
        }
      } else if (colName === "Действия") {
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
        // Add onclick for delete button
        actions.querySelector('#table-delete-button').onclick = function() {
          const row = actions.closest('tr');
          delete_form(row);
        };
        // Add onclick for edit button
        actions.querySelector('#table-edit-button').onclick = function() {
          const row = actions.closest('tr');
          edit_or_create_form(row);
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
        td.textContent = sum; // Fill with the sum of the row
      } else if (colName === "Имя") {
        td.textContent = item["fio"].split(" ").slice(0, 2).join(" "); // Fill with name
      } else if (colName.toLowerCase().includes("дата")) {
        // Format date if the column name contains "дата"
        const dateValue = item[actual_colName];
        if (dateValue) {
          const date = new Date(dateValue);
          td.textContent = date.toLocaleDateString("ru-RU", {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        } else {
            td.textContent = ""; // If no date, leave empty
        }
      } else if (actual_colName.includes("_id")) {
          if (actual_colName === "user_id"){
            td.textContent = page_data["Пользователь"][item[actual_colName]]["fio"].split(" ").slice(0, 2).join(" ") || "";
          }
          else if (colName in page_data) {
            td.textContent = page_data[colName][item[actual_colName]]["name"] || "";
          }
      }
      else {
        td.textContent = item[actual_colName] || ""; // Fill with item data
      }
      tr.appendChild(td);
    });
    tr.setAttribute("row-id", row_id++);
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


function make_pagination(container, pagination) {
    // Clear previous content
    container.innerHTML = '';

    // Create two main containers
    const infoDiv = document.createElement("div");
    const navDiv = document.createElement("div");

    const totalText = document.createElement("span");
    totalText.textContent = `Всего записей: ${pagination.totalItems}`;

    const rowsSelect = document.createElement("select");
    for (let i = 5; i <= MAXIMUM_TABLE_ROWS_PER_PAGE; i += 5) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      if (i === pagination.pageSize) option.selected = true;
      rowsSelect.appendChild(option);
    }
    rowsSelect.addEventListener("change", (e) => {
      console.log(`Показывать по: ${e.target.value} записей на странице`);
      // #TODO: Update the table content here based on selected rows per page
    });

    infoDiv.appendChild(totalText);
    // Create a span to group "Показывать по:" and the select
    const rowsSpan = document.createElement("span");
    rowsSpan.appendChild(document.createTextNode("| Показывать по: "));
    rowsSpan.appendChild(rowsSelect);
    infoDiv.appendChild(rowsSpan);

    // NavDiv: page navigation
    const totalPages = pagination.totalPages || 1;
    let currentPage = pagination.currentPage || 1;

    const prevBtn = document.createElement("button");
    prevBtn.id = "prev-table-page-btn";
    prevBtn.textContent = "←";
    prevBtn.disabled = !pagination.hasPrevPage;
    prevBtn.addEventListener("click", () => {
      if (pagination.hasPrevPage) {
        const pageinfo_el = document.getElementById("page-info");
        // select the second word in the pageInfo textContent, update it and put everything else back the same
        const currentPageMatch = pageinfo_el.textContent.match(/Страница (\d+) из/);
        if (currentPageMatch) {
          const currentPageNumber = parseInt(currentPageMatch[1], 10);
          pageInfo.textContent = `Страница ${currentPageNumber - 1} из ${totalPages}`;
        }
        // enable the next button if it was disabled
        const nextBtn_el = document.getElementById("next-table-page-btn");
        nextBtn_el.disabled = false;
        // Disable prev button if on first page
        if (currentPage <= 2) {
          const prev_button = document.getElementById("prev-table-page-btn");
          prev_button.disabled = true;
        }
        // #TODO: Update the table content here
      }
    });

    const pageInfo = document.createElement("span");
    pageInfo.id = "page-info";
    pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;

    const nextBtn = document.createElement("button");
    nextBtn.id = "next-table-page-btn";
    nextBtn.textContent = "→";
    nextBtn.disabled = !pagination.hasNextPage;
    nextBtn.addEventListener("click", () => {
      if (pagination.hasNextPage) {
        const pageinfo_el = document.getElementById("page-info");
        // select the second word in the pageInfo textContent, update it and put everything else back the same
        const currentPageMatch = pageinfo_el.textContent.match(/Страница (\d+) из/);
        if (currentPageMatch) {
          const currentPageNumber = parseInt(currentPageMatch[1], 10);
          pageInfo.textContent = `Страница ${currentPageNumber + 1} из ${totalPages}`;
        }
        // remove disabled attribute from the prev button
        const prev_button = document.getElementById("prev-table-page-btn");
        prev_button.disabled = false;
        // Disable next button if on last page
        const nextBtn_el = document.getElementById("next-table-page-btn");
        if (pagination.currentPage + 1 >= totalPages) {
          nextBtn_el.disabled = true;
        }
        
        // #TODO: Update the table content here
      }
    });

    navDiv.appendChild(prevBtn);
    navDiv.appendChild(pageInfo);
    navDiv.appendChild(nextBtn);

    // Append both divs to the container
    container.appendChild(infoDiv);
    container.appendChild(navDiv);
}


function user_info_modal(user_id) {
    const apiUrl = `${CONFIG["Пользователи"]["API_route"]}/${1}`;
  
    // fetch user data by user_id
    return get_data_from_api(apiUrl).then(user_data => {

        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'user_info_modal';

        // Close button
        const closeButton = document.createElement('button');
        closeButton.className = 'user-info-close-button';

        // SVG for close button using innerHTML
        closeButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20">
          <line x1="4" y1="4" x2="16" y2="16" stroke="white" stroke-width="2"/>
          <line x1="16" y1="4" x2="4" y2="16" stroke="white" stroke-width="2"/>
            </svg>
        `;

        // Modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'user-info-modal-content';
        // add onclick that calls toggleModal with 'prevent' argument
        modalContent.onclick = (e) => e.stopPropagation();

        // Title
        const title = document.createElement('div');
        title.textContent = 'Контактная информация';

        // Main content
        const mainContent = document.createElement('div');
        mainContent.className = 'user-info-main-content';

        // User picture
        const picDiv = document.createElement('div');
        picDiv.className = 'user-full-size-pic';
        const img = document.createElement('img');
        img.src = '';
        picDiv.appendChild(img);

        // User text info
        const textInfo = document.createElement('div');
        textInfo.className = 'user-text-info';

        // Helper to create label and p
        function createInfoBlock(forId, labelText, value) {
            const div = document.createElement('div');
            const label = document.createElement('label');
            label.setAttribute('for', forId);
            label.textContent = labelText;
            const p = document.createElement('p');
            p.id = forId;
            p.textContent = value;
            div.appendChild(label);
            div.appendChild(p);
            return div;
        }

        // Divide all parameters into 3 arrays by their order in the argument list
        const arr1 = ['last_name', 'first_name', 'middle_name', 'email', 'phone', 'position', 'department'];
        const arr2 = ['Фамилия', 'Имя', 'Отчество', 'E-mail', 'Телефон', 'Должность', 'Департамент'];
        const arr3 = arr2.map(field_name => {
            if (field_name in CONFIG["Пользователи"]["form_fields"]) {
                const user_data_field = CONFIG["Пользователи"]["form_fields"][field_name][0];
                return user_data.result[user_data_field] || '';
            }
        });
        [arr3[0], arr3[1], arr3[2]] = arr3[1].split(" ");
        arr3[6] = page_data["Департамент"][arr3[6]]["name"] || '';

        // Loop through by index and append to textInfo
        for (let i = 0; i < arr1.length; i++) {
          textInfo.appendChild(createInfoBlock(arr1[i], arr2[i], arr3[i]));
        }

        mainContent.appendChild(picDiv);
        mainContent.appendChild(textInfo);

        modalContent.appendChild(title);
        modalContent.appendChild(mainContent);

        modal.appendChild(closeButton);
        modal.appendChild(modalContent);

        // Append modal to body or desired parent
        return modal;
    });
}