const route = require("express").Router();

route.use("/auth", require("./AuthenticationRoute"));
route.use("/app", require("./AppRoute"));
module.exports = route;
