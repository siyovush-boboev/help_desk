function toggleDropdown(second=null) {
    const dropdown = document.querySelector('.dropdown-container' + (second !== null ? "2" : ''));
    let dropdown_mode_to_set = dropdown.children[2].style.display === 'block' ? 'none' : 'block';
    const links = document.querySelectorAll('.dropdown-link' + (second !== null ? "2" : ''));
    for (let i = 0; i < links.length; i++) {
        links[i].style.display = dropdown_mode_to_set;
    }
    console.log("tgl drp called");
}


function toggleNav() {
    console.log("toggleNav called");
    const nav = document.querySelector('nav');
    if (nav.style.left === '0px') {
        nav.style.left = '-1000px';
    } else {
        nav.style.left = '0px';
    }
}

function navbar_click(e){
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