const AppError = require('../helpers/appError.helper');

// JWT helper
const { verifyAccessToken } = require('../helpers/jwt.helper');

// Authenticate the user from request
// Sets the user to the request object
module.exports = async (req, res, next) => {
    const authHeaders = req.headers['authorization'];
    const token = authHeaders && authHeaders.split(' ')[1];
    if (token == null) return res.status(401);
    
    const { userID } = await verifyAccessToken(token);
    req.userID = userID;
    next();
}