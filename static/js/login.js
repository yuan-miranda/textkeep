// static/js/login.js
import { addError } from "./module_addError.js";
import { addNotification } from "./module_notification.js";

async function handleLoginStatus(response) {
    const data = await response.json();
    switch (response.status) {
        case 200:
            window.location.href = "/";
            break;
        case 401:
            if (data.error === "User already logged in") window.location.href = "/";
            else addError(document.querySelector(".password-error"), document.getElementById("password-input"), data.error);
            break;
        case 422:
            addError(document.querySelector(".username-email-error"), document.getElementById("username-email-input"), data.error);
            break;
        case 500:
            addNotification(data.error, "bad");
            break;
        default:
            addNotification(`DEFAULT: ${data.error}`, "bad")
            break;
    }
}

async function login(usernameEmail, password) {
    try {
        const response = await fetch("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernameEmail, password })
        });
        await handleLoginStatus(response);
    } catch (err) {
        addNotification(`CATCH: ${err}`, "bad");
    }
}

function handleLogin(e) {
    e.preventDefault();
    const usernameEmail = document.getElementById("username-email-input").value;

    // const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;
    let isValid = true;

    if (!usernameEmail) {
        addError(document.querySelector(".username-email-error"), document.getElementById("username-email-input"), "Username or email is required");
        isValid = false;
    } else {
        // check if the input is an email using "@"
        if (usernameEmail.includes("@")) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameEmail)) {
                addError(document.querySelector(".username-email-error"), document.getElementById("username-email-input"), "Email is invalid");
                isValid = false;
            }
        } else {
            // remove special characters (except for - and _)
            if (!/^[a-zA-Z0-9-_]*$/.test(usernameEmail)) {
                addError(document.querySelector(".username-email-error"), document.getElementById("username-email-input"), "Username can only contain letters, numbers, - and _");
                isValid = false;
            }
        }
    }
    if (!password) {
        addError(document.querySelector(".password-error"), document.getElementById("password-input"), "Password is required");
        isValid = false;
    }
    if (!isValid) return;
    login(usernameEmail, password);
}

function loginButtonListener() {
    const loginButton = document.getElementById("login-button");
    loginButton.addEventListener("click", (e) => handleLogin(e));
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
    loginButtonListener();
    guestButtonListener();
    togglePasswordVisibilityListener();
});