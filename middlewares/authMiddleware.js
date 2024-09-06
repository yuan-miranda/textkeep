// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    // check if the client has a valid token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // if there is no token, return an error message.
    if (!token) return res.status(401).send({ error: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send({ error: 'Invalid token' });
        // return the user id and email. This can be used to fetch the user data from the database
        req.user = user;
        next();
    });
};

exports.persistentEmailVerificationReroute = (req, res, next) => {
    const ignoreRoutes = ["/", "/session/email/verify", "/session/email/delete"];
    if (ignoreRoutes.includes(req.path)) return next();
    if (req.session && req.session.emailVerificationToken && req.originalUrl !== "/account/email/verify") return res.redirect("/account/email/verify");
    if (req.path === "/account/email/verify" && !req.session.emailVerificationToken) return res.redirect("/");
    next();
};