// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { getUserData, getTempUserData } = require('../utils/dbUtils');
const { sendEmailVerification } = require('./sessionController');

exports.autoLogin = async (req, res) => {
    const loginToken = req.cookies ? req.cookies.login_token : null;
    if (!loginToken) return res.status(401).json({ error: "No login token found" });

    try {
        const { email } = jwt.verify(loginToken, process.env.JWT_SECRET);
        const user = await getUserData(email);
        
        if (!user) return res.status(422).json({ error: "User not found" });
        res.status(200).json({ message: "User auto-logged in successfully", data: user });
    } catch (err) {
        console.error("Error auto-logging in: ", err);
        res.status(500).json({ error: `Error auto-logging in: ${err}` });
    }
}

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
        const loginToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "30d" });
        res.cookie('login_token', loginToken, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days

        // update last login timestamp
        await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = $1", [email]);
        console.log(`User logged in successfully with email: ${email}`);

        res.status(200).json({ message: "User logged in successfully" });
    } catch (err) {
        console.error("Error logging in: ", err);
        res.status(500).json({ error: `Error logging in: ${err}` });
    }
};

exports.register = async (req, res) => {
    if (req.cookies.login_token) return res.status(401).json({ error: "User already logged in" });
    const { username, email, password } = req.body;
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
        console.log(`User registered successfully with email: ${result.rows[0].email}`);

        // generate a email verification token with a 1-day expiration
        req.session.emailVerificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });
        req.session.email = email;
        console.log(`Registration session started for email: ${email}`);

        // send the verification email
        await sendEmailVerification(req);

        res.status(200).json({ message: "Registration session started" });
    } catch (err) {
        console.error("Error registering user: ", err);
        res.status(500).json({ error: `Error registering user: ${err}` });
    }
};

exports.logout = (req, res) => {
    if (!req.cookies.login_token) {
        console.log("User not logged in");
        return res.status(401).json({ error: "User not logged in" });
    }
    // clear the login token cookie
    try {
        res.clearCookie('login_token');
        res.status(200).json({ message: "User logged out successfully" });
    } catch (err) {
        console.error("Error logging out: ", err);
        res.status(500).json({ error: `Error logging out: ${err}` });
    }
}