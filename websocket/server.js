const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "secret";
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const users = {}; // Store user sockets

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // // User authentication via JWT
  // socket.on("authenticate", (token) => {
  //   try {
  //     const user = jwt.verify(token, SECRET_KEY);
  //     users[user.id] = socket.id; // Store user socket ID
  //     console.log(`User ${user.id} connected`);
  //   } catch (error) {
  //     socket.emit("auth_error", "Invalid Token");
  //     socket.disconnect();
  //   }
  // });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    // Object.keys(users).forEach((id) => {
    //   if (users[id] === socket.id) delete users[id];
    // });
  });
});

// Receive message from API & broadcast to recipient
app.post("/socketMessage", (req, res) => {
  const { chatId, senderId, receiverId, message, messageType, fileUrl } =
    req.body;
  // if (users[receiverId]) {
  io.emit(receiverId, {
    chatId,
    senderId,
    receiverId,
    message,
    messageType,
    fileUrl,
  });
  // }

  res.json({ status: "Message sent to Socket.io" });
});

server.listen(4000, () =>
  console.log("Socket.io Server running on http://localhost:4000"),
);
