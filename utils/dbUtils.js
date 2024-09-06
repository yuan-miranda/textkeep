// utils/dbUtils.js
const pool = require('../config/db');

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

    const initUsers = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            bio TEXT,
            profile_image TEXT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_deleted TIMESTAMP
        );`;

    const initTempUsers = `
        CREATE TABLE IF NOT EXISTS temp_users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;
    try {
        await pool.query(initNotes);
        console.log("Table 'notes' created successfully");
        await pool.query(initUsers);
        console.log("Table 'users' created successfully");
        await pool.query(initTempUsers);
        console.log("Table 'temp_users' created successfully");
    } catch (err) {
        console.error("Error creating table: ", err);
    }
}

exports.getUserData = async (email, username=email) => {
    // the query could either be by email or username
    const result = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username]);
    return result.rows[0];
}

exports.getTempUserData = async (email, username=email) => {
    // the query could either be by email or username
    const result = await pool.query("SELECT * FROM temp_users WHERE email = $1 OR username = $2", [email, username]);
    return result.rows[0];
}