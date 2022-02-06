// App error
const AppError = require('../helpers/appError.helper');

// Model
const UserModel = require('../models/users.model');

// Helper for bcrypt operations
const { hashPassword } = require('../helpers/bcrypt.helper');

// ACTION: Gets users
module.exports.getUsers = async (req, res, next) => {
    try {
        const { userID: currentUserID } = req;
        const { accepted, page, limit, search } = req.query;

        // Params
        const nameQuery = (search) ? decodeURI(search) : '';
        const _page = (page) ? parseInt(page) : undefined;
        const _limit = (limit) ? parseInt(limit) : undefined;

        // Is a accepted user or not
        const isAccepted = Boolean(parseInt(accepted));

        // If not accepted, sending non-accepted users
        if (!accepted || !isAccepted)
            res.send(await UserModel.getNonAcceptedUsers(currentUserID, _page, _limit, nameQuery));
        // If nameQuery, sending suggested accepted users
        else if (isAccepted)
            res.send(await UserModel.getAcceptedUsersSuggestions(currentUserID, _page, _limit));
    } 
    catch (error) {
        next(error);
    }
}


// ACTION: Gets a specific user
module.exports.getUser = async (req, res, next) => {
    try {
        const { userID: currentUserID } = req;
        const { id: targetUserID } = req.params;

        const userData = await UserModel.getUser(targetUserID, currentUserID);

        res.json(userData);
    } 
    catch (error) {
        next(error);    
    }
}


// ACTION: Updates a user's password
module.exports.updateUserPassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        const hashedPassword = await hashPassword(newPassword);
        await UserModel.updateUserPassword(parseInt(id), hashedPassword);
        res.json({ message: "Password updated successfully" });
    } 
    catch (error) {
        next(error);    
    }
} 