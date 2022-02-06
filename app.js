const express = require('express');
const cors = require('cors');

// Express app
const app = express();

// Handling CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// USER AUTHENTICATION ROUTE
app.use('/auth', require('./routes/auth.route'));

/* 
******** RESOURCES' ROUTES
*/

// RESOURCE: Users
app.use('/users', require('./routes/users.route'));

// RESOURCE: Groups
app.use('/groups', require('./routes/groups.route'));

// RESOURCE: Discussions
app.use('/discussions', require('./routes/discussions.route'));

// RESOURCE: Requests
app.use('/requests', require('./routes/requests.route'));

/*
***************
*/

// Error handler
app.use(require('./middleware/errorHandler.middle'));

module.exports = app;