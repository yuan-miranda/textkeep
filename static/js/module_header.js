// static/js/module_header.js

function toggleDropdownMenu(headerContainer) {
    const profileIcon = headerContainer.querySelector(".profile-icon");
    const dropdownMenu = headerContainer.querySelector(".dropdown-menu");
    
    // display dropdown when profile icon is clicked
    profileIcon.addEventListener("click", (event) => {
        event.stopPropagation();
        console.log(`before click: ${dropdownMenu.style.display}`);
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
        console.log(`after click: ${dropdownMenu.style.display}`);
    });
    // hide dropdown when user clicks outside of it
    document.addEventListener("click", () => dropdownMenu.style.display = "none");
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