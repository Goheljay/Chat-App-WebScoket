const { promisify } = require('util');
const redisClient = require('../config/redis.config');


// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect()
    console.log('Redis Client Connected')
  } catch (err) {
    console.error('Redis Connection Error:', err)
  }
}

// Initialize connection
connectRedis()

// Handle errors and reconnection
redisClient.on('error', err => {
  console.error('Redis Client Error:', err)
})

redisClient.on('end', () => {
  console.log('Redis connection ended - attempting to reconnect...')
  redisClient = redisClient();
})

// Cache expiration times (in seconds)
const CACHE_TTL = {
  USERS: 60, // 1 minute
  MESSAGES: 60, // 1 minute
  CONVERSATIONS: 60 // 1 minute
}

// Wrapper functions to handle connection state
const safeGet = async (key) => {
  try {
    if (!redisClient.isOpen) {
      await connectRedis()
    }
    return await redisClient.get(key)
  } catch (err) {
    console.error('Redis GET Error:', err)
    return null
  }
}

const safeSet = async (key, value, options) => {
  try {
    if (!redisClient.isOpen) {
      await connectRedis()
    }
    return await redisClient.set(key, value, {
      EX: CACHE_TTL.USERS // This sets expiration in seconds
    })
  } catch (err) {
    console.error('Redis SET Error:', err)
    return null
  }
}

const safeDel = async (key) => {
  try {
    if (!redisClient.isOpen) {
      await connectRedis()
    }
    return await redisClient.del(key)
  } catch (err) {
    console.error('Redis DEL Error:', err)
    return null
  }
}

module.exports = {
  redisClient,
  getAsync: safeGet,
  setAsync: safeSet,
  delAsync: safeDel,
  CACHE_TTL
} 