const Redis = require('redis')

// Create Redis client
const redisClient = Redis.createClient()

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
  connectRedis()
})

// Cache expiration times (in seconds)
const CACHE_TTL = {
  USERS: 60, // 1 minute
  MESSAGES: 60, // 1 minute
  CONVERSATIONS: 60 // 1 minute
}

// Cache middleware functions
const cacheMiddleware = {
  // Get data from cache
  getCache: async (key) => {
    try {
      if (!redisClient.isOpen) {
        await connectRedis()
      }
      return await redisClient.get(key)
    } catch (err) {
      console.error('Redis GET Error:', err)
      return null
    }
  },

  // Set data in cache
  setCache: async (key, value, type = 'USERS') => {
    try {
      if (!redisClient.isOpen) {
        await connectRedis()
      }
      return await redisClient.set(key, value, {
        EX: CACHE_TTL[type] // This sets expiration in seconds
      })
    } catch (err) {
      console.error('Redis SET Error:', err)
      return null
    }
  },

  // Delete data from cache
  deleteCache: async (key) => {
    try {
      if (!redisClient.isOpen) {
        await connectRedis()
      }
      return await redisClient.del(key)
    } catch (err) {
      console.error('Redis DEL Error:', err)
      return null
    }
  },

  // Clear all cache
  clearCache: async () => {
    try {
      if (!redisClient.isOpen) {
        await connectRedis()
      }
      return await redisClient.flushAll()
    } catch (err) {
      console.error('Redis FLUSH Error:', err)
      return null
    }
  }
}

module.exports = {
  redisClient,
  cacheMiddleware,
  CACHE_TTL
} 