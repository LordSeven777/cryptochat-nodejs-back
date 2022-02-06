const { body } = require('express-validator');

// Express validators wrapper
const wrapValidator = require('../helpers/wrapValidator.helper');

// User model
const UserModel = require('../models/users.model');

// bcrypt helper methods
const { verifyPassword } = require('../helpers/bcrypt.helper');
// Crypto helper class
const Crypto = require('../helpers/crypto.helper');


// Login user's data validator
const loginUserValidator = [
    // E-mail address / pseudo
    body('email_pseudo')
        // Required
        .notEmpty()
            .withMessage('E-mail/Pseudo is required')
        // Belongs to a user
        .custom(async (email_pseudo, { req }) => {
            // Getting the user having the specified email or pseudo
            const matchUser = await UserModel.getUserByEmailOrPseudo(email_pseudo);
            // Throwing an error if there's no match
            if (!matchUser) 
                throw new Error("User with this email/pseudo doesn't exist")
            else {
                const { password: hashedPassword, ...rest } = matchUser;
                const user = { ...rest };
                // Attaching the user data to the request for later use
                req.user = user;
                req.hashedPassword = hashedPassword;
            } 
        }),
    
    // Password
    body('password')
        // Required
        .notEmpty()
            .withMessage('You must write your password')
        // Correct
        .custom(async (password, { req }) => {
            if (!req.user) return true;
            const isCorrect = await verifyPassword(password, req.hashedPassword);
            if (!isCorrect) throw new Error('Your password is wrong. Try again.');
        })
];

module.exports = wrapValidator(loginUserValidator);