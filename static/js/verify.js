// static/js/verify.js
import { addNotification, loadPersistenNotifications } from "./module_notification.js";

async function resendEmail() {
    try {
        const response = await fetch("/session/email/resend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        await handleResendStatus(response);
    } catch (err) {
        addNotification(`CATCH: ${err}`, "bad");
    }
}

async function handleResendStatus(response) {
    const data = await response.json();
    switch (response.status) {
        case 200:
            addNotification(data.message, "good");
            break;
        case 401:
            addNotification(data.error, "bad");
            break;
        case 429:
            addNotification(data.error, "bad");
            break;
        case 500:
            addNotification(data.error, "bad");
            break;
        default:
            addNotification(`DEFAULT: ${data.error}`, "bad");
            break;
    }
}

function handleResendEmail(e) {
    e.preventDefault();
    const emailDisplay = document.getElementById("email-display");
    const emailUrl = new URLSearchParams(window.location.search).get("email");
    if (emailUrl) emailDisplay.textContent = emailUrl;
    resendEmail();
}

function resendEmailCooldown() {
    const resendEmailLink = document.getElementById("resend-email-link");
    resendEmailLink.addEventListener("click", (e) => handleResendEmail(e));
}

document.addEventListener('DOMContentLoaded', async () => {
    loadPersistenNotifications();
    resendEmailCooldown();
});