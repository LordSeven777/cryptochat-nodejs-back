// User model
const MessageModel = require('../models/messages.model');

// Socket IDs helper
const { getUserSocketID } = require('../helpers/socketID.helper');
// Crypto
const Crypto = require('../helpers/crypto.helper');

// When a user sends a new message
const sendMessageHander = (io, socket) => async (_messageData, ack) => {    
    // Storing the message
    const messageData = await MessageModel.insertMessage(_messageData);

    ack(null, messageData);

    const { message, discussion } = messageData;

    if (discussion.type === "peer") {
        const receiverSocketID = await getUserSocketID(message.receiverID);
        if (!receiverSocketID) return;
        socket.broadcast.to(receiverSocketID).emit('message', messageData);
    }
    else {
        const room = `group-${parseInt(discussion.discussionID)}`;
        socket.to(room).emit('message', messageData);
    }
}

module.exports = sendMessageHander;