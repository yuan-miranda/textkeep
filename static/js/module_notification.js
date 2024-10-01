// static/js/module_notification.js
export function addNotification(message, type) {
    const notificatioContainer = document.querySelector(".notification-container");
    const notification = document.createElement("div");
    notification.classList.add("notification", `notification-${type}`);

    // unique id for each notification
    const notificationId = Date.now();
    notification.setAttribute("data-id", notificationId);

    // notification content
    notification.innerHTML = `
        <p id="notification-text">${message}</p>
        <span class="notification-close">&times;</span>
    `;
    notificatioContainer.appendChild(notification);

    storePersistenNotification({ id: notificationId, message, type });

    // remove notification when close button is clicked
    const notificationClose = notification.querySelector(".notification-close");
    notificationClose.addEventListener("click", () => {
        removeNotification(notification);
        removePersistenNotification(notificationId);
    });

    notificationTimeout(notification);
}

export function notificationTimeout(notification, remainingTime = 10000) {
    // remove notification after 10 seconds
    setTimeout(() => {
        removeNotification(notification);
        removePersistenNotification(notification.getAttribute("data-id"));
    }, remainingTime);
}

export function removeNotification(notification) {
    notification.remove();
}

export function loadPersistenNotifications() {
    const now = Date.now();
    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];

    // load and remove notifications older than 10 seconds
    notifications.forEach(notification => {
        const remainingTime =  10000 - (now - notification.timestamp);

        if (remainingTime > 0) addFromPersistentNotification(notification.message, notification.type, remainingTime);
        else removePersistenNotification(notification.id);
    });
}

function addFromPersistentNotification(message, type, remainingTime) {
    const notificatioContainer = document.querySelector(".notification-container");
    const notification = document.createElement("div");
    notification.classList.add("notification", `notification-${type}`);

    // notification content
    notification.innerHTML = `
        <p id="notification-text">${message}</p>
        <span class="notification-close">&times;</span>
    `;
    notificatioContainer.appendChild(notification);

    // remove notification when close button is clicked
    const notificationClose = notification.querySelector(".notification-close");
    notificationClose.addEventListener("click", () => {
        removeNotification(notification);
        removePersistenNotification(notification.getAttribute("data-id"));
    });

    notificationTimeout(notification, remainingTime);
}

function storePersistenNotification(notification) {
    notification.timestamp = Date.now();
    let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    notifications.push(notification);
    localStorage.setItem("notifications", JSON.stringify(notifications));
}

function removePersistenNotification(notificationId) {
    let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    notifications = notifications.filter(notification => notification.id !== notificationId);
    localStorage.setItem("notifications", JSON.stringify(notifications));
}