// Redis client
const redisClient = require('../redisClient');

// Gets the socket ID of a user
const getUserSocketID = (_userID) => {
    const userID = typeof _userID === "number" ? _userID : parseInt(_userID);
    return new Promise((resolve, reject) => {
        redisClient.GET(`user-${userID}`, (error, socketID) => {
            if (error) reject(error);
            else resolve(socketID);
        });
    });
}

// Sets the socket ID of a client
const setUserSocketID = (_userID, socketID) => {
    const userID = typeof _userID === "number" ? _userID : parseInt(_userID);
    return new Promise((resolve, reject) => {
        redisClient.SET(`user-${userID}`, socketID, 'EX', 60 * 60 * 24, (error, reply) => {
            if (error) reject(error);
            else resolve(reply);
        });
    });
}

module.exports = {
    getUserSocketID,
    setUserSocketID
};
