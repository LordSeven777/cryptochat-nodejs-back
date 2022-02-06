const redis = require('redis');

// Creating a redis client instance
const redisClient = redis.createClient();

module.exports = redisClient;