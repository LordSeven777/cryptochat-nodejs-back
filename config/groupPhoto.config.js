const path = require('path');

// Server's domain
const { DOMAIN } = require('./server.config');

// Photos storage path
const storagePath = path.join(__dirname, './', 'images/groups');

// URL path
const urlPath = `http://${DOMAIN}/groups/photos/`;

module.exports = { storagePath, urlPath };