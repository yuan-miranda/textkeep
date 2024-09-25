// static/js/module_settings.js
import { addNotification } from "./module_notification.js";

export async function loadSettingsTo(element) {
    try {
        const response = await fetch("/auth/settings", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        handleSettingsStatus(response);
    } catch (err) {
        addNotification(err, "bad");
    }
}

function handleSettingsStatus(response) {
    
}