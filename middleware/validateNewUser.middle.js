const { body } = require('express-validator');

// Express validators wrapper
const wrapValidator = require('../helpers/wrapValidator.helper');

// User model
const UserModel = require('../models/users.model');

// User schema validators on sign up
const userSchemaValidator = [
    // First name
    body('firstName')
        // Required
        .notEmpty()
            .withMessage('Your first name is required')
        // String
        .isString()
            .withMessage('Your first name must be a string')
        // Does not contain any number
        .not().matches(/\d/)
            .withMessage('Should not contain any number')
        // Characters length: min: 2, max: 20
        .isLength({ min: 2, max: 20 })
            .withMessage('2 to 20 characters length')
        // Trimmed
        .trim(),
    
    // Last name
    body('lastName')
        // Required
        .notEmpty()
            .withMessage('Your last name is required')
        // String
        .isString()
            .withMessage('Your last name must be a string')
        // Does not contain any number
        .not().matches(/\d/)
            .withMessage('Should not contain any number')
        // Characters length: min: 2, max: 20
        .isLength({ min: 2, max: 20 })
            .withMessage('2 to 20 characters length')
        // Trimmed
        .trim(),
    
    // Gender
    body('gender', 'Gender must be either "M" or "F"')
        // Required
        .notEmpty()
        // String
        .isString(),

    // Pseudo
    body('pseudo')
        // Required
        .notEmpty()
            .withMessage('You must provide a pseudo')
        // Alphanumeric
        .isAlphanumeric()
            .withMessage('Your pseudo should contain numbers')
        // 9 - 15 characters length
        .isLength({ min: 7, max: 15 })
            .withMessage('7 to 15 characters length')
        // Unique
        .custom(async (pseudo) => {
            try {
                const isUsedPseudo = await UserModel.checkIfExists('pseudo', pseudo);
                if (isUsedPseudo) throw new Error('This pseudo is already used');
            } 
            catch (error) {
                throw error;
            }
        }),
    
    // E-mail address
    body('email', 'Enter a valid email address')
        // Required
        .notEmpty()
        // Valid e-mail format
        .isEmail()
        // Unique
        .custom(async (email) => {
            try {
                const isUsedEmail = await UserModel.checkIfExists('email', email);
                if (isUsedEmail) throw new Error('This email is already used');
            } 
            catch (error) {
                throw error;
            }
        }),

    // Password
    body('password')
        // Required
        .notEmpty()
            .withMessage('You must provide a password')
        // 7 - 20 characters length
        .isLength({ min: 7, max: 20 })
            .withMessage('Should be 7 to 20 characters length')
];

module.exports = wrapValidator(userSchemaValidator);