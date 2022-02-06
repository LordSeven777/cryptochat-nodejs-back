const moment = require('moment');

// MySQL connection pool
const pool = require('../dbPool');

module.exports = class {
    
    static async getDiscussionMessages(type = 'peer', id = 1, limit = 10, dateCheckUp) {
        const messagesTableName = (type === 'peer') ? 'messages' : 'groups_messages';
        const messagesIDColName = (type === 'peer') ? 'messageID' : 'group_message_ID';
        const discussionsTableName = (type === 'peer') ? 'discussions' : 'groups';
        const discussionIDColName = (type === 'peer') ? 'discussionID' : 'groupID';
        
        // Getting the messages
        let SQL = `
        SELECT ${messagesTableName}.* FROM ${discussionsTableName}
        INNER JOIN ${messagesTableName}
        ON ${messagesTableName}.${discussionIDColName} = ${discussionsTableName}.${discussionIDColName}
        WHERE ${discussionsTableName}.${discussionIDColName} = ${id}
        ${dateCheckUp ? `AND ${messagesTableName}.date < "${dateCheckUp}"` : ''}
        GROUP BY ${messagesTableName}.${messagesIDColName}
        ORDER BY ${messagesTableName}.date DESC
        LIMIT ${limit}
        `;
        const messages = await pool.query(SQL);

        // Refactoring
        for (const message of messages) {
            if (message.group_message_ID) {
                message.messageID = message.group_message_ID;
                delete message["group_message_ID"];
            }
        }

        // Getting the messages' images if the message's nature is an image
        // for (const message of messages) {
        //     if (message.nature === 'image') {
        //         const fkColName = type === 'peer' ? 'messageID' : 'gMessageID';
        //         const SQL = `
        //         SELECT i.imageID, CONCAT("${urlPath}", i.name) AS imageURL FROM images
        //         WHERE i.${fkColName} = ${messageID}
        //         `;
        //         const result = await pool.query(SQL);
        //         message.images = result;
        //     }
        // } 
        return { 
            type,
            discussionID: parseInt(id), 
            mEnd: messages.length < limit, 
            messages: messages 
        };
    }


    // Inserts a new message
    static async insertMessage(messageData) {
        const { message, discussion: { type, discussionID } } = messageData;

        const messagesTableName = (type === 'peer') ? 'messages' : 'groups_messages';
        const discussionIDColName = (type === 'peer') ? 'discussionID' : 'groupID';

        // Current time formatted
        const timeNowFormatted = moment().format("YYYY-MM-DD HH:mm:ss");

        // Setting the date in the message data
        messageData.message.date = timeNowFormatted;

        // Data to insert
        const data = {
            ...message,
            [discussionIDColName]: discussionID
        }

        const SQL = `INSERT INTO ${messagesTableName} SET ?`;

        const result = await pool.query(SQL, data);

        messageData.message.messageID = result.insertId.toString().padStart(10, 0);
        messageData.message.status = "sent";

        return messageData;
    }
}