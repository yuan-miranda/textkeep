// static/js/module_settings.js
import { addNotification } from "./module_notification.js";

export async function loadSettingsTo(settingsContainer) {
    try {
        const response = await fetch("/auth/settings", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        await handleLoadSettingsStatus(response, settingsContainer);
    } catch (err) {
        addNotification(err, "bad");
    }
}

export async function saveSettings(settings) {
    try {
        const response = await fetch("/auth/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ settings })
        });
        await handleSaveSettingsStatus(response);
    } catch (err) {
        addNotification(err, "bad");
    }
}

async function handleLoadSettingsStatus(response, settingsContainer) {
    const data = await response.json();
    switch (response.status) {
        case 200:
            settingsContainer.innerHTML = `
                <h2>Settings</h2>
                <form id="settings-form">
                    <label for="is_gae">Are you gae? </label>
                    <input type="checkbox" id="is_gae" name="is_gae" ${data.data.userSettings.is_gae ? "checked" : ""}>
                    <button type="submit" id="save-button">Save</button>
                </form>
            `;
            break;
        case 401:
            window.location.href = "/auth/login";
            break;
        case 422:
        case 500:
            addNotification(data.error, "bad");
            break;
        default:
            addNotification(`DEFAULT: ${data.error}`, "bad")
    }
}

async function handleSaveSettingsStatus(response) {
    const data = await response.json();
    switch (response.status) {
        case 200:
            addNotification(data.message, "good");
            break;
        case 401:
            window.location.href = "/login";
            addNotification(data.error, "bad");
            break;
        case 422:
        case 500:
            addNotification(data.error, "bad");
            break;
        default:
            addNotification(`DEFAULT: ${data.error}`, "bad")
    }
}