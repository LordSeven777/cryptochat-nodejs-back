const express = require('express');

// Express router app
const router = express.Router();

// Controller's actions
const { getGroup } = require('../controllers/groups.controller');

/* 
******** ROUTES
*/

router.get('/:groupID', getGroup);

/*
***************
*/

module.exports = router;