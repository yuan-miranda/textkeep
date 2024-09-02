// utils/cleanup.js
const pool = require('../config/db');

exports.cleanup = async () => {
    // delete the user data from the temporary users table
    try {
        await pool.query("DELETE FROM temp_users WHERE date_created < NOW() - INTERVAL '1 day'");
        console.log("Temporary users cleaned up successfully");
    } catch (err) {
        console.error("Error cleaning up temporary users: ", err);
    }

    // delete the session data from the session store
    try {
        await pool.query("DELETE FROM session WHERE expires < NOW()");
        console.log("Sessions cleaned up successfully");
    } catch (err) {
        console.error("Error cleaning up sessions: ", err);
    }
};