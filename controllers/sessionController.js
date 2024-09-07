// controllers/sessionController.js
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const transporter = require("../config/email");
const { getTempUserData } = require("../utils/dbUtils");

exports.sendEmailVerification = async (req) => {
    const { emailVerificationToken, email } = req.session;
    if (!emailVerificationToken) throw new Error("No verification token found");

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_ADDRESS,
            to: email,
            subject: "Verify Email Address",
            html: `
                <p>Hello,</p>
                <p>Someone used this email address to register an account on our site. If this was you, click the link below to verify your email address:</p>
                <a href="http://textkeep.ddns.net/session/email/verify?token=${emailVerificationToken}">Verify Email</a>
                <p>If you didn't register an account, click the link below to delete the account:</p>
                <a href="http://textkeep.ddns.net/session/email/delete?token=${emailVerificationToken}">Delete Account</a>
            `
        });
        console.log(`Verification email sent to: ${email}`);
    } catch (err) {
        console.error("Error sending verification email: ", err);
        throw new Error(`Error sending verification email: ${err}`);
    }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) return res.redirect("/login");

    try {
        console.log("Verifying email...");
        const { email } = jwt.verify(token, process.env.JWT_SECRET);
        
        // get the user data from the temporary users table
        const user = await getTempUserData(email);
        if (!user) return res.status(422).json({ error: "User not found" });

        // insert the user data into the users table
        const { username, password } = user;
        const queryText = `INSERT INTO users (username, bio, email, password) VALUES ($1, $2, $3, $4) RETURNING id;`;
        const values = [username, "", email, password];
        await pool.query(queryText, values);
        console.log(`User registered successfully with email: ${email}`);

        // delete the user data from the temporary users table
        await pool.query("DELETE FROM temp_users WHERE email = $1", [email]);

        // delete the email verification token
        delete req.session.emailVerificationToken;
        delete req.session.email;

        console.log(`Email verification completed for: ${email}`);
        res.status(200).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Error verifying email: ", err);
        res.status(500).json({ error: `Error verifying email: ${err}` });
    }
};

exports.deleteEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) return res.redirect("/login");

    try {
        const { email } = jwt.verify(token, process.env.JWT_SECRET);

        // delete the user data from the temporary users table
        const result = await getTempUserData(email);
        if (!result) return res.status(422).json({ error: "User not found" });
        console.log(`User deleted successfully with email: ${email}`);

        // delete the email verification token
        delete req.session.emailVerificationToken;
        delete req.session.email;

        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("Error deleting email: ", err);
        res.status(500).json({ error: `Error deleting email: ${err}` });
    }
};