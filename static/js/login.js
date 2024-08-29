// missing
// autologin
// logout

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

async function handleLoginStatus(response) {
    switch (response.status) {
        case 200:
            const data = await response.json();
            localStorage.setItem("token", data.token);
            window.location.href = "/account";
            break;
        case 422:
            addError(document.querySelector(".email-error"), document.getElementById("email-input"), "Email not found");
            break;
        case 401:
            addError(document.querySelector(".password-error"), document.getElementById("password-input"), "Invalid password");
            break;
        default:
            alert("An error occurred. Please try again later");
            break;
    }
}

async function login(email, password) {
    try {
        const response = await fetch("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        await handleLoginStatus(response);
    } catch (err) {
        alert("An error occurred. Please try again later");
    }
}

// async function logout() {
//     localStorage.removeItem("token");
//     window.location.href = "/";
// }

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;
    let isValid = true;
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
    login(email, password);
}

function loginButtonListener() {
    const loginButton = document.getElementById("login-button");
    loginButton.addEventListener("click", (e) => handleLogin(e));
}

document.addEventListener("DOMContentLoaded", () => {
    loginButtonListener();
});