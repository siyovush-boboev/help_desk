const USER_TYPES = {
    User: "user",
    Admin: "admin",
    Executor: "executor",
    Auditor: "auditor"
}
const MAXIMUM_TABLE_ROWS_PER_PAGE = 20;

let user_type = document.getElementById('usr_tp').textContent.trim().toLowerCase();
let config = loadConfigAndInit(user_type);
if (!config) {
    console.error(`Failed to load configuration for ${user_type} user type.`);
}

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
        throw new Error('Failed to load config');
    }
  } catch (err) {
    console.error(`Error loading ${user_type} config:`, err);
  }
}


function navbar_click(e, user_type){
    if (user_type === USER_TYPES.Admin){
        let page = e.target.textContent;
        // if page not in config, return
        if (!(page in config)) {
            console.error(`Page "${page}" not found in configuration.`);
            return;
        }
        const breadcrumbs = make_breadcrumb(config[page]["breadcrumbs"]);
        document.querySelector('.breadcrumbs').innerHTML = breadcrumbs;

        const control_bar = document.querySelector('.controls')
        make_control_bar(control_bar, page);

        const tableWrapper = document.querySelector('.table-wrapper');
        tableWrapper.innerHTML = ''; // clear the table wrapper
        createTable(config[page]['table'], tableWrapper);

        // add data from api into the table
        const apiUrl = e.target.dataset.apiurl;
        addDataToTable(config[page]['table'], tableWrapper, apiUrl);

        const pagination = document.querySelector('.pagination-container');
        if (config[page]['pagination']) {
            make_pagination(pagination, page);
        }
        else{
            pagination.innerHTML = ''; // clear pagination if not needed
        }
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