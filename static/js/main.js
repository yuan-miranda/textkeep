async function autoLogin() {
    try {
        const response = await fetch("/auth/auto-login", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        await handleLoginStatus(response);

    } catch (err) {
        alert("An error occurred: " + err);
    }
}

async function handleLoginStatus(response) {
    const data = await response.json();
    switch (response.status) {
        case 200:
            displayUserProfile(data.user.profile_image);
            break;
        case 401:
        case 422:
        case 500:
            displayGuestProfile();
            break;
        default:
            displayGuestProfile();
            alert("DEFAULT: An error occurred: " + data.error);
            break;
    }
}

function displayUserProfile(url) {
    const profileIcon = document.querySelector(".profile-icon");
    profileIcon.src = url;

}

function displayGuestProfile() {
    const profileIcon = document.querySelector(".profile-icon");
    profileIcon.src = "../../media/profiles/defaultprofile.png";
}

document.addEventListener("DOMContentLoaded", () => {
    autoLogin();
});