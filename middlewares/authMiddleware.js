// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * A middleware that softlocks routes (except from those in ignoreRoutes array) if the user registers an account but hasn't 
 * verified their email yet. This encourages users to verify their email, and prevents them from registering random accounts.
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 * @returns 
 */
exports.persistentEmailVerificationReroute = (req, res, next) => {
    const ignoreRoutes = ["/", "/logout", "/session/email/verify", "/session/email/delete", "/session/email/resend"];
    if (ignoreRoutes.includes(req.path)) return next();
    if (req.session && req.session.emailVerificationToken && req.originalUrl !== "/account/email/verify") return res.redirect("/account/email/verify");
    if (req.path === "/account/email/verify" && !req.session.emailVerificationToken) return res.redirect("/");
    next();
};