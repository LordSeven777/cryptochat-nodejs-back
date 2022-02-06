// Discussions model
const { getActiveDiscussionsTypesIDs } = require('../models/discussions.model');
// Users model
const { setUserAsOnline } = require('../models/users.model')
// Socket IDs helpers
const { getUserSocketID, setUserSocketID } = require('../helpers/socketID.helper');

// When a new connected user should setup its data on the server
const setupInitHandler = (io, socket) => async (user, ack) => {
    // Checking if a socket ID is already set
    const socketID = await getUserSocketID(user.userID);

    // Setting the socket ID of the user in redis
    await setUserSocketID(user.userID, socket.id);

    // Leaving if we aleardy had a socket set up
    if (socketID) return ack({ message: 'You are set up successfully', socketId: socket.id });

    // Setting the user as online
    await setUserAsOnline(user.userID);

    // // Setting a time interval of 1min on which we udpate the user's online status
    // const updateTimer = setInterval(updateUserStatus, 90000);
    // // The updater
    // async function updateUserStatus() {
    //     if (!await getUserSocketID(user.userID)) {
    //         // Setting the user as not online
    //         await setUserAsOnline(user.userID, false);
    //         // Clearing the timer
    //         clearInterval(updateTimer);
    //     }
    // }

    // Getting the users and groups' IDS so that we can notify them about our connection
    const discussions = await getActiveDiscussionsTypesIDs(user.userID);

    // Array of promises which get the socket ID of the ones mentionned above
    // or join the room if it's a group
    // AND notify them that we're connected
    const notifySocketsPromises = discussions.map((d) => {
        if (d.type === "group") {
            const room = `group-${parseInt(d.discussionID)}`;
            // Joining the room of the group
            socket.join(room);
            // Broadcasting a "user-connection" event to all sockets in the room
            socket.broadcast.to(room).emit('user-connection', user);

            return Promise.resolve();
        }
        else
            // Getting the socket id for the user
            return getUserSocketID(d.discussionID).then(socketID => {
                // Notifying the user about our connection
                socketID && socket.to(socketID).emit("user-connection", user);
            });
    });

    // Executing the promise above
    await Promise.allSettled(notifySocketsPromises);

    ack({ message: 'You are set up successfully', socketId: socket.id });
}

module.exports = setupInitHandler;