const express = require('express');

// Express router app
const router = express.Router();

/* 
******** ROUTES
*/

router.get('/', () => console.log('Route reached!'));

/*
***************
*/

module.exports = router;