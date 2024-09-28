// utils/query.js
const pool = require('../config/db');

/**
 * Retrieves user data from the "users" table using either the email or username.
 * Returns the registered user's data, including fields like username and email.
 * @param {String} email - The user's email address.
 * @param {String} username - The user's username. Defaults to the email if not provided.
 * @returns {Object} - Registered user data from the database.
 */
exports.getUserData = async (email, username = email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username]);
    return result.rows[0];
};

/**
 * Retrieves temporary user data from the "temp_users" table using either the email or username.
 * This is used for users who are in the process of registering but have not yet verified their account.
 * @param {String} email - The user's email address.
 * @param {String} username - The user's username. Defaults to the email if not provided.
 * @returns {Object} - Temporary user data from the database.
 */
exports.getTempUserData = async (email, username = email) => {
    const result = await pool.query("SELECT * FROM temp_users WHERE email = $1 OR username = $2", [email, username]);
    return result.rows[0];
};

/**
 * Retrieves guest user data from the "guests" table using the guestId.
 * A guest is a visitor who has not logged in or registered.
 * @param {String} guestId - The unique identifier for the guest.
 * @returns {Object} - Guest data from the database.
 */
exports.getGuestData = async (guestId) => {
    const result = await pool.query("SELECT * FROM guests WHERE id = $1", [guestId]);
    return result.rows[0];
};

/**
 * Retrieves user settings from the "user_settings" table using the userId.
 * Returns the settings for a registered user.
 * @param {String} userId - The unique identifier for the registered user.
 * @returns {Object} - User settings from the database.
 */
exports.getUserSettings = async (userId) => {
    const result = await pool.query("SELECT * FROM user_settings WHERE user_id = $1", [userId]);
    return result.rows[0];
};

/**
 * Retrieves guest settings from the "guest_settings" table using the guestId.
 * Returns the settings for a guest user.
 * @param {String} guestId - The unique identifier for the guest.
 * @returns {Object} - Guest settings from the database.
 */
exports.getGuestSettings = async (guestId) => {
    const result = await pool.query("SELECT * FROM guest_settings WHERE guest_id = $1", [guestId]);
    return result.rows[0];
};

/**
 * Updates guest settings in the "guest_settings" table for a given guestId.
 * Dynamically builds a SQL query based on the keys in the settings object.
 * @param {String} guestId - The unique identifier for the guest.
 * @param {Object} settings - An object containing the updated guest settings.
 */
exports.updateGuestSettings = async (guestId, settings) => {
    const keys = Object.keys(settings);
    const rows = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const queryText = `UPDATE guest_settings SET ${rows} WHERE guest_id = $${keys.length + 1};`;
    const values = [...Object.values(settings), guestId];
    await pool.query(queryText, values);
};

/**
 * Updates user settings in the "user_settings" table for a registered user.
 * Dynamically builds a SQL query based on the keys in the settings object.
 * @param {String} userId - The unique identifier for the registered user.
 * @param {Object} settings - An object containing the updated user settings.
 */
exports.updateUserSettings = async (userId, settings) => {
    const keys = Object.keys(settings);
    const rows = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const queryText = `UPDATE user_settings SET ${rows} WHERE user_id = $${keys.length + 1};`;
    const values = [...Object.values(settings), userId];
    await pool.query(queryText, values);
};

/**
 * Updates the last login timestamp for a registered user in the "users" table using their email.
 * Sets the "last_login" field to the current timestamp.
 * @param {String} email - The registered user's email address.
 */
exports.updateLoginTimestamp = async (email) => {
    await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = $1", [email]);
};

/**
 * Moves a user to the "temp_users" table by inserting their registration data.
 * This occurs when a user is in the process of registering and awaiting verification.
 * The user remains in the temp_users table until their email is verified.
 * @param {String} username - The user's username.
 * @param {String} email - The user's email address.
 * @param {String} hashedPassword - The hashed version of the user's password.
 * @returns {Object} - The inserted temporary user's email.
 */
exports.moveToTempUser = async (username, email, hashedPassword) => {
    const result = await pool.query(`INSERT INTO temp_users (username, email, password) VALUES ($1, $2, $3) RETURNING email;`, [username, email, hashedPassword]);
    return result.rows[0];
};

/**
 * Deletes a guest from the "guests" table using the guestId.
 * @param {String} guestId - The unique identifier for the guest.
 */
exports.deleteGuest = async (guestId) => {
    await pool.query("DELETE FROM guests WHERE id = $1", [guestId]);
};

/**
 * Moves a user from the "temp_users" table to the "users" table upon successful registration and verification.
 * This finalizes the registration process, making the user a registered user.
 * @param {String} username - The user's username.
 * @param {String} email - The user's email address.
 * @param {String} password - The user's hashed password.
 * @param {String} account_date_created - The date the account was created.
 * @param {Number} storage_used - The amount of storage used by the user.
 * @returns {Object} - The newly created registered user's ID.
 */
exports.moveToUser = async (username, email, password, account_date_created, storage_used) => {
    const result = await pool.query(`INSERT INTO users (username, bio, email, password, account_date_created, storage_used) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`, [username, "", email, password, account_date_created, storage_used]);
    return result.rows[0];
};

/**
 * Creates new settings for a registered user by inserting a record into the "user_settings" table.
 * This is used when a new registered user is created, to set up their default or initial settings.
 * @param {String} userId - The unique identifier for the registered user.
 */
exports.moveUserSettings = async (userId) => {
    await pool.query("INSERT INTO user_settings (user_id) VALUES ($1)", [userId]);
};

/**
 * Creates new settings for a guest by inserting a record into the "guest_settings" table.
 * This is used when a guest first visits the site, to set up their default or initial settings.
 * @param {String} guestId - The unique identifier for the guest.
 */
exports.moveGuestSettings = async (guestId) => {
    await pool.query("INSERT INTO guest_settings (guest_id) VALUES ($1)", [guestId]);
};

/**
 * Updates a registered user's password in the "users" table using their email.
 * @param {String} email - The registered user's email address.
 * @param {String} newPassword - The new hashed password to be set.
 */
exports.updatePassword = async (email, newPassword) => {
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [newPassword, email]);
};

/**
 * Deletes a temporary user from the "temp_users" table if they do not verify their email within a certain time frame.
 * @param {String} email - The temporary user's email address.
 */
exports.deleteTempUser = async (email) => {
    await pool.query("DELETE FROM temp_users WHERE email = $1", [email]);
};

/**
 * Moves a user to the "guests" table by inserting a guest record.
 * Used when a user visits the site but is not logged in or registered.
 * @param {String} username - The guest user's username.
 * @returns {Object} - The newly created guest's ID.
 */
exports.moveToGuest = async (username) => {
    const result = await pool.query("INSERT INTO guests (username) VALUES ($1) RETURNING id", [username]);
    return result.rows[0];
};

/**
 * Deletes expired temporary users from the "temp_users" table.
 * Removes users who have not verified their accounts within 1 day of creation.
 */
exports.deleteExpiredTempUsers = async () => {
    await pool.query("DELETE FROM temp_users WHERE date_created < NOW() - INTERVAL '1 day'");
};

/**
 * Deletes expired sessions from the "sessions" table.
 * Removes sessions that have expired based on the session expiration timestamp.
 */
exports.deleteExpiredSessions = async () => {
    await pool.query("DELETE FROM sessions WHERE expire < NOW()");
};

/**
 * Initializes database tables.
 * Executes a series of table creation queries.
 * @param {Array} tables - An array of SQL table creation queries.
 */
exports.initTables = (tables) => {
    tables.forEach(async (table) => await pool.query(table));
};
