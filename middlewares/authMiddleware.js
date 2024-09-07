// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.persistentEmailVerificationReroute = (req, res, next) => {
    const ignoreRoutes = ["/", "/logout", "/session/email/verify", "/session/email/delete"];
    if (ignoreRoutes.includes(req.path)) return next();
    if (req.session && req.session.emailVerificationToken && req.originalUrl !== "/account/email/verify") return res.redirect("/account/email/verify");
    if (req.path === "/account/email/verify" && !req.session.emailVerificationToken) return res.redirect("/");
    next();
};