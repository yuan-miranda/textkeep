// static/js/main.js
import { autoLogin } from "./module_autologin.js";
import { loadHeaderTo } from "./module_header.js";

document.addEventListener("DOMContentLoaded", async () => {
    // <div class="header-container"></div>
    await loadHeaderTo(document.querySelector(".header-container"));
    await autoLogin();
});