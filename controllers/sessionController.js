// NOTE: Should I move the helper function to a separate file?

// controllers/sessionController.js
const jwt = require("jsonwebtoken");
const { mkLoginToken } = require("../config/token");
const transporter = require("../config/email");
const { getTempUserData, getGuestData, getGuestSettings, updateUserSettings } = require("../utils/query");
const { getDateTime } = require("../utils/time");
const { deleteGuest, moveToUser, moveUserSettings, deleteTempUser } = require("../utils/query");

/**
 * Helper function that imports the guest data into the users table.
 * @param {String} username 
 * @param {String} email 
 * @param {String} password 
 * @param {Object} guessData 
 */
async function importGuestData(res, username, email, password, guestId) {
    const guessData = await getGuestData(guestId);
    const guestSettings = await getGuestSettings(guestId);
    const { account_date_created, storage_used } = guessData;

    // insert the guest data into the users table
    const result = await insertUserData(username, email, password, account_date_created, storage_used);
    const userId = result.id;

    // remove guest_id from the guest settings object cause the settings table will now point to the user_id
    delete guestSettings.guest_id;

    // update the user settings with the guest settings
    await updateUserSettings(userId, guestSettings);

    // delete the guest data from the guests table and clear the guest token cookie
    await deleteGuest(guestId);
    res.clearCookie("guest_token");
}

/**
 * Helper function that inserts the user data into the users table.
 * @param {String} username 
 * @param {String} email 
 * @param {String} password 
 */
async function insertUserData(username, email, password, account_date_created=undefined, storage_used=undefined) {
    const result = await moveToUser(username, email, password, account_date_created, storage_used);
    await moveUserSettings(result.id);
    return { id: result.id };
}

/**
 * Helper function that generates a login token cookie with a 30-day expiration. A direct login is performed.
 * @param {Object} res 
 * @param {String} email 
 */
function onVerifyLogin(res, email) {
    const loginToken = mkLoginToken(email);
    res.cookie('login_token', loginToken, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
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
        console.log(`${getDateTime()} - Verification email sent to: ${email}`);
    } catch (err) {
        console.error(`${getDateTime()} - Error sending verification email: ${err}`);
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
        console.error(`${getDateTime()} - ${err}`);
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
        const { email } = jwt.verify(token, process.env.JWT_SECRET);
        
        // get the user data from the temp_users table
        const user = await getTempUserData(email);
        if (!user) return res.status(422).send("User not found");
        const { username, password } = user;

        if (req.session.isImportGuestData) {
            // import the guest data into the users table
            await importGuestData(res, username, email, password, req.session.guestId);
            console.log(`${getDateTime()} - Guest user registered successfully with email: ${email}`);
        } else {
            // insert the user data into the users table
            await insertUserData(username, email, password);
            console.log(`${getDateTime()} - User registered successfully with email: ${email}`);
        }

        // generate a login token cookie with a 30-day expiration
        onVerifyLogin(res, email);
        
        // delete the user data from the temp_users table
        await deleteTempUser(email);
        delete req.session.emailVerificationToken;
        delete req.session.email;

        console.log(`${getDateTime()} - Email verification completed for: ${email}`);
        res.status(200).send("User registered successfully");
    } catch (err) {
        console.error(`${getDateTime()} - Error verifying email: ${err}`);
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
        await deleteTempUser(email);
        console.log(`${getDateTime()} - User deleted successfully with email: ${email}`);

        // delete the email verification token
        delete req.session.emailVerificationToken;
        delete req.session.email;

        res.status(200).send("User deleted successfully");
    } catch (err) {
        console.error(`${getDateTime()} - Error deleting email: ${err}`);
        res.status(500).send(`Error deleting email: ${err}`);
    }
};