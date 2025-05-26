const Users = require("../schema/user.schema");
const Conversation = require("../schema/conversation.schema");
const Message = require("../schema/message.schema");
const axios = require("axios");
const { notifyChatToSocket } = require("../thirdParty-api/socket.api");
const { getAsync, setAsync, delAsync, CACHE_TTL } = require('../services/redis.service')

class UserController {
  async getAllRegisteredUser(req, res) {
    try {
      const { userId } = req;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' })
      }

      // Try to get from cache first
      const cacheKey = `users:nonFriends:${userId}`
      try {
        const cachedUsers = await getAsync(cacheKey)
        if (cachedUsers) {
          console.log('✅ Data fetched from Redis cache')
          return res.status(200).json({
            message: 'Users fetched from Redis cache',
            source: 'cache',
            data: JSON.parse(cachedUsers)
          })
        }
      } catch (cacheError) {
        console.error('❌ Cache error:', cacheError)
      }

      console.log('🔍 Cache miss - fetching from database')
      // Database query
      const user = await Users.findById(userId).select('friends')

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      const allUsers = await Users.find({
        _id: { $ne: userId, $nin: user.friends }
      }).select('username email profilePic')

      // Try to store in cache
      try {
        await setAsync(
          cacheKey,
          JSON.stringify(allUsers)
        )
        console.log('✅ Data stored in Redis cache')
      } catch (cacheError) {
        console.error('❌ Cache storage error:', cacheError)
      }

      res.status(200).json({
        message: 'Users fetched from database',
        source: 'database',
        data: allUsers
      })
    } catch (error) {
      console.error('Error fetching users:', error)
      res.status(500).json({
        message: 'Something went wrong!',
        error: error.message
      })
    }
  }

  async getRecentUsers(req, res) {
    try {
      //check user exist
      const user = await Users.findById(req.userId).populate(
        "friends",
        "firstName lastName email",
      );
      if (!user) {
        return res.status(401).json({ error: "Authentication failed" });
      }
      console.log(user);
      res
        .status(200)
        .json({ message: "All users Get Successfully", data: user });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong!", error: error });
    }
  }

  async createNewChat(req, res) {
    try {
      const { userId, message } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      let recevierUserId = await Users.findById(userId);
      console.log(recevierUserId);
      if (!recevierUserId) {
        return res.status(400).json({ message: "User ID not exist" });
      }

      // Check if the chat already exists
      let existingChat = await Conversation.findOne({
        isGroupChat: false,
        participants: { $all: [userId, req.userId] },
      });

      if (existingChat) {
        let newMessage = new Message({
          chatId: existingChat._id,
          sender: req.userId,
          content: message,
        });

        let newVar = await newMessage.save();

        return res
          .status(200)
          .json({ message: "Chat already exists", data: existingChat });
      }

      // Create a new chat
      const newChat = new Conversation({
        participants: [userId, req.userId],
        chatName: "1to1",
        isGroupChat: false,
      });

      let savedConversation = await newChat.save();

      // Add each user to the other's friends list
      await Users.findByIdAndUpdate(userId, {
        $addToSet: { friends: req.userId },
      });
      await Users.findByIdAndUpdate(req.userId, {
        $addToSet: { friends: userId },
      });

      let newMessage = new Message({
        chatId: newChat._id,
        sender: req.userId,
        content: message,
      });

      let newVar = await newMessage.save();
      console.log(newVar);

      res.status(201).json({
        message: "Chat created successfully",
        data: savedConversation,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  async chatWithExisting(req, res) {
    try {
      const { userId, message } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      let recevierUserId = await Users.findById(userId);
      console.log(recevierUserId);
      if (!recevierUserId) {
        return res.status(400).json({ message: "User ID not exist" });
      }

      // Check if the chat already exists
      let existingChat = await Conversation.findOne({
        isGroupChat: false,
        participants: { $all: [userId, req.userId] },
      });

      if (existingChat) {
        let newMessage = new Message({
          chatId: existingChat._id,
          sender: req.userId,
          content: message,
        });

        let savedMessage = await newMessage.save();

        // Invalidate messages cache for both users
        const cacheKey1 = `messages:${req.userId}:${userId}`
        const cacheKey2 = `messages:${userId}:${req.userId}`
        await Promise.all([
          delAsync(cacheKey1),
          delAsync(cacheKey2)
        ])

        // Notify socket server
        notifyChatToSocket(
          {
            chatId: savedMessage.chatId,
            senderId: savedMessage.sender,
            receiverId: recevierUserId._id,
            message: savedMessage.content,
            messageType: savedMessage.messageType,
            fileUrl: savedMessage.fileUrl,
          },
          req.header("Authorization"),
        )
          .then((response) => {
            console.log("Notified Successfully");
          })
          .catch((error) => {
            return res
              .status(500)
              .json({ message: "Failed to socket", data: error });
          });
        return res.status(200).json({ message: "Chat sent", data: savedMessage });
      }
      res.status(500).json({ message: "Something went Wrong! " });
    } catch (error) {
      res.status(500).json({ message: "Something went Wrong! ", error: error });
    }
  }

  async getAllChats(req, res) {
    try {
      const { userId } = req.body;

      // Try to get messages from cache
      const cacheKey = `messages:${req.userId}:${userId}`
      try {
        const cachedMessages = await getAsync(cacheKey)
        if (cachedMessages) {
          console.log('✅ Messages fetched from Redis cache')
          return res.status(200).json({
            message: 'Messages fetched from Redis cache',
            source: 'cache',
            data: JSON.parse(cachedMessages)
          })
        }
      } catch (cacheError) {
        console.error('❌ Cache error:', cacheError)
      }

      console.log('🔍 Cache miss - fetching messages from database')
      // If not in cache, get from database
      let existingChat = await Conversation.findOne({
        isGroupChat: false,
        participants: { $all: [userId, req.userId] },
      })

      let allMessages = await Message.find({
        chatId: existingChat._id,
      })

      // Store in cache
      try {
        await setAsync(
          cacheKey,
          JSON.stringify(allMessages)
        )
        console.log('✅ Messages stored in Redis cache')
      } catch (cacheError) {
        console.error('❌ Cache storage error:', cacheError)
      }

      return res.status(200).json({
        message: 'Messages fetched from database',
        source: 'database',
        data: allMessages
      })
    } catch (error) {
      console.error('Error fetching messages:', error)
      res.status(500).json({
        message: 'Something went wrong!',
        error: error.message
      })
    }
  }
}

module.exports = new UserController();
