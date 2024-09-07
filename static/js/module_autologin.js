// module_autologin.js
async function autoLogin() {
    try {
        const response = await fetch("/auth/auto-login", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        await handleLoginStatus(response);
    } catch (err) {
        addNotification(`CATCH: ${err}`, "bad");
    }
}

async function handleLoginStatus(response) {
    const data = await response.json();
    switch (response.status) {
        case 200:
            const name = document.getElementById("name");
            name.textContent = data.data.user.username;
            displayUserProfile(data.data.user.profile_image);
            break;
        case 401:
        case 422:
        case 500:
            displayUserProfile();
            break;
        default:
            displayUserProfile();
            addNotification(`DEFAULT: ${data.error}`, "bad");
            break;
    }
}

function displayUserProfile(image="../../media/profiles/defaultprofile.png") {
    const profileIcon = document.getElementById("profile-image");
    profileIcon.src = image;
}