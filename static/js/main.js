// static/js/main.js
import { autoLogin } from "./module_autologin.js";
import { loadHeaderTo } from "./module_header.js";
import { loadPersistenNotifications } from "./module_notification.js";

document.addEventListener("DOMContentLoaded", async () => {
    loadPersistenNotifications();
    await loadHeaderTo(document.querySelector(".header-container"));
    await autoLogin();
});