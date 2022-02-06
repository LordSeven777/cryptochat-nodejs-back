// Model
const DiscussionModel = require('../models/groups.model');

// ACTION: Gets a group
module.exports.getGroup = async (req, res, next) => {
    try {
        const { groupID } = req.params;
        const groupData = await DiscussionModel.getGroup(groupID);
        res.send(groupData);
    } 
    catch (error) {
        next(error);    
    }
}