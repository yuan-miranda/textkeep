// config/hash.js
const bcrypt = require('bcrypt');

exports.hashPassword = (password, saltRounds) => {
    return bcrypt.hashSync(password, saltRounds);
}

exports.comparePassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
}