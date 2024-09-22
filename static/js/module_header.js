// static/js/module_header.js
export async function loadHeaderTo(headerContainer) {
    try {
        const response = await fetch("/html/module_header.html");
        const data = await response.text();
        headerContainer.innerHTML = data;
    } catch (err) {
        console.error(`Error loading header: ${err}`);
    }
}