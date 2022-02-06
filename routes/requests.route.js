const express = require('express');

// Express router app
const router = express.Router();

// Middlewares
const authenticateUser = require('../middleware/authenticateUser.middle');

// Controller's actions
const { getPendingRequests } = require('../controllers/requests.controller');

/* 
******** ROUTES
*/

router.get('/', authenticateUser, getPendingRequests);

/*
***************
*/

module.exports = router;