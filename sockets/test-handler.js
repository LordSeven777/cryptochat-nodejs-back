// Socket IDs helpers
const { getUserSocketID, setUserSocketID } = require('../helpers/socketID.helper');

const init = (io, socket) => async (data, ack) => {
    const socketID = await getUserSocketID(data.userID);
    console.log(socketID);
    if (!socketID) await setUserSocketID(socket.id);
    ack(null, "5/5");
}

const chat = (io, socket) => async (data, ack) => {
    const socketID = await getUserSocketID(data.userID);
    console.log(socketID);
    if (socketID) {
        socket.broadcast.to(socketID).emit('chat-reply', "a message!");
        ack(null, "message is sent");
    }
}

module.exports = {
    init,
    chat
};
