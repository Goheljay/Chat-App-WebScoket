const route = require("express").Router();

route.use("/auth", require("./AuthenticationRoute"));
route.use("/app", require("./AppRoute"));
route.use("/ai", require("./AIRoute"));
module.exports = route;
