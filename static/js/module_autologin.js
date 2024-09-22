// static/js/module_autologin.js
import { addNotification } from "./module_notification.js";

export async function autoLogin() {
    try {
        const response = await fetch("/auth/auto-login", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        await handleLoginStatus(response);
    } catch (err) {
        addNotification(`CATCH: ${err}`, "bad");
    }
}

export async function handleLoginStatus(response) {
    const data = await response.json();
    switch (response.status) {
        case 200:
            document.getElementById("name").textContent = data.data.user.username;
            displayUserProfile(data.data.user.profile_image);
            break;
        case 401:
        case 422:
        case 500:
            displayUserProfile();
            addNotification(data.error, "bad");
            break;
        default:
            displayUserProfile();
            addNotification(`DEFAULT: ${data.error}`, "bad");
            break;
    }
}

export function displayUserProfile(image="../media/profiles/defaultprofile.png") {
    const profileIcon = document.getElementById("profile-image");
    profileIcon.src = image;
}