// main.js
import { autoLogin } from "./module_autologin.js";

document.addEventListener("DOMContentLoaded", async () => {
    await autoLogin();
});