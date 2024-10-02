// static/js/admin.js
import { loadHeaderTo } from "./module_header.js";
import { loadPersistenNotifications } from "./module_notification.js";

document.addEventListener("DOMContentLoaded", async () => {
    loadPersistenNotifications();
    await loadHeaderTo(document.querySelector(".header-container"));
});