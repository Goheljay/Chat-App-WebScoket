const Users = require("../schema/user.schema");
const Conversation = require("../schema/conversation.schema");
const Message = require("../schema/message.schema");
const axios = require("axios");
const { notifyChatToSocket } = require("../thirdParty-api/socket.api");

class UserController {
  async getAllRegisteredUser(req, res) {
    try {
      const { userId } = req.body; // Assume userId is sent in request body

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Get the user's friends list
      const user = await Users.findById(userId).select("friends");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Find all users who are NOT in the friends list
      const allUsers = await Users.find({
        _id: { $ne: userId, $nin: user.friends } // Exclude current user & friends
      }).select("username email profilePic");

      res.status(200).json({ message: "Users fetched successfully", data: allUsers });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Something went wrong!", error: error.message });
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

        let newVar = await newMessage.save();
        console.log(userId);
        const token = req.header("Authorization");
        console.log(newVar);
        // Notify socket server
        notifyChatToSocket(
          {
            chatId: newVar.chatId,
            senderId: newVar.sender,
            receiverId: recevierUserId._id,
            message: newVar.content,
            messageType: newVar.messageType,
            fileUrl: newVar.fileUrl,
          },
          token,
        )
          .then((response) => {
            console.log("Notified Successfully");
          })
          .catch((error) => {
            return res
              .status(500)
              .json({ message: "Failed to socket", data: error });
          });
        return res.status(200).json({ message: "Chat sent", data: newVar });
      }
      res.status(500).json({ message: "Something went Wrong! " });
    } catch (error) {
      res.status(500).json({ message: "Something went Wrong! ", error: error });
    }
  }

  async getAllChats(req, res) {
    try {
      const { userId } = req.body;

      let existingChat = await Conversation.findOne({
        isGroupChat: false,
        participants: { $all: [userId, req.userId] },
      });

      let allMessages = await Message.find({
        chatId: existingChat._id,
      });
      console.log(allMessages);

      return res
        .status(200)
        .json({ message: "All message Get Successfully", data: allMessages });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went Wrong! ", error: error });
    }
  }
}

module.exports = new UserController();
