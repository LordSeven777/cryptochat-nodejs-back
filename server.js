const http = require('http');

// Express api app
const app = require('./app');

// HTTP server
const server = http.createServer(app);

// Listening to a PORT
const { PORT } = require('./config/server.config');
server.listen(PORT, () => console.log(`Server running on port ${PORT} ...`));


/******** SOCKET.IO ******************************************** */

// Integrating socket.io with the http server
const io = require('socket.io')(server);

// Checking the redis-client connection
const redisClient = require('./redisClient');
redisClient.on('connect', () => console.log('Connected to Redis ...'));

// Event handlers setupInitHandler
const { init, chat } = require('./sockets/test-handler');
const setupInitHandler = require('./sockets/setupInit-handler');
const sendMessageHander = require('./sockets/sendMessage-handler');

// const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

// io.use(wrap(require('./middle')));

// io.use((socket, next) => {
//     console.log('no! no!');
//     next();
// });

// Listenning to websocket events
io.on('connection', (socket) => {
    // socket.broadcast.to("0YBIA0GIan4u3yQFAAAH").emit('chat-reply', "lol")
    // socket.removeAllListeners('setup-init');
    // socket.removeAllListeners('send-message');

    console.log("A user was connected");
    // console.log(socket.rooms);

    // socket.on("make-test", init(io, socket));
    // socket.on("chat", chat(io, socket));

    // socket.on('greeting', (message, ack) => {
    //     console.log(message);
    //     ack(null, 'hi!');
    // });

    socket.on('setup-init', setupInitHandler(io, socket));

    socket.on('send-message', sendMessageHander(io, socket));
});