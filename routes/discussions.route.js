const express = require('express');

// Discussions' images storage path
const { storagePath } = require('../config/discussionsImages.config');

// Express router app
const router = express.Router();

// Middlewares
const authenticateUser = require('../middleware/authenticateUser.middle');

// Controller's actions
const { 
    getDiscussions, 
    getDiscussionMessages, 
    getDiscussionImages 
} = require('../controllers/discussions.controller');

/* 
******** ROUTES
*/

// Peer to peer discussions's images
router.use('/images', express.static(storagePath.peer));

// Group discussions's images
router.use('/groups/images', express.static(storagePath.group));

// GET: /discussions
router.get('/', authenticateUser, getDiscussions);

// GET: /discussions/:id/messages
router.get('/:id/messages', getDiscussionMessages);

// GET: /discussions/:id/images
router.get('/:id/images', getDiscussionImages);

/*
***************
*/

module.exports = router;