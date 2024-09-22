// static/js/about.js
import { autoLogin } from "./module_autologin.js";
import { loadHeaderTo } from "./module_header.js";

document.addEventListener("DOMContentLoaded", async () => {
    await loadHeaderTo(document.querySelector(".header-container"));
    await autoLogin();
});