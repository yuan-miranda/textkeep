// utils/dbUtils.js
const fs = require('fs');
const pool = require('../config/db');

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

    try {
        await pool.query(initNotes);
        console.log("Table 'notes' created successfully");
        await pool.query(initGuests);
        console.log("Table 'guests' created successfully");
        await pool.query(initUsers);
        console.log("Table 'users' created successfully");
        await pool.query(initTempUsers);
        console.log("Table 'temp_users' created successfully");
        await pool.query(initSessions);
        console.log("Table 'sessions' created successfully");
    } catch (err) {
        console.error("Error creating table: ", err);
    }
};

/**
 * Retrieves user data from the database using either the email or username.
 * @param {String} email 
 * @param {String} username 
 * @returns 
 */
exports.getUserData = async (email, username=email) => {
    // the query could either be by email or username
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
}