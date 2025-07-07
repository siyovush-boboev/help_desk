// function transliterate(str) {
//     const map = {
//         'а': 'a',  'б': 'b',  'в': 'v',  'г': 'g',  'д': 'd',
//         'е': 'e',  'ё': 'yo', 'ж': 'zh', 'з': 'z',  'и': 'i',
//         'й': 'y',  'к': 'k',  'л': 'l',  'м': 'm',  'н': 'n',
//         'о': 'o',  'п': 'p',  'р': 'r',  'с': 's',  'т': 't',
//         'у': 'u',  'ф': 'f',  'х': 'kh', 'ц': 'ts', 'ч': 'ch',
//         'ш': 'sh', 'щ': 'shch','ъ': '',  'ы': 'y',  'ь': '',
//         'э': 'e',  'ю': 'yu', 'я': 'ya',

//         'А': 'A',  'Б': 'B',  'В': 'V',  'Г': 'G',  'Д': 'D',
//         'Е': 'E',  'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z',  'И': 'I',
//         'Й': 'Y',  'К': 'K',  'Л': 'L',  'М': 'M',  'Н': 'N',
//         'О': 'O',  'П': 'P',  'Р': 'R',  'С': 'S',  'Т': 'T',
//         'У': 'U',  'Ф': 'F',  'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch',
//         'Ш': 'Sh', 'Щ': 'Shch','Ъ': '',  'Ы': 'Y',  'Ь': '',
//         'Э': 'E',  'Ю': 'Yu', 'Я': 'Ya',

//         " ": "_",  "-": "_",  ".": "_",  ",": "_",  "/": "_",
//     };
//     return str.split('').map(char => map[char] ?? char).join('');
// }

// let PHONE_REGEX = /^\+?(992)?\d{9}$/;

// function isValidEmail(email) {
//   const regex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//   return regex.test(email);
// }


// function get_data_from_api(apiUrl) {
//     return fetch(apiUrl)
//         .then(response => response.json())
//         .catch(error => {
//             console.error('Error fetching API data:', error);
//             return null;
//         });
// }


// function toggleNav() {
//     const nav = document.querySelector('nav');
//     if (nav.style.left === '0px') {
//         nav.style.left = '-1000px';
//     } else {
//         nav.style.left = '0px';
//     }
// }


// function toggleDropdown(second=null) {
//     // Select the correct dropdown container based on the argument (for supporting multiple dropdowns)
//     const dropdown = document.querySelector('.dropdown-container' + (second !== null ? "2" : ''));

//     // Toggle the display mode for dropdown links by checking the current state of the third child
//     let dropdown_mode_to_set = dropdown.children[2].style.display === 'block' ? 'none' : 'block';

//     // Find all dropdown links for this dropdown (handles multiple dropdowns if needed)
//     const links = document.querySelectorAll('.dropdown-link' + (second !== null ? "2" : ''));

//     // Apply the new display mode to each dropdown link
//     for (let i = 0; i < links.length; i++) {
//         links[i].style.display = dropdown_mode_to_set;
//     }

//     // Update the arrow indicator to reflect the dropdown's open/closed state
//     const arrow = dropdown.querySelector('p');
//     if (arrow)
//         arrow.textContent = arrow.textContent.slice(0, -1) + (dropdown_mode_to_set === 'block' ? '▲' : '▼');
// }


// function show_modal(modal, window_name, modal_window_content) {
//     modal.innerHTML = '';
//     while (modal_window_content.firstChild) {
//         modal.appendChild(modal_window_content.firstChild);
//     }
//     modal.style.justifyContent = window_name === 'user_info_modal' ? 'flex-end' : "center";
//     modal.style.alignItems = window_name === 'user_info_modal' ? 'flex-start' : "center";
//     modal.style.display = 'flex';
// }


// function toggleModal(window_name, ...params) {
//     const form = document.querySelector("#editForm");
//     if (form)
//         form.remove();

//     const main_modal = document.querySelector('.modal');
//     if (main_modal.style.display === 'flex' && !window_name) {
//         main_modal.style.display = 'none';
//         main_modal.className = 'modal';
//     } else if (window_name){
//         if (window_name === 'user_info_modal') {
//             user_info_modal(...params).then(content => {
//                 show_modal(main_modal, window_name, content);
//             });
//         } else {
//             const modal_window_content = window[window_name](...params);
//             show_modal(main_modal, window_name, modal_window_content);
//         }
//     }
// }


// function mark_active_link(e) {
//     if (e.target.style.textDecoration === 'underline') {
//         // if the link is already active, do nothing
//         return;
//     }
//     // remove active class from all links
//     const links = document.querySelectorAll('nav a');
//     for (let i = 0; i < links.length; i++) {
//         links[i].classList.remove('active');
//     }
//     // make the link that called this function active
//     e.target.classList.add('active');

//     // close the nav
//     const nav = document.querySelector('nav');
//     nav.style.left = '-1000px';
// }


// function clear_main_content() {
//     document.querySelector('.table-wrapper').innerHTML = '';
//     document.querySelector('.pagination-container').innerHTML = '';
//     document.querySelector('.breadcrumbs').innerHTML = '';
//     document.querySelector('.controls').innerHTML = '';
// }


// function navbar_click(e) {
//     mark_active_link(e);

//     let page = e.target.textContent;
//     if (!(page in CONFIG)) {
//         console.error(`Page "${page}" not found in configuration.`);
//         return;
//     }
//     clear_main_content();

//     const apiUrl = CONFIG[page]['API_route'];
//     let preload_fields = CONFIG[page]["load_form_options"];
//     let preloadPromises = [];

//     if (preload_fields && preload_fields.length > 0) {
//         preload_fields.forEach(field => {
//             if (!(field in CONFIG)) {
//                 console.error(`Field "${field}" not found in configuration for preload.`);
//                 return;
//             }

//             let preloadPromise = get_data_from_api(CONFIG[field]["API_route"])
//                 .then(data => {
//                     const extracted_values = {};
//                     data.result.forEach(obj => {
//                         extracted_values[obj["id"]] = obj;
//                     });
//                     page_data[CONFIG[field]["singular"]] = extracted_values;
//                 });

//             preloadPromises.push(preloadPromise);
//         });
//     }

//     // 👇 Wait for all preload fields to finish loading BEFORE rendering
//     Promise.all(preloadPromises).then(() => {
//         get_data_from_api(apiUrl).then(api_result => {
//             const tableWrapper = document.querySelector('.table-wrapper');
//             tableWrapper.innerHTML = ''; // clear the table wrapper

//             const breadcrumbs = make_breadcrumb(CONFIG[page]["breadcrumbs"]);
//             document.querySelector('.breadcrumbs').innerHTML = breadcrumbs;

//             const control_bar = document.querySelector('.controls')
//             make_control_bar(control_bar, page);

//             page_data["t-rows"] = {};  // table data from api for further use
//             api_result.result.forEach((item) => {
//                 page_data["t-rows"][item["id"]] = item;
//             });

//             createTable(CONFIG[page]['table'], tableWrapper);

//             addDataToTable(CONFIG[page]['table'], tableWrapper, api_result.result, page);

//             const pagination = document.querySelector('.pagination-container');
//             if (CONFIG[page]['pagination']) {
//                 make_pagination(pagination, api_result.pagination);
//             } else {
//                 pagination.innerHTML = ''; // clear pagination if not needed
//             }
//         });
//     });
// }


// function loadConfigAndInit(user_type) {
//     try {
//         const path = `/assets/main_page_settings/for_${user_type}.json`;
//         return get_data_from_api(path);
//     } catch (err) {
//         console.error(`Error loading ${user_type} CONFIG:`, err);
//         return null;
//     }
// }


// // when the page loads, imitate clicking main link in the navbar
// // but if there is a hashtag in the URL, click the link with that hash
// window.addEventListener("load",() => {
//     const USER_TYPE = document.getElementById('user_type').textContent.trim().toLowerCase();
//     loadConfigAndInit(USER_TYPE).then(config => {
//         window.CONFIG = config;
//         if (!CONFIG) {
//             console.error("Configuration could not be loaded.");
//             return;
//         }
//         window.MAXIMUM_TABLE_ROWS_PER_PAGE = 20;
//         window.page_data = {};

//         const hash = window.location.hash.substring(1); // remove the '#'
//         let link = document.querySelector(`nav a[href="#${hash || 'main'}"]`);
//         if (link) {
//             link.click();
//         } else {
//             console.warn(`No link found for hash: ${hash}`);
//         }
//     });
// });

// // Add event listeners for navbar links
// document.querySelectorAll('nav a').forEach(link => link.addEventListener('click', navbar_click));

// // Add event listener for the toggle button (if it has .dropdown-container2 then add parameter second)
// document.querySelectorAll('.dropdown-container, .dropdown-container2').forEach(dropdown => {
//     dropdown.addEventListener('click', (e) => {
//         e.stopPropagation(); // Prevent the click from bubbling up to the document
//         toggleDropdown(dropdown.classList.contains('dropdown-container2') ? 2 : null);
//     });
// });

// // Add event listener for the modal container
// document.querySelector('.modal').addEventListener('click', (e) => {
//     if (e.target === e.currentTarget) // Check if the click is on the modal background
//         toggleModal();
// });

// // Add event listener for the nav toggle button
// document.querySelector('.sandwitch span').addEventListener('click', toggleNav);



import { useContext } from 'react';
import { AuthContext } from '../hooks/useAuth.jsx';

// Hook to use auth context anywhere
export function useAuth() {
  return useContext(AuthContext);
}