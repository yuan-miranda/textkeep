// controllers/sessionController.js
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const transporter = require("../config/email");

exports.sendEmailVerification = async (req, res) => {
    const { emailVerificationToken, email } = req.session;
    if (!emailVerificationToken) return res.redirect("/login");

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
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
        res.status(200).send("Verification email sent successfully");
    } catch (err) {
        console.error("Error sending verification email: ", err);
        res.status(500).send({ error: `Error sending verification email: ${err}` });
    }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) return res.redirect("/login");

    try {
        const { email } = jwt.verify(token, process.env.JWT_SECRET);
        
        // get the user data from the temporary users table
        const user = await pool.query("SELECT * FROM temp_users WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(422).send({ error: "User not found" });

        // insert the user data into the users table
        const { username, password } = user.rows[0];
        const queryText = `INSERT INTO users (username, bio, email, password) VALUES ($1, $2, $3, $4) RETURNING id;`;
        const values = [username, "", email, password];
        await pool.query(queryText, values);
        console.log(`User registered successfully with email: ${email}`);

        // delete the user data from the temporary users table
        await pool.query("DELETE FROM temp_users WHERE email = $1", [email]);

        // delete the email verification token
        delete req.session.emailVerificationToken;
        delete req.session.email;

        res.status(200).send("User registered successfully");
    } catch (err) {
        console.error("Error verifying email: ", err);
        res.status(500).send({ error: `Error verifying email: ${err}` });
    }
};

exports.deleteEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) return res.redirect("/login");

    try {
        const { email } = jwt.verify(token, process.env.JWT_SECRET);

        // delete the user data from the temporary users table
        const result = await pool.query("DELETE FROM temp_users WHERE email = $1", [email]);
        if (result.rowCount === 0) return res.status(422).send({ error: "User not found" });
        console.log(`User deleted successfully with email: ${email}`);

        // delete the email verification token
        delete req.session.emailVerificationToken;
        delete req.session.email;

        res.status(200).send("User deleted successfully");
    } catch (err) {
        console.error("Error deleting email: ", err);
        res.status(500).send({ error: `Error deleting email: ${err}` });
    }
};