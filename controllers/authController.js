// TOFIX: notification are not shared between pages. Add persistent notification section too.

// controllers/authController.js
const { mkLoginToken, mkVerificationToken, verifyToken } = require('../config/token');
const { getUserData, getTempUserData, getGuestData, getUserSettings, getGuestSettings, updateUserSettings, updateGuestSettings } = require('../utils/query');
const { getDateTime } = require('../utils/time');
const { sendEmailVerification, sendEmailForgotPassword } = require('./sessionController');
const { updateLoginTimestamp, moveToTempUser } = require('../utils/query');
const { comparePassword, hashPassword } = require('../config/hash');

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
            const { email } = verifyToken(loginToken);
            user = await getUserData(email);
        } else {
            const { guestId } = verifyToken(guestToken);
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
 * Handles both GET and POST requests for the user settings.
 * GET: Retrieves the user settings from the database and sends it to the client.
 * POST: Updates the user settings in the database.
 * @param {Object} req 
 * @param {Object} res 
 * @returns 
 */
exports.settings = async (req, res) => {
    const loginToken = req.cookies ? req.cookies.login_token : null;
    const guestToken = req.cookies ? req.cookies.guest_token : null;
    if (!loginToken && !guestToken) return res.status(401).json({ error: "No login token found" });
    
    // get the user settings from the request body (POST request)
    const { settings } = req.body;

    try {
        let userId;
        let userSettings;
        // get the user data and settings
        if (loginToken) {
            const { email } = verifyToken(loginToken);
            const { id } = await getUserData(email);
            userSettings = await getUserSettings(id);
            userId = id;
        } else {
            const { guestId } = verifyToken(guestToken);
            const { id } = await getGuestData(guestId);
            userSettings = await getGuestSettings(id);
            userId = id;
        }
        
        // return an error if the user or settings are not found
        if (!userId) return res.status(422).json({ error: "User not found" });
        if (!userSettings) return res.status(422).json({ error: "User settings not found" });
        
        //  retrieve the user settings from the database (GET request)
        if (!settings) return res.status(200).json({ message: "User settings retrieved successfully", data: { userSettings } });
        
        // update the user settings in the database (POST request)
        if (loginToken) await updateUserSettings(userId, settings);
        else await updateGuestSettings(userId, settings);
        res.status(200).json({ message: "User settings updated successfully" });
    } catch (err) {
        console.error(`${getDateTime()} - Error retrieving user data: ${err}`);
        res.status(500).json({ error: `Error retrieving user data: ${err}` });
    }
}

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
        let isPasswordValid = comparePassword(password, user.password);
         //  check if the password is the string literal hashed password
        if (!isPasswordValid) if (password === user.password) isPasswordValid = true;
        if (!isPasswordValid) return res.status(401).json({ error: "Invalid password" });

        // generate a login token cookie with a 30-day expiration
        const { email } = user;
        const loginToken = mkLoginToken(email);
        res.cookie('login_token', loginToken, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
        res.clearCookie('guest_token');
        
        // update last login timestamp
        await updateLoginTimestamp(email);
        console.log(`${getDateTime()} - User logged in successfully with email: ${email}`);

        res.status(200).json({ message: "User logged in successfully" });
    } catch (err) {
        console.error(`${getDateTime()} - Error logging in: ${err}`);
        res.status(500).json({ error: `Error logging in: ${err}` });
    }
};

exports.forgotPassword = async (req, res) => {
    const { usernameEmail } = req.body;
    if (!usernameEmail) return res.status(422).json({ error: "Username or email is required" });

    try {
        const user = await getUserData(usernameEmail);
        if (!user) return res.status(422).json({ error: "Username or email not found" });

        req.session.password = user.password;
        req.session.email = user.email;
        console.log(`${getDateTime()} - Forgot password session started for email: ${user.email}`);

        // send the email for password reset
        await sendEmailForgotPassword(req);
        
        res.status(200).json({ message: "Forgot password session started", data: { email: user.email } });
    } catch (err) {
        console.error(`${getDateTime()} - Error forgot password: ${err}`);
        res.status(500).json({ error: `Error forgot password: ${err}` });
    }
}

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
        const hashedPassword = hashPassword(password, 10);

        // insert the new user data into the temporary users table
        await moveToTempUser(username, email, hashedPassword);

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