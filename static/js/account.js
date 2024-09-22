// static/js/account.js
import { getAccount } from "./module_account.js";
import { loadHeaderTo } from "./module_header.js";

document.addEventListener('DOMContentLoaded', async () => {
    await loadHeaderTo(document.querySelector(".header-container"));
    await getAccount();
});