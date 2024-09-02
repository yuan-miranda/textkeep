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
    const data = await response.json();
    switch (response.status) {
        case 200:
            localStorage.setItem("token", data.token);
            window.location.href = "/account";
            break;
        case 422:
            addError(document.querySelector(".username-email-error"), document.getElementById("username-email-input"), data.error);
            break;
        case 401:
            addError(document.querySelector(".password-error"), document.getElementById("password-input"), data.error);
            break;
        case 500:
            alert("An error occurred: " + data.error);
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
        alert("An error occurred: " + err);
    }
}

// async function logout() {
//     localStorage.removeItem("token");
//     window.location.href = "/";
// }

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
        if (usernameEmail.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameEmail)) {
            addError(document.querySelector(".username-email-error"), document.getElementById("username-email-input"), "Email is invalid");
            isValid = false;
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

document.addEventListener("DOMContentLoaded", () => {
    loginButtonListener();
    togglePasswordVisibilityListener();
});