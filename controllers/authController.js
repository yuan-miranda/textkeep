// TOFIX: notification are not shared between pages. Add persistent notification section too.

// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { mkLoginToken, mkVerificationToken } = require('../config/token');
const { getUserData, getTempUserData, getGuestData } = require('../utils/dbUtils');
const { getDateTime } = require('../utils/time');
const { sendEmailVerification } = require('./sessionController');

/**
 * Retrieves user data from the database and sends it to the client.
 * This either fetches the registered user or the guest user data.
 * @param {Object} req 
 * @param {Object} res 
 * @returns 
 */
exports.account = async (req, res) => {
    const loginToken = req.cookies ? req.cookies.login_token : null;
    const guestToken = req.cookies ? req.cookies.guest_token : null;
    if (!loginToken && !guestToken) return res.status(401).json({ error: "No login token found" });
    try {
        // get the user data
        let user;
        if (loginToken) {
            const { email } = jwt.verify(loginToken, process.env.JWT_SECRET);
            user = await getUserData(email);
        } else {
            const { guestId } = jwt.verify(guestToken, process.env.JWT_SECRET);
            user = await getGuestData(guestId);
        }
        if (!user) return res.status(422).json({ error: "User not found" });
        res.status(200).json({ message: "User data retrieved successfully", data: { user } });
    } catch (err) {
        console.error(`${getDateTime()} - Error retrieving user data: ${err}`);
        res.status(500).json({ error: `Error retrieving user data: ${err}` });
    }
};

/**
 * Not really sure if this is a proper way to implement a login function. This just sets a backend cookie with the user's email,
 * so that it will persist. But hey it works.
 * @param {Object} req 
 * @param {Object} res 
 * @returns 
 */
exports.login = async (req, res) => {
    if (req.cookies.login_token) return res.status(401).json({ error: "User already logged in" });
    
    const { usernameEmail, password } = req.body;
    try {
        const user = await getUserData(usernameEmail);

        // check if the username or email exists and the password is correct
        if (!user) return res.status(422).json({ error: "Username or email not found" });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: "Invalid password" });

        // generate a login token cookie with a 30-day expiration
        const { email } = user;
        const loginToken = mkLoginToken(email);
        res.cookie('login_token', loginToken, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
        res.clearCookie('guest_token');
        
        // update last login timestamp
        await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = $1", [email]);
        console.log(`${getDateTime()} - User logged in successfully with email: ${email}`);

        res.status(200).json({ message: "User logged in successfully" });
    } catch (err) {
        console.error(`${getDateTime()} - Error logging in: ${err}`);
        res.status(500).json({ error: `Error logging in: ${err}` });
    }
};

/**
 * More like pre-registering a user. This function inserts the user data into the temp_users table, and sends an email verification
 * to the specified email address. The user must click the link in the email to verify their email and move their data to the users table.
 * @param {Object} req 
 * @param {Object} res 
 * @returns 
 */
exports.register = async (req, res) => {
    if (req.cookies.login_token) return res.status(401).json({ error: "User already logged in" });
    const { username, email, password, isImportGuestData } = req.body;
    try {
        // check if the username or email already exists
        const user = await getUserData(email);
        const tempUser = await getTempUserData(email);

        if (user) {
            if (user.email === email) return res.status(422).json({ error: "Email already exists" });
            if (user.username === username) return res.status(422).json({ error: "Username already exists" });
        }
        if (tempUser) {
            if (tempUser.email === email) return res.status(422).json({ error: "Email already registered" });
            if (tempUser.username === username) return res.status(422).json({ error: "Username already registered" });
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // insert the new user data into the temporary users table
        const queryText = `INSERT INTO temp_users (username, email, password) VALUES ($1, $2, $3) RETURNING email;`;
        const values = [username, email, hashedPassword];
        const result = await pool.query(queryText, values);
        console.log(`${getDateTime()} - User registered successfully with email: ${result.rows[0].email}`);

        // generate a email verification token with a 1-day expiration
        req.session.emailVerificationToken = mkVerificationToken(email);
        req.session.email = email;
        req.session.isImportGuestData = isImportGuestData;
        console.log(`${getDateTime()} - Registration session started for email: ${email}`);

        // send the email verification
        await sendEmailVerification(req);

        res.status(200).json({ message: "Registration session started", data: { email } });
    } catch (err) {
        console.error(`${getDateTime()} - Error registering user: ${err}`);
        res.status(500).json({ error: `Error registering user: ${err}` });
    }
};

/**
 * Logs out the user by clearing the login token cookie.
 * @param {Object} req 
 * @param {Object} res 
 * @returns 
 */
exports.logout = (req, res) => {
    if (!req.cookies.login_token) {
        console.log(`${getDateTime()} - User not logged in`);
        return res.status(401).json({ error: "User not logged in" });
    }
    // clear the login token cookie
    try {
        res.clearCookie('login_token');
        res.status(200).json({ message: "User logged out successfully" });
    } catch (err) {
        console.error(`${getDateTime()} - Error logging out: ${err}`);
        res.status(500).json({ error: `Error logging out: ${err}` });
    }
};