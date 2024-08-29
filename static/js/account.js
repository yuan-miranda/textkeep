async function handleStatus(response) {
    switch (response.status) {
        case 200:
            const data = await response.json();
            document.getElementById("id").textContent = data.id;
            document.getElementById("username").textContent = data.username;
            document.getElementById("bio").textContent = data.bio;
            document.getElementById("email").textContent = data.email;
            document.getElementById("password").textContent = data.password;
            document.getElementById("last_login").textContent = data.last_login;
            document.getElementById("account_date_created").textContent = data.account_date_created;
            document.getElementById("account_date_updated").textContent = data.account_date_updated;
            document.getElementById("account_date_deleted").textContent = data.account_date_deleted;
            break;
        case 500:
            alert("An error occurred. Please try again later.");
            break;
    }
}

async function fetchAccount() {
    const token = localStorage.getItem("token");
    // If there is no token, it means its a guest account
    // likely to notify that the user is a guest and can't access the account page,
    // or redirect to the login page
    if (!token) {
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
        await handleStatus(response);
    } catch (err) {
        alert("An error occurred. Please try again later.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchAccount();
});