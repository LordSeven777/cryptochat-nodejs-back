const express = require('express');

// Express router app
const router = express.Router();

// Controller's actions
const { login, signup } = require('../controllers/auth.controller');

// Middlewares
const validateNewUser = require('../middleware/validateNewUser.middle');
const validateLoginUser = require('../middleware/validateLoginUser.middle');

/* 
******** ROUTES
*/

// POST: /auth/login
router.post('/login', validateLoginUser, login);

// POST: /auth/signup
router.post('/signup', validateNewUser, signup);

/*
***************
*/

module.exports = router;