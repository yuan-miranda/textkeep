// middlewares/sessionMiddleware.js
const session = require("express-session");
const pool = require("../config/db");
const pgSession = require("connect-pg-simple")(session);

module.exports = session({
    store: new pgSession({
        pool: pool,
        tableName: "sessions"
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
});