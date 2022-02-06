// Discussions' images' url path
const { urlPath } = require('../config/discussionsImages.config') 

// MySQL connection pool
const pool = require('../dbPool');

class ImageModel {

    static async getDiscussionsImages(discussionID = 1, type = 'peer', page = 1, limit = 12) {
        const messagesTableName = (type === 'peer') ? 'messages' : 'groups_messages';
        const messagesIDColName = (type === 'peer') ? 'messageID' : 'group_message_ID';
        const discussionsTableName = (type === 'peer') ? 'discussions' : 'groups';
        const discussionIDColName = (type === 'peer') ? 'discussionID' : 'groupID';
        const fkColName = type === 'peer' ? 'messageID' : 'gMessageID';
        const _urlPath = type === 'peer' ? urlPath.peer : urlPath.group;

        const SQL = `
        SELECT i.imageID, CONCAT("${_urlPath}", i.name) AS imageURL 
        FROM images AS i
        INNER JOIN ${messagesTableName} AS m ON m.${messagesIDColName} = i.${fkColName}
        INNER JOIN ${discussionsTableName} AS d ON d.${discussionIDColName} = m.${discussionIDColName}
        WHERE d.${discussionIDColName} = ${discussionID}
        LIMIT ${(page - 1) * limit},${limit}
        `;

        return await pool.query(SQL);
    }

}

module.exports = ImageModel;