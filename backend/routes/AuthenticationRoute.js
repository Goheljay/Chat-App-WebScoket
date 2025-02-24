const routes = require("express").Router();
const AuthController = require("../controller/AuthController");

routes.post("/signup", AuthController.registerUser);
routes.post("/login", AuthController.loginUser);

module.exports = routes;
