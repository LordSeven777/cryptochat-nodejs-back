// Model
const RequestModel = require('../models/requests.model');

// ACTION: Gets pending requests
module.exports.getPendingRequests = async (req, res, next) => {
    try {
    	const { userID: currentUserID } = req;
    	const { limit, checkupDate } = req.query;

    	const _limit = limit ? parseInt(limit) : 7;
    	const _checkupDate = checkupDate ? decodeURI(checkupDate) : undefined;

        const requestData = await RequestModel.getPendingRequests(2, _limit, _checkupDate);
        
        res.send(requestData);
    } 
    catch (error) {
        next(error);
    }
}