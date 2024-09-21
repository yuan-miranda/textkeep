// middlewares/pageMiddleware.js

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
}

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
}