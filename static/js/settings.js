// static/js/settings.js
import { autoLogin } from "./module_autologin.js";
import { loadHeaderTo } from "./module_header.js";
import { loadSettingsTo, saveSettings } from "./module_settings.js";

async function handleSettings(e) {
    e.preventDefault();

    // settings values start here
    const settings = {
        is_gae: document.getElementById("is_gae").checked
    };

    await saveSettings(settings);
}

function saveSettingsListener() {
    const saveSettingsButton = document.getElementById("save-button");
    saveSettingsButton.addEventListener("click", handleSettings);
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadHeaderTo(document.querySelector(".header-container"));
    await loadSettingsTo(document.querySelector(".settings-container"));
    saveSettingsListener();
    await autoLogin();
});