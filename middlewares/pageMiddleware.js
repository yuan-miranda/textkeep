// middlewares/pageMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { getGuestData } = require('../utils/dbUtils');

/**
 * Simple middleware that redirects the user to the home page if they are already logged in.
 * Used to prevent users from accessing X routes using this middleware.
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 * @returns 
 */
exports.requireLoggedOutAccess = (req, res, next) => {
    if (req.cookies.login_token) return res.redirect("/logout");
    next();
};

/**
 * Simple middleware that redirects the user to the login page if they are not logged in.
 * Used to prevent users from accessing X routes using this middleware.
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 * @returns 
 */
exports.requireLoggedInAccess = (req, res, next) => {
    if (!req.cookies.login_token) return res.redirect("/login");
    next();
};

/**
 * Middleware that is initialized when the user accesses the website. It creates a guest
 * session if the user does not have a login token or a guest token, otherwise it resumes.
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
exports.guestAccess = async (req, res, next) => {
    // if the user does not have a guest token or a login token, create a guest session
    if (!req.cookies.guest_token && !req.cookies.login_token) {
        const username = `guest${Date.now()}`;
        const result = await pool.query("INSERT INTO guests (username) VALUES ($1) RETURNING id", [username]);

        const guestId = result.rows[0].id;
        req.session.guestId = guestId;

        // create a guest token with a 30-day expiration
        const guestToken = jwt.sign({ guestId }, process.env.JWT_SECRET, { expiresIn: "30d" });
        res.cookie('guest_token', guestToken, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
        console.log(`Guest session started with id: ${guestId}`);
    }

    // load the guest session if the user has a guest token
    if (req.cookies.guest_token && !req.cookies.login_token) {
        const { guestId } = jwt.verify(req.cookies.guest_token, process.env.JWT_SECRET);
        const guessData = await getGuestData(guestId);
        if (guessData) {
            req.session.guestId = guestId;
            console.log(`Guest session resumed with id: ${guestId}`);
        }
    }
    next();
};