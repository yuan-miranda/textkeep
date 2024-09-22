// utils/cleanup.js
const pool = require('../config/db');
const { getDateTime } = require('./time');

/**
 * Cleans up temporary users and expired sessions from the database.
 */
exports.cleanup = async () => {
    // delete the user data from the temp_users table
    try {
        await pool.query("DELETE FROM temp_users WHERE date_created < NOW() - INTERVAL '1 day'");
        console.log(`${getDateTime()} - Temporary users cleaned up successfully`);
    } catch (err) {
        console.error(`${getDateTime()} - Error cleaning up temporary users: ${err}`);
    }

    // delete the session data from the sessions table
    try {
        await pool.query("DELETE FROM sessions WHERE expire < NOW()");
        console.log(`${getDateTime()} - Expired sessions cleaned up successfully`);
    } catch (err) {
        console.error(`${getDateTime()} - Error cleaning up expired sessions: ${err}`);
    }
};