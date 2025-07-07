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

        input.addEventListener("keydown", (e) => {
            // Show the clear button when typing
            searchContainer.querySelector("#clear-button").style.display = "inline-flex";
            if (e.key === "Enter") {
                console.log(`Searching for: ${input.value}`);
                // #TODO: implement search functionality here
            }
        });

        // Add a clear button to the search input
        const clearButton = document.createElement("button");
        clearButton.id = "clear-button";
        clearButton.innerText = "❌";
        clearButton.style.display = "none";
        clearButton.addEventListener("click", () => {
            input.value = ""; // Clear the input
            clearButton.style.display = "none"; // Hide the clear button
        });

        searchContainer.appendChild(input);
        searchContainer.appendChild(clearButton);
        container.appendChild(searchContainer);
    }
    if (CONFIG[page]["delete_button"]) {
        const button = document.createElement("button");
        button.id = "delete_button";
        button.innerHTML = `<span><svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 5H4.16667H17.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.8333 5.00008V16.6667C15.8333 17.1088 15.6577 17.5327 15.3452 17.8453C15.0326 18.1578 14.6087 18.3334 14.1667 18.3334H5.83332C5.3913 18.3334 4.96737 18.1578 4.65481 17.8453C4.34225 17.5327 4.16666 17.1088 4.16666 16.6667V5.00008M6.66666 5.00008V3.33341C6.66666 2.89139 6.84225 2.46746 7.15481 2.1549C7.46737 1.84234 7.8913 1.66675 8.33332 1.66675H11.6667C12.1087 1.66675 12.5326 1.84234 12.8452 2.1549C13.1577 2.46746 13.3333 2.89139 13.3333 3.33341V5.00008" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.33334 9.16675V14.1667" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.6667 9.16675V14.1667" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>&nbsp;Удалить`;

        button.addEventListener("click", () => {
            const checkboxes = document.querySelectorAll(".custom-table tbody input[type='checkbox']:checked");
            // if no checkboxes are checked, nothing to delete
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
        container.appendChild(button);
    }
    if (CONFIG[page]["filters"]) {
        const button = document.createElement("button");
        button.innerHTML = `<span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.75 5C0.75 4.58579 1.08579 4.25 1.5 4.25H14.5C14.9142 4.25 15.25 4.58579 15.25 5C15.25 5.41421 14.9142 5.75 14.5 5.75H1.5C1.08579 5.75 0.75 5.41421 0.75 5ZM3.25 8C3.25 7.58579 3.58579 7.25 4 7.25H12C12.4142 7.25 12.75 7.58579 12.75 8C12.75 8.41421 12.4142 8.75 12 8.75H4C3.58579 8.75 3.25 8.41421 3.25 8ZM5.75 11C5.75 10.5858 6.08579 10.25 6.5 10.25H9.5C9.91421 10.25 10.25 10.5858 10.25 11C10.25 11.4142 9.91421 11.75 9.5 11.75H6.5C6.08579 11.75 5.75 11.4142 5.75 11Z" fill="#8F8F8F"/></svg></span>&nbsp;Фильтры`;
        button.addEventListener("click", filter_form);
        container.appendChild(button);
    }
    if (CONFIG[page]["show_hide_button"]) {
        const button = document.createElement("button");
        button.innerHTML = `Показать закрытые`;
        button.id = "show_hide_button";
        // onclick show/hide table rows that have "Статус" column with value "Закрыто"
        button.addEventListener("click", () => {
            toggleButton = document.getElementById("show_hide_button");
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
            toggleButton.textContent = button.textContent === "Показать закрытые" ? "Скрыть закрытые" : "Показать закрытые";
        });
        container.appendChild(button);
    }
    if (CONFIG[page]["create_button"]) {
        const button = document.createElement("button");
        button.id = "create_button";
        button.innerHTML = `<span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12H16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>&nbsp;Создать`;
        button.addEventListener("click", edit_or_create_form);
        container.appendChild(button);
    }
}
