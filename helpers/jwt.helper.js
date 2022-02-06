const jwt = require('jsonwebtoken');

// Enabling the access to environment variables
require('dotenv').config();

// Generates an access token
module.exports.generateAccessToken = payload => jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);

// Verifies an access token
module.exports.verifyAccessToken = token => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, data) => {
            if (error) reject(error);
            else resolve(data);
        });
    });
}
