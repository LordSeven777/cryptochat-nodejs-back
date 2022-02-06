const path = require('path');

// Server's domain
const { DOMAIN } = require('./server.config');

// Photos storage path
const storagePath = path.join(__dirname, '../', 'images/users');

// URL path
const urlPath = `http://${DOMAIN}/users/photos/`;

module.exports = { storagePath, urlPath };