import { MAXIMUM_TABLE_ROWS_PER_PAGE } from '../../lib/constants';


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

    container.appendChild(infoDiv);
    container.appendChild(navDiv);
}
