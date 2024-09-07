// module_notification.js
function addNotification(message, type) {
    const notificatioContainer = document.querySelector(".notification-container");
    const notification = document.createElement("div");
    notification.classList.add("notification", `notification-${type}`);

    // notification content
    notification.innerHTML = `
        <p id="notification-text">${message}</p>
        <span id="notification-close">&times;</span>
    `;
    notificatioContainer.appendChild(notification);

    // remove notification when close button is clicked
    const notificationClose = document.getElementById("notification-close");
    notificationClose.addEventListener("click", () => removeNotification(notification));

    notificationTimeout(notification);
}

function removeNotification(notification) {
    notification.remove();
}

function notificationTimeout(notification) {
    // remove notification after 10 seconds
    setTimeout(() => removeNotification(notification), 10000);
}