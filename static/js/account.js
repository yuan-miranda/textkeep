async function fetchAccount() {
    const token = localStorage.getItem("token");
    // If there is no token, it means its a guest account
    // likely to notify that the user is a guest and can't access the account page,
    // or redirect to the login page
    if (!token) {
        alert("You are not authorized to view this page. Please log in.");
        window.location.href = "/login";
    }
    try {
        const response = await fetch("/auth/account", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (response.status !== 200) {
            alert("An error occurred. Please try again later.");
            return;
        }
        const data = await response.json();
        const username = document.getElementById("username");
        const email = document.getElementById("email");
        const password = document.getElementById("password");
        username.textContent = data.username;
        email.textContent = data.email;
        password.textContent = data.password;
    } catch (err) {
        console.error("Error fetching account: ", err);
        alert("An error occurred. Please try again later.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchAccount();
});