// utils/time.js

/**
 * Gets the current date and time in the format "YYYY-MM-DD HH:MM:SS".
 * @returns {string} The current date and time in the format "YYYY-MM-DD HH:MM:SS".
 */
exports.getDateTime = () => {
    const date = new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}