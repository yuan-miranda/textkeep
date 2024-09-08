// middlewares/pageMiddleware.js
exports.requireLoggedOutAccess = (req, res, next) => {
    if (req.cookies.login_token) return res.redirect("/");
    next();
}

exports.requireLoggedInAccess = (req, res, next) => {
    if (!req.cookies.login_token) return res.redirect("/login");
    next();
}