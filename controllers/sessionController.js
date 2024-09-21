// controllers/sessionController.js
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const transporter = require("../config/email");
const { getTempUserData, getGuestData } = require("../utils/dbUtils");

/**
 * Helper function that imports the guest data into the users table.
 * @param {String} username 
 * @param {String} email 
 * @param {String} password 
 * @param {Object} guessData 
 */
async function importGuestData(username, email, password, guessData) {
    const { account_date_created, storage_used } = guessData;
    const queryText = `INSERT INTO users (username, bio, email, password, account_date_created, storage_used) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`;
    const values = [username, "", email, password, account_date_created, storage_used];
    await pool.query(queryText, values);
}

/**
 * Helper function that inserts the user data into the users table.
 * @param {String} username 
 * @param {String} email 
 * @param {String} password 
 */
async function insertUserData(username, email, password) {
    const queryText = `INSERT INTO users (username, bio, email, password) VALUES ($1, $2, $3, $4) RETURNING id;`;
    const values = [username, "", email, password];
    await pool.query(queryText, values);
}

/**
 * Sends an email verification to the user.
 * @param {Object} req
 */
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

/**
 * Resends the email verification email to the user.
 * @param {Object} req 
 * @param {Object} res 
 */
exports.resendEmailVerification = async (req, res) => {
    try {
        await exports.sendEmailVerification(req);
        res.status(200).json({ message: "Verification email resent successfully" });
    } catch (err) {
        console.error(err);
        if (err.message === "No verification token found") res.status(401).json({ error: err.message });
        else res.status(500).json({ error: err.message });
    }
};

/**
 * When the user clicks the "Verify Email" from the email sent to them, this function is called. It verifies the
 * email and moves the user from the temp_users table to the users table.
 * @param {Object} req 
 * @param {Object} res 
 * @returns
 */
exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) return res.redirect("/login");

    try {
        console.log("Verifying email...");
        const { email } = jwt.verify(token, process.env.JWT_SECRET);
        
        // get the user data from the temp_users table
        const user = await getTempUserData(email);
        if (!user) return res.status(422).send("User not found");
        
        const { username, password } = user;
        const isImportGuestData = req.session.isImportGuestData;

        if (isImportGuestData) {
            // import the guest data into the users table
            const guestId = req.session.guestId;
            const guestData = await getGuestData(guestId);
            await importGuestData(username, email, password, guestData);
            await pool.query("DELETE FROM guests WHERE id = $1", [guestId]);
            res.clearCookie("guest_token");
            console.log(`Guest data imported successfully for email: ${email}`);
        } else {
            // insert the user data into the users table
            await insertUserData(username, email, password);
        }

        // generate login_token
        const loginToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "30d" });
        res.cookie('login_token', loginToken, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
        
        console.log(`User registered successfully with email: ${email}`);

        // delete the user data from the temp_users table andd the token
        await pool.query("DELETE FROM temp_users WHERE email = $1", [email]);
        delete req.session.emailVerificationToken;
        delete req.session.email;

        console.log(`Email verification completed for: ${email}`);
        res.status(200).send("User registered successfully");
    } catch (err) {
        console.error("Error verifying email: ", err);
        res.status(500).send(`Error verifying email: ${err}`);
    }
};

/**
 * This is called when the user clicks the "Delete Account" link from the email. It deletes the user from the temp_users table.
 * @param {Object} req 
 * @param {Object} res 
 * @returns 
 */
exports.deleteEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) return res.redirect("/login");

    try {
        const { email } = jwt.verify(token, process.env.JWT_SECRET);

        // delete the user data from the temp_users table
        const result = await getTempUserData(email);
        if (!result) return res.status(422).send("User not found");
        await pool.query("DELETE FROM temp_users WHERE email = $1", [email]);
        console.log(`User deleted successfully with email: ${email}`);

        // delete the email verification token
        delete req.session.emailVerificationToken;
        delete req.session.email;

        res.status(200).send("User deleted successfully");
    } catch (err) {
        console.error("Error deleting email: ", err);
        res.status(500).send(`Error deleting email: ${err}`);
    }
};