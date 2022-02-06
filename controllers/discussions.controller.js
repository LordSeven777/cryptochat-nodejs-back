// Models
const DiscussionModel = require('../models/discussions.model');
const MessageModel = require('../models/messages.model');
const ImageModel = require('../models/images.model');

// Crypto
const Crypto = require('../helpers/crypto.helper');

// ACTION: Gets all discussions
module.exports.getDiscussions = async (req, res, next) => {
    try {
        const { userID: currentUserID } = req;
        const { page, limit, search, ext } = req.query;

        // The number of unread discussions
        let unreadDiscussionsNb;
        const isExtended = !ext || Boolean(parseInt(ext));
        if (isExtended)
            unreadDiscussionsNb = await DiscussionModel.countUnreadDiscussions(currentUserID);

        // Params
        const _page = page ? parseInt(page) : 1;
        const _limit = limit ? parseInt(limit) : 7;

        // Ordered recent discussions with 7 last messages
        const discussions = await DiscussionModel.getDiscussions(currentUserID, _page, _limit, search);

        const responseData = { discussions };
        if (isExtended) responseData.unreadNb = unreadDiscussionsNb;
        res.json(responseData);
    } 
    catch (error) {
        next(error);
    }
}


// ACTION: Gets messages of a specific discussion
module.exports.getDiscussionMessages = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type, limit, dateCheck } = req.query;

        // Params
        const _type = (!type || (type && type === 'peer')) ? 'peer' : 'group';
        const _limit = (limit) ? parseInt(limit) : 10;
        const dateCheckUp = decodeURI(dateCheck);
        console.log(dateCheckUp);

        // Discussion messages data
        const messagesData = await MessageModel.getDiscussionMessages(_type, id, _limit, dateCheckUp);

        res.json(messagesData);
    }
    catch (error) {
        next(error);
    }
}


// ACTIONS: Gets messages of a specific discussion
module.exports.getDiscussionImages = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type, limit, page } = req.query;

        // Params
        const _type = (!type || (type && type === 'peer')) ? 'peer' : 'group';
        const _page = (page) ? parseInt(page) : 1;
        const _limit = (limit) ? parseInt(limit) : 12;

        // Getting the images
        const images = await ImageModel.getDiscussionsImages(id, _type, _page, _limit);

        res.json(images);
    }
    catch (error) {
        next(error);
    }
}