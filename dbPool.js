const mysql = require('mysql');
const util = require('util');

// Database config
const databaseConfig = require('./config/db.config');

// MySQL connection pool
const pool = mysql.createPool(databaseConfig);

// Getting a connection from MySQL
pool.getConnection((error, connection) => {
    if (error)
        return console.log('Something went wrong while connecting to MySQL');
    if (connection) {
        console.log('Connected to MySQL ...');
        connection.release();
    }
    return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;