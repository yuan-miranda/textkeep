// utils/initDb.js
const fs = require('fs');
const pool = require('../config/db');
const { getDateTime } = require('./time');

/**
 * Initializes the database by creating the necessary tables.
 */
exports.initializeDatabase = async () => {
    const initNotes = `
        CREATE TABLE IF NOT EXISTS notes (
            id SERIAL PRIMARY KEY,
            author TEXT NOT NULL,
            title TEXT,
            text TEXT,
            description TEXT,
            tags TEXT[],
            visibility_mode TEXT,
            duration_mode TEXT,
            specific_users_tags TEXT[],
            view_value INT,
            date_value DATE,
            time_value TIME,
            date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            date_deleted TIMESTAMP
        );`;

    const initGuests = `
        CREATE TABLE IF NOT EXISTS guests (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            profile_image TEXT DEFAULT '../media/profiles/defaultprofile.png',
            last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_deleted TIMESTAMP,
            storage_used INT DEFAULT 0
        )`;

    const initUsers = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            bio TEXT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            profile_image TEXT DEFAULT '../media/profiles/defaultprofile.png',
            last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_deleted TIMESTAMP,
            storage_used INT DEFAULT 0
        );`;

    const initTempUsers = `
        CREATE TABLE IF NOT EXISTS temp_users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;

    const initSessions = `
        CREATE TABLE IF NOT EXISTS sessions (
            sid TEXT PRIMARY KEY NOT NULL,
            sess JSON NOT NULL,
            expire TIMESTAMP NOT NULL
        );`;

    const initUserSettings = `
        CREATE TABLE IF NOT EXISTS user_settings (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL,

            -- Settings start here
            is_gae BOOLEAN DEFAULT FALSE,

            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );`;

    const initGuestSettings = `
        CREATE TABLE IF NOT EXISTS guest_settings (
            id SERIAL PRIMARY KEY,
            guest_id INT NOT NULL,

            -- Settings start here
            is_gae BOOLEAN DEFAULT FALSE,

            FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
        );`;

    try {
        await pool.query(initNotes);
        console.log(`${getDateTime()} - Table 'notes' created successfully`);
        await pool.query(initGuests);
        console.log(`${getDateTime()} - Table 'guests' created successfully`);
        await pool.query(initUsers);
        console.log(`${getDateTime()} - Table 'users' created successfully`);
        await pool.query(initTempUsers);
        console.log(`${getDateTime()} - Table 'temp_users' created successfully`);
        await pool.query(initSessions);
        console.log(`${getDateTime()} - Table 'sessions' created successfully`);
        await pool.query(initUserSettings);
        console.log(`${getDateTime()} - Table 'user_settings' created successfully`);
        await pool.query(initGuestSettings);
        console.log(`${getDateTime()} - Table 'guest_settings' created successfully`);
    } catch (err) {
        console.error(`${getDateTime()} - Error creating table: ${err}`);
    }
};

/**
 * Retrieves user data from the database using either the email or username.
 * @param {String} email 
 * @param {String} username 
 * @returns 
 */
exports.getUserData = async (email, username=email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username]);
    return result.rows[0];
};

/**
 * Retrieves temporary user data from the database using either the email or username.
 * @param {String} email 
 * @param {String} username 
 * @returns 
 */
exports.getTempUserData = async (email, username=email) => {
    const result = await pool.query("SELECT * FROM temp_users WHERE email = $1 OR username = $2", [email, username]);
    return result.rows[0];
};

/**
 * Retrieves guest data from the database using the guestId.
 * @param {String} guestId 
 * @returns 
 */
exports.getGuestData = async (guestId) => {
    const result = await pool.query("SELECT * FROM guests WHERE id = $1", [guestId]);
    return result.rows[0];
};

/**
 * Retrieves user settings from the database using the userId.
 * @param {String} userId 
 * @returns 
 */
exports.getUserSettings = async (userId) => {
    const result = await pool.query("SELECT * FROM user_settings WHERE user_id = $1", [userId]);
    return result.rows[0];
};

/**
 * Retrieves guest settings from the database using the guestId.
 * @param {String} guestId 
 * @returns 
 */
exports.getGuestSettings = async (guestId) => {
    const result = await pool.query("SELECT * FROM guest_settings WHERE guest_id = $1", [guestId]);
    return result.rows[0];
};

/**
 * Updates the guest settings in the database.
 * @param {String} guestId 
 * @param {Object} settings 
 */
exports.updateGuestSettings = async (guestId, settings) => {
    const keys = Object.keys(settings);
    const rows = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const queryText = `UPDATE guest_settings SET ${rows} WHERE guest_id = $${keys.length + 1};`;
    const values = [...Object.values(settings), guestId];
    await pool.query(queryText, values);
};

/**
 * Updates the user settings in the database.
 * @param {String} userId 
 * @param {Object} settings 
 */
exports.updateUserSettings = async (userId, settings) => {
    const keys = Object.keys(settings);
    const rows = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const queryText = `UPDATE user_settings SET ${rows} WHERE user_id = $${keys.length + 1};`;
    const values = [...Object.values(settings), userId];
    await pool.query(queryText, values);
};