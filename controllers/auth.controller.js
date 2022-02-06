// User model
const UserModel = require('../models/users.model');

// Password hashing helper methods
const { hashPassword } = require('../helpers/bcrypt.helper');

// JWT hepler methods
const { generateAccessToken } = require('../helpers/jwt.helper');
 

// ACTION: Logs in a user
module.exports.login = async (req, res, next) => {
    try {
        const { user } = req;
        const { userID, firstName, lastName } = user;

        // Generating an access token
        const accessToken = generateAccessToken({ userID, firstName, lastName });
        console.log(accessToken, user);

        res.json({ accessToken, user });
    } 
    catch (error) {
        next(error);    
    }
}


// ACTION: Signs up a new user
module.exports.signup = async (req, res, next) => {
    try {
        const { firstName, lastName, gender, pseudo, email, password } = req.body;

        // Hashing the password
        const { password: hashedPassword } = await hashPassword(password);

        // Inserting the user to the MySQL database
        const userID = await UserModel.insertUser({ 
            firstName, lastName, gender, pseudo, email, 
            password: hashedPassword 
        });

        // New user's data
        const user = { userID, firstName, lastName, gender, photoURL: null, hidden: 0 };

        // Generating an access token
        const accessToken = generateAccessToken({ userID, firstName, lastName });

        res.status(201).json({ accessToken, user });
    } 
    catch (error) {
        next(error);    
    }
}