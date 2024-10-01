// static/js/logout.js
import { addNotification, loadPersistenNotifications } from "./module_notification.js";

function handleLogout() {
    logout();
}

async function logout() {
    try {
        const response = await fetch("/auth/logout", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        handleLogoutStatus(response);
    } catch (err) {
        addNotification(err, "bad");
    }
}

function handleLogoutStatus(response) {
    switch (response.status) {
        case 200:
        case 401:
            addNotification("You have been logged out", "good");
            window.location.href = "/login";
            break;
        case 500:
            addNotification(data.error, "bad");
            break;
        default:
            addNotification(`DEFAULT: ${data.error}`, "bad");
            break;
    }
}

function logoutButtonListener() {
    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", () => handleLogout());
}

document.addEventListener("DOMContentLoaded", () => {
    loadPersistenNotifications();
    logoutButtonListener();
});