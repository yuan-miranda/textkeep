// module_account.js
import { addNotification } from "./module_notification.js";

export async function getAccount() {
    try {
        const response = await fetch("/auth/account", {
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
            displayUserData(data.data.user);
            break;
        case 401:
        case 422:
        case 500:
            addNotification(data.error, "bad");
            break;
        default:
            addNotification(`DEFAULT: ${data.error}`, "bad");
            break;
    }
}

export function displayUserData(user) {
    document.getElementById("id").textContent = user.id;
    document.getElementById("username").textContent = user.username;
    document.getElementById("bio").textContent = user.bio;
    document.getElementById("profile-image").src = user.profile_image;
    document.getElementById("email").textContent = user.email;
    document.getElementById("password").textContent = user.password;
    document.getElementById("last-login").textContent = user.last_login;
    document.getElementById("account-date-created").textContent = user.account_date_created;
    document.getElementById("account-date-updated").textContent = user.account_date_updated;
    document.getElementById("account-date-deleted").textContent = user.account_date_deleted;
}