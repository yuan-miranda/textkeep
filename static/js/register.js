// register.js
import { addError } from "./module_addError.js";
import { addNotification } from "./module_notification.js";

function handleRegister(e) {
    e.preventDefault();
    let isValid = true;
    let username = document.getElementById("username-input").value;
    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;
    const isImportGuestData = document.getElementById("import-guest-data-checkbox").checked;

    if (username) {
        // remove special characters (except for - and _)
        if (!/^[a-zA-Z0-9-_]*$/.test(username)) {
            addError(document.querySelector(".username-error"), document.getElementById("username-input"), "Username can only contain letters, numbers, - and _");
            isValid = false;
        }
    }
    if (!email) {
        addError(document.querySelector(".email-error"), document.getElementById("email-input"), "Email is required");
        isValid = false;
    }
    if (email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            addError(document.querySelector(".email-error"), document.getElementById("email-input"), "Email is invalid");
            isValid = false;
        }
    }
    if (!password) {
        addError(document.querySelector(".password-error"), document.getElementById("password-input"), "Password is required");
        isValid = false;
    }
    if (!isValid) return;
    if (!username) username = email.split("@")[0];

    register(username, email, password, isImportGuestData);
}

async function register(username, email, password, isImportGuestData) {
    try {
        const response = await fetch("/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, isImportGuestData })
        });
        await handleRegisterStatus(response);
    } catch (err) {
        addNotification(`CATCH: ${err}`, "bad");
    }
}

async function handleRegisterStatus(response) {
    const data = await response.json();
    switch (response.status) {
        case 200:
            window.location.href = `/account/email/verify?email=${encodeURIComponent(data.data.email)}`;
            break;
        case 401:
            window.location.href = "/";
            break;
        case 422:
            if (data.error === "Username already exists") addError(document.querySelector(".username-error"), document.getElementById("username-input"), data.error);
            if (data.error === "Email already exists") addError(document.querySelector(".email-error"), document.getElementById("email-input"), data.error);
            if (data.error === "Username already registered") addError(document.querySelector(".username-error"), document.getElementById("username-input"), data.error);
            if (data.error === "Email already registered") addError(document.querySelector(".email-error"), document.getElementById("email-input"), data.error);
            break;
        case 500:
            addNotification(data.error, "bad");
            break;
        default:
            addNotification(`DEFAULT: ${data.error}`, "bad");
            break;
    }
}

function registerButtonListener() {
    const registerButton = document.getElementById("register-button");
    registerButton.addEventListener("click", (e) => handleRegister(e));
}

function togglePasswordVisibilityListener() {
    const passwordInput = document.getElementById("password-input");
    const toggleButton = document.getElementById("toggle-password-visibility-button");
    toggleButton.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleButton.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            toggleButton.textContent = "Show";
        }
    });
}

function guestButtonListener() {
    const guestButton = document.getElementById("guest-button");
    guestButton.addEventListener("click", () => window.location.href = "/");
}

document.addEventListener("DOMContentLoaded", () => {
    registerButtonListener();
    guestButtonListener();
    togglePasswordVisibilityListener();
});