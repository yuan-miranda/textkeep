// utils/initDb.js
const { initTables } = require('./query');
const { getDateTime } = require('./time');

/**
 * Initializes the database by creating the necessary tables.
 */
exports.initDatabase = async () => {
    const tables = {
        notes: `CREATE TABLE IF NOT EXISTS notes (
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
        );`,
        guests: `CREATE TABLE IF NOT EXISTS guests (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            profile_image TEXT DEFAULT '../../media/profiles/defaultprofile.png',
            last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_deleted TIMESTAMP,
            storage_used INT DEFAULT 0
        )`,
        users: `CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            bio TEXT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            profile_image TEXT DEFAULT '../../media/profiles/defaultprofile.png',
            last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_date_deleted TIMESTAMP,
            storage_used INT DEFAULT 0
        );`,
        temp_users: `CREATE TABLE IF NOT EXISTS temp_users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,
        sessions: `CREATE TABLE IF NOT EXISTS sessions (
            sid TEXT PRIMARY KEY NOT NULL,
            sess JSON NOT NULL,
            expire TIMESTAMP NOT NULL
        );`,
        user_settings: `CREATE TABLE IF NOT EXISTS user_settings (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL,
            is_gae BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );`,
        guest_settings: `CREATE TABLE IF NOT EXISTS guest_settings (
            id SERIAL PRIMARY KEY,
            guest_id INT NOT NULL,
            is_gae BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
        );`
    };

    try {
        await initTables(Object.values(tables));
        console.log(`${getDateTime()} - Tables created successfully`);
    }
    catch (err) {
        console.error(`${getDateTime()} - Error creating table: ${err}`);
    }
};