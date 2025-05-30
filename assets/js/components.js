function make_breadcrumb(text) {
    const parts = text.split("/");
    const spans = parts.map(part => `<span>${part}</span>`);
    return spans.join(" / ");
}


function make_control_bar(container, page) {
    // Clear previous content
    container.innerHTML = '';

    if (config[page]["searchbar"]) {
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
                // implement search functionality here
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
            console.log("Search input cleared");
            clearButton.style.display = "none"; // Hide the clear button
        });
        searchContainer.appendChild(clearButton);
        container.appendChild(searchContainer);
    }

    if (config[page]["delete_button"]) {
        const button = document.createElement("button");
        button.id = "delete_button";
        button.innerHTML = `<span><svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 5H4.16667H17.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.8333 5.00008V16.6667C15.8333 17.1088 15.6577 17.5327 15.3452 17.8453C15.0326 18.1578 14.6087 18.3334 14.1667 18.3334H5.83332C5.3913 18.3334 4.96737 18.1578 4.65481 17.8453C4.34225 17.5327 4.16666 17.1088 4.16666 16.6667V5.00008M6.66666 5.00008V3.33341C6.66666 2.89139 6.84225 2.46746 7.15481 2.1549C7.46737 1.84234 7.8913 1.66675 8.33332 1.66675H11.6667C12.1087 1.66675 12.5326 1.84234 12.8452 2.1549C13.1577 2.46746 13.3333 2.89139 13.3333 3.33341V5.00008" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.33334 9.16675V14.1667" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.6667 9.16675V14.1667" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>&nbsp;Удалить`;
        container.appendChild(button);
        // output to console the checkmarked rows when user clicks the delete button
        button.addEventListener("click", () => {
            const checkboxes = document.querySelectorAll(".custom-table tbody input[type='checkbox']:checked");
            if (checkboxes.length === 0) {
                console.warn("Нет отмеченных строк для удаления.");
                return;
            }
            checkboxes.forEach(checkbox => {
                const row = checkbox.closest("tr");
                if (row) {
                    console.log(`Удаление строки: ${row.textContent}`);
                    row.remove(); // Remove the row from the DOM
                    // remove the row from the table thru API later
                }
            });
        });
    }

    if (config[page]["filter_button"]) {
        const button = document.createElement("button");
        button.innerHTML = `<span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.75 5C0.75 4.58579 1.08579 4.25 1.5 4.25H14.5C14.9142 4.25 15.25 4.58579 15.25 5C15.25 5.41421 14.9142 5.75 14.5 5.75H1.5C1.08579 5.75 0.75 5.41421 0.75 5ZM3.25 8C3.25 7.58579 3.58579 7.25 4 7.25H12C12.4142 7.25 12.75 7.58579 12.75 8C12.75 8.41421 12.4142 8.75 12 8.75H4C3.58579 8.75 3.25 8.41421 3.25 8ZM5.75 11C5.75 10.5858 6.08579 10.25 6.5 10.25H9.5C9.91421 10.25 10.25 10.5858 10.25 11C10.25 11.4142 9.91421 11.75 9.5 11.75H6.5C6.08579 11.75 5.75 11.4142 5.75 11Z" fill="#8F8F8F"/></svg></span>&nbsp;Фильтры`;
        container.appendChild(button);
        // output a message to console when user clicks the filter button
        button.addEventListener("click", () => {
            console.log("Фильтры нажаты");
            // Implement filter functionality here
        });
    }

    if (config[page]["show_hide_button"]) {
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

    if (config[page]["create_button"]) {
        const button = document.createElement("button");
        button.id = "create_button";
        button.innerHTML = `<span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12H16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>&nbsp;Создать`;
        // output a message to console when user clicks the create button
        button.addEventListener("click", () => {
            console.log("Создать нажато");
            // Implement create functionality here
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
  if (tableConfig.rows[0] !== "DEFAULT") {
    startIndex = 1; // Skip the first column when inserting row data
    headerRow.appendChild(document.createElement("th"));
  }

  tableConfig.columns.forEach(colName => {
    const th = document.createElement("th");
    if (colName === "CHECKMARK") {
        th.innerHTML = `<input type="checkbox" id="select-all" title="Выбрать все">`;
        th.style.cursor = "pointer"; // Change cursor to pointer for checkbox column
        th.addEventListener("click", function() {
            const checkboxes = table.querySelectorAll("tbody input[type='checkbox']");
            const selectAllCheckbox = document.getElementById("select-all");
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
        
    }
    else{
        th.textContent = colName;
    }
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create body
  const tbody = document.createElement("tbody");

  tableConfig['rows'].forEach(rowData => {
    if (rowData === "DEFAULT") {
      // placeholder, you’ll add rows from API later
      return;
    }
    const tr = document.createElement("tr");
    for (let i = startIndex; i < tableConfig.columns.length+startIndex; i++) {
      // create a checkmark if column is "CHECKMARK"
      const td = document.createElement("td");
      if (tableConfig.columns[i] === "CHECKMARK") {
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          td.appendChild(checkbox);
          tr.appendChild(td);
          continue;
      }
      else if (tableConfig.columns[i] === "№") {
          td.textContent = rowData === "DEFAULT" ? i + 1 : rowData; // Fill with row number or data
          continue;
      } else {
        // Just fill with rowData for demo; you can replace this with real data
        td.textContent = i === startIndex ? rowData : "";
      }
      tr.appendChild(td);
    }
    if (startIndex === 1) {
      const emptyCell = document.createElement("td");
      tr.appendChild(emptyCell);
    }

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableWrapper.appendChild(table);
}


function addDataToTable(tableConfig, tableWrapper, apiUrl) {
    // Fetch data from the API and populate the table
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const tbody = tableWrapper.querySelector("tbody");
            const prev_rows = [];
            if (tbody) {
              prev_rows.push(...tbody.children); // Store previous rows
            }
            tbody.innerHTML = ''; // Clear existing rows
            // Ensure data is an array
            const rows = Array.isArray(data) ? data : (Array.isArray(data.result) ? data.result : []);
            rows.forEach(item => {
                const tr = document.createElement("tr");
                if (tableConfig.rows[0] !== "DEFAULT") {
                    const emptyCell = document.createElement("td");
                    tr.appendChild(emptyCell); // Add empty cell for row number
                }
                tableConfig.columns.forEach(colName => {
                    const td = document.createElement("td");
                    if (colName === "CHECKMARK") {
                        const checkbox = document.createElement("input");
                        checkbox.type = "checkbox";
                        td.appendChild(checkbox);
                    } else if (colName === "№" && !item[colName]) {
                        td.textContent = tbody.children.length + 1; // Fill with row number
                    } else if (colName === "Статус") {
                        // skip if status is "Закрыто"
                        if (item[colName] === "Закрыто") {
                            tr.style.display = "none"; // Hide the row
                        }
                        td.textContent = item[colName] || ""; // Fill with status
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
                        actions.querySelector('#table-delete-button').onclick = function(e) {
                          const row = actions.closest('tr');
                          if (row) {
                            row.remove();
                            // #TODO: remove thru API later
                          }
                        };
                        // Add onclick for edit button
                        actions.querySelector('#table-edit-button').onclick = function(e) {
                          console.log('Edit button clicked for row:', actions.closest('tr').textContent);
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
                    } else {
                        td.textContent = item[colName] || ""; // Fill with item data
                    }
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            let headers = tableWrapper.querySelector(".custom-table thead tr").children;
            for (let i = 0; i < prev_rows.length; i++) {
                if (prev_rows[i].textContent === "Всего"){
                  // go thru all the current row's children and sum up the values of that child's columns
                  // i.e. tbody's children[i].children[j].textContent
                  // then put the sum in that child's column textContent
                  for (let j = 1; j < prev_rows[i].children.length; j++) {
                    let sum = 0;
                    for (let k = 0; k < tbody.children.length; k++) {
                      if (headers[j].textContent === "№" || isNaN(parseFloat(tbody.children[k].children[j].textContent))){
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
        })
        .catch(error => console.error('Error fetching data:', error));
}


function make_pagination(container, page) {
    // Clear previous content
    container.innerHTML = '';

    // Create two main containers
    const infoDiv = document.createElement("div");
    const navDiv = document.createElement("div");

    // InfoDiv: total records and rows per page selector
    const totalRecords = config[page]?.totalRecords || 0;
    let rowsPerPage = config[page]?.rowsPerPage || 10;

    const totalText = document.createElement("span");
    totalText.textContent = `Всего записей: ${totalRecords}`;

    const rowsSelect = document.createElement("select");
    for (let i = 5; i <= MAXIMUM_TABLE_ROWS_PER_PAGE; i += 5) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      if (i === rowsPerPage) option.selected = true;
      rowsSelect.appendChild(option);
    }
    rowsSelect.addEventListener("change", (e) => {
      config[page].rowsPerPage = parseInt(e.target.value, 10);
      // Optionally trigger reload
    });

    infoDiv.appendChild(totalText);
    // Create a span to group "Показывать по:" and the select
    const rowsSpan = document.createElement("span");
    rowsSpan.appendChild(document.createTextNode("| Показывать по: "));
    rowsSpan.appendChild(rowsSelect);
    infoDiv.appendChild(rowsSpan);

    // NavDiv: page navigation
    const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
    let currentPage = config[page]?.currentPage || 1;

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "←";
    prevBtn.disabled = currentPage <= 1;
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        config[page].currentPage = --currentPage;
        // Optionally trigger reload
      }
    });

    const pageInfo = document.createElement("span");
    pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "→";
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        config[page].currentPage = ++currentPage;
        // Optionally trigger reload
      }
    });

    navDiv.appendChild(prevBtn);
    navDiv.appendChild(pageInfo);
    navDiv.appendChild(nextBtn);

    // Append both divs to the container
    container.appendChild(infoDiv);
    container.appendChild(navDiv);
}