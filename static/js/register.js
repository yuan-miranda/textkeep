function removeBorderOnInteract(element, elementInteract=element) {
    elementInteract.addEventListener("focus", () => element.style.border = "");
    elementInteract.addEventListener("input", () => element.style.border = "");
}

function removeTextOnInteract(element, elementInteract=element) {
    // elementInteract.addEventListener("focus", () => element.textContent = "");
    elementInteract.addEventListener("input", () => element.textContent = "");
}

function addErrorBorder(element, elementInteract=element) {
    element.style.border = "2px solid red";
    removeBorderOnInteract(element, elementInteract);
}

function addErrorText(element, message, elementInteract=element) {
    element.textContent = message;
    removeTextOnInteract(element, elementInteract);
}

const addError = (element, elementInteract=element, message) => {
    addErrorBorder(elementInteract);
    addErrorText(element, message, elementInteract);
}

function handleRegister(e) {
    e.preventDefault();
    let username = document.getElementById("username-input").value;
    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;
    let isValid = true;
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
    register(username, email, password);
}

async function register(username, email, password) {
    try {
        const response = await fetch("/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });
        await handleRegisterStatus(response);
    } catch (err) {
        alert("An error occurred: " + err);
    }
}

async function handleRegisterStatus(response) {
    const data = await response.json();
    switch (response.status) {
        case 200:
            alert("Registration successful!");
            break;
        case 422:
            if (data.error === "Username already exists") addError(document.querySelector(".username-error"), document.getElementById("username-input"), data.error);
            if (data.error === "Email already exists") addError(document.querySelector(".email-error"), document.getElementById("email-input"), data.error);
            break;
        case 500:
            alert("An error occurred: " + data.error);
            break;
    }
}

function registerButtonListener() {
    const registerButton = document.getElementById("register-button");
    registerButton.addEventListener("click", (e) => handleRegister(e));
}

document.addEventListener("DOMContentLoaded", () => {
    registerButtonListener();
});