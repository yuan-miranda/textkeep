async function register() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const result = await fetch("/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });
        alert("Registration successful!");
    } catch (err) {
        console.error("Error registering: ", err);
        alert("An error occurred. Please try again later.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const registerButton = document.getElementById("register-button");
    registerButton.addEventListener("click", () => {
        register();
    });
});