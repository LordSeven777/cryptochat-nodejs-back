const path = require('path');

// DOMAIN
const { DOMAIN } = require('./server.config');

// Storage path
const storagePath = {
    peer: path.join(__dirname, 'users/discussions'),
    group: path.join(__dirname, 'groups/discussions')
};

// URL path
const urlPath = {
    peer: `http://${DOMAIN}/discussions/images/`,
    group: `http://${DOMAIN}/discussions/groups/images/`,
}

module.exports = { storagePath, urlPath };