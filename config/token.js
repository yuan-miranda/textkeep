// config/token.js
const jwt = require('jsonwebtoken');

const mkLoginToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

const mkGuestToken = (guestId) => {
    return jwt.sign({ guestId }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

const mkVerificationToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });
}


module.exports = { mkLoginToken, mkGuestToken, mkVerificationToken };