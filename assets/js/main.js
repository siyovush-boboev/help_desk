const USER_TYPES = {
    User: "user",
    Admin: "admin",
    Executor: "executor",
    Auditor: "auditor"
}
const MAXIMUM_TABLE_ROWS_PER_PAGE = 20;

const USER_TYPE = document.getElementById('user_type').textContent.trim().toLowerCase();
const CONFIG = loadConfigAndInit(USER_TYPE);
if (!CONFIG) {
    console.error(`Failed to load CONFIGuration for ${USER_TYPE} user type.`);
}
let page_data = {}; // global variable to store data for the current page

function toggleDropdown(second=null) {
    const dropdown = document.querySelector('.dropdown-container' + (second !== null ? "2" : ''));
    let dropdown_mode_to_set = dropdown.children[2].style.display === 'block' ? 'none' : 'block';
    const links = document.querySelectorAll('.dropdown-link' + (second !== null ? "2" : ''));
    for (let i = 0; i < links.length; i++) {
        links[i].style.display = dropdown_mode_to_set;
    }
    const arrow = dropdown.querySelector('p');
    if (arrow) {
        arrow.textContent = arrow.textContent.slice(0, -1) + (dropdown_mode_to_set === 'block' ? '▲' : '▼');
    }
}


function toggleNav() {
    const nav = document.querySelector('nav');
    if (nav.style.left === '0px') {
        nav.style.left = '-1000px';
    } else {
        nav.style.left = '0px';
    }
}


function toggleModal(window_name, ...params) {
    const main_modal = document.querySelector('.modal');
    if (main_modal.style.display === 'flex' && !window_name) {
        main_modal.style.display = 'none';
        main_modal.className = 'modal';
    }
    else if (window_name){
        const modal_window_content = window[window_name](...params);
        main_modal.innerHTML = '';
        while (modal_window_content.firstChild) {
            main_modal.appendChild(modal_window_content.firstChild);
        }
        main_modal.style.justifyContent = window_name === 'user_info_modal' ? 'flex-end' : "center";
        main_modal.style.alignItems = window_name === 'user_info_modal' ? 'flex-start' : "center";
        main_modal.style.display = 'flex';
    }
}


function mark_active_link(e) {
    if (e.target.style.textDecoration === 'underline') {
        // if the link is already active, do nothing
        return;
    }
    // underline the link that called this function
    const links = document.querySelectorAll('nav a');
    for (let i = 0; i < links.length; i++) {
        links[i].classList.remove('active');
    }
    // make the link that called this function active
    e.target.classList.add('active');

    // close the nav
    const nav = document.querySelector('nav');
    nav.style.left = '-1000px';
}


function loadConfigAndInit(user_type) {
  try {
    // Alternative to fetch()
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/assets/main_page_settings/for_${user_type}.json`, false);
    xhr.send(null);
    if (xhr.status === 200) {
        return JSON.parse(xhr.responseText);
    } else {
        throw new Error('Failed to load CONFIG');
    }
  } catch (err) {
    console.error(`Error loading ${user_type} CONFIG:`, err);
  }
}


function get_data_from_api(apiUrl) {
    return fetch(apiUrl)
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching API data:', error);
            return null;
        });
}


function navbar_click(e, user_type){
    if (user_type === USER_TYPES.Admin){
        let page = e.target.textContent;
        // if page not in CONFIG, return
        if (!(page in CONFIG)) {
            console.error(`Page "${page}" not found in configuration.`);
            return;
        }

        let preload_fields = CONFIG[page]["load_form_options"];
        if (preload_fields && preload_fields.length > 0) {
            CONFIG[page]["load_form_options"].forEach(field => {
                if (!(field in CONFIG)) {
                    console.error(`Field "${field}" not found in configuration for preload.`);
                    return;
                }
                fetch(CONFIG[field]["API_route"]).then(response => response.json())
                .then(data => {
                    const extracted_values = data.result.map(obj => {
                    // find the key that contains "наименование" (case-insensitive)
                    const key = Object.keys(obj).find(k => k.toLowerCase().includes("наименование"));
                    return key ? obj[key] : null;
                    }).filter(val => val !== null);

                    page_data[field] = extracted_values;
                })
            });
        }
        const breadcrumbs = make_breadcrumb(CONFIG[page]["breadcrumbs"]);
        document.querySelector('.breadcrumbs').innerHTML = breadcrumbs;

        const control_bar = document.querySelector('.controls')
        make_control_bar(control_bar, page);

        const apiUrl = CONFIG[page]['API_route'];
        get_data_from_api(apiUrl).then(api_result => {
            page_data["t-rows"] = []; // initialize t-rows for the page
            api_result.result.forEach((item) => {
                page_data["t-rows"].push(item);
            });

            const tableWrapper = document.querySelector('.table-wrapper');
            tableWrapper.innerHTML = ''; // clear the table wrapper
            createTable(CONFIG[page]['table'], tableWrapper);

            // add data from api into the table
            addDataToTable(CONFIG[page]['table'], tableWrapper, api_result);

            const pagination = document.querySelector('.pagination-container');
            if (CONFIG[page]['pagination']) {
                make_pagination(pagination, api_result.pagination);
            }
            else{
                pagination.innerHTML = ''; // clear pagination if not needed
            }
        });

    }
    mark_active_link(e);
}

// make functions available globally
window.navbar_click = navbar_click;
window.toggleDropdown = toggleDropdown;
window.toggleNav = toggleNav;

// when the page loads, imitate clicking main link in the navbar
// but if there is a hashtag in the URL, click the link with that hash
document.addEventListener("DOMContentLoaded",() => {
    const hash = window.location.hash.substring(1); // remove the '#'
    let link = document.querySelector(`nav a[href="#${hash || 'main'}"]`);
    if (link) {
        link.click();
    } else {
        console.warn(`No link found for hash: ${hash}`);
    }
});