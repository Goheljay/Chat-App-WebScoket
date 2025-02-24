const jwt = require("jsonwebtoken");

function generateJwtToken(userId) {
    return jwt.sign({ userId: userId }, "secret", {
        expiresIn: 1800,
    });
}

module.exports = {
    generateJwtToken
}