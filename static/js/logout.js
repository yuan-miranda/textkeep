
function handleLogout() {
    logout();
}

async function logout() {
    try {
        const response = await fetch("/auth/logout", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        handleLogoutStatus(response);
    } catch (err) {
        addNotification(err, "bad");
    }
}

function handleLogoutStatus(response) {
    switch (response.status) {
        case 200:
        case 401:
            window.location.href = "/login";
            break;
        case 500:
            addNotification(data.error, "bad");
            break;
        default:
            addNotification(`DEFAULT: ${data.error}`, "bad");
            break;
    }
}

function logoutButtonListener() {
    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", () => handleLogout());
}

document.addEventListener("DOMContentLoaded", () => {
    logoutButtonListener();
});