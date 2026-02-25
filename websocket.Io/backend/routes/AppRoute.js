const routes = require("express").Router();
const AppController = require("../controller/UserController");

routes.get("/getAllUsers", AppController.getAllRegisteredUser);
routes.get("/getRecentFriends", AppController.getRecentUsers);
routes.post("/newChat", AppController.createNewChat);
routes.post("/existingChat", AppController.chatWithExisting);
routes.post("/getChats", AppController.getAllChats);

module.exports = routes;
