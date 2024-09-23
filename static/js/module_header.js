// static/js/module_header.js

function toggleDropdownMenu(headerContainer) {
    const profileIcon = headerContainer.querySelector(".profile-icon");
    const dropdownMenu = headerContainer.querySelector(".dropdown-menu");
    
    // display dropdown when profile icon is clicked
    profileIcon.addEventListener("click", (event) => {
        event.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    });
    // hide dropdown when user clicks outside of it
    document.addEventListener("click", (event) => { if (!dropdownMenu.contains(event.target)) dropdownMenu.style.display = "none"; });
}

export async function loadHeaderTo(headerContainer) {
    try {
        const response = await fetch("/html/module_header.html");
        const data = await response.text();
        headerContainer.innerHTML = data;
        toggleDropdownMenu(headerContainer);
    } catch (err) {
        console.error(`Error loading header: ${err}`);
    }
}