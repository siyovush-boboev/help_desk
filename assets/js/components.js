function make_breadcrumb(text) {
    const parts = text.split("/");
    const spans = parts.map(part => `<span>${part}</span>`);
    return spans.join(" / ");
}


function make_control_bar(container, page) {
    // Clear previous content
    container.innerHTML = '';

    if (config[page]["searchbar"]) {
        const input = document.createElement("input");
        input.type = "text";
        input.id = "searchbar";
        input.placeholder = "Поиск";
        container.appendChild(input);
    }

    if (config[page]["delete_button"]) {
        const button = document.createElement("button");
        button.id = "delete_button";
        button.innerHTML = `<span><svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 5H4.16667H17.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.8333 5.00008V16.6667C15.8333 17.1088 15.6577 17.5327 15.3452 17.8453C15.0326 18.1578 14.6087 18.3334 14.1667 18.3334H5.83332C5.3913 18.3334 4.96737 18.1578 4.65481 17.8453C4.34225 17.5327 4.16666 17.1088 4.16666 16.6667V5.00008M6.66666 5.00008V3.33341C6.66666 2.89139 6.84225 2.46746 7.15481 2.1549C7.46737 1.84234 7.8913 1.66675 8.33332 1.66675H11.6667C12.1087 1.66675 12.5326 1.84234 12.8452 2.1549C13.1577 2.46746 13.3333 2.89139 13.3333 3.33341V5.00008" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.33334 9.16675V14.1667" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.6667 9.16675V14.1667" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>&nbsp;Удалить`;
        container.appendChild(button);
    }

    if (config[page]["filter_button"]) {
        const button = document.createElement("button");
        button.innerHTML = `<span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.75 5C0.75 4.58579 1.08579 4.25 1.5 4.25H14.5C14.9142 4.25 15.25 4.58579 15.25 5C15.25 5.41421 14.9142 5.75 14.5 5.75H1.5C1.08579 5.75 0.75 5.41421 0.75 5ZM3.25 8C3.25 7.58579 3.58579 7.25 4 7.25H12C12.4142 7.25 12.75 7.58579 12.75 8C12.75 8.41421 12.4142 8.75 12 8.75H4C3.58579 8.75 3.25 8.41421 3.25 8ZM5.75 11C5.75 10.5858 6.08579 10.25 6.5 10.25H9.5C9.91421 10.25 10.25 10.5858 10.25 11C10.25 11.4142 9.91421 11.75 9.5 11.75H6.5C6.08579 11.75 5.75 11.4142 5.75 11Z" fill="#8F8F8F"/></svg></span>&nbsp;Фильтры`;
        container.appendChild(button);
    }

    if (config[page]["show_hide_button"]) {
        const button = document.createElement("button");
        button.innerHTML = `Показать закрытые`;
        container.appendChild(button);
    }

    if (config[page]["create_button"]) {
        const button = document.createElement("button");
        button.id = "create_button";
        button.innerHTML = `<span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12H16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>&nbsp;Создать`;
        container.appendChild(button);
    }
}

function createTable(tableConfig, tableWrapper, api_url) {
  const table = document.createElement("table");
  table.classList.add("custom-table");

  // Create header row
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  tableConfig.columns.forEach(colName => {
    const th = document.createElement("th");
    if (colName === "CHECKMARK") {
        th.innerHTML = `<input type="checkbox" id="select-all" title="Выбрать все">`;
        th.style.textAlign = "center"; // Center align the checkbox
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
    for (let i = 0; i < tableConfig.columns.length; i++) {
      // create a checkmark if column is "CHECKMARK"
        const td = document.createElement("td");
        if (tableConfig.columns[i] === "CHECKMARK") {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            td.appendChild(checkbox);
            tr.appendChild(td);
            continue;
        }

      // Just fill with rowData for demo; you can replace this with real data
      td.textContent = i === 1 ? rowData : ""; 
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableWrapper.appendChild(table);
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