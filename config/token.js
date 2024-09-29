// config/token.js
const jwt = require('jsonwebtoken');

exports.mkLoginToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

exports.mkGuestToken = (guestId) => {
    return jwt.sign({ guestId }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

exports.mkVerificationToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

exports.verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}