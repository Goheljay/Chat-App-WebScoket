const redis = require("redis");
require('dotenv').config();

const {REDIS_HOST, REDIS_PORT} = process.env;

console.log(REDIS_HOST, REDIS_PORT);

const redisClient = redis.createClient({
     url: `redis://${REDIS_HOST}:${REDIS_PORT}`
});

redisClient.on("connect", () => console.log("🔄 Redis connected"));
redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

module.exports = redisClient;
