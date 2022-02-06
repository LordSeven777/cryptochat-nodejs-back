const express = require('express');

// Express router app
const router = express.Router();

// Controller's actions
const { getUsers, getUser, updateUserPassword } = require('../controllers/users.controller');

// Middlewares
const authenticateUser = require('../middleware/authenticateUser.middle');

// Storage path of the users' photos
const { storagePath } = require('../config/userPhoto.config');

/* 
******** ROUTES
*/

// Users' profile photos
router.use('/photos', express.static(storagePath));

// GET: /users
router.get('/', getUsers);

// GET: /users/:id
router.get('/:id', authenticateUser, getUser);

// PATCH: /users/:id/password
router.patch('/:id/password', updateUserPassword);

/*
***************
*/

module.exports = router;