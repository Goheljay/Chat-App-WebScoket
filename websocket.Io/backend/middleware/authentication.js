const jwt = require("jsonwebtoken");
const repl = require("repl");
const { generateJwtToken } = require("../utils/jwt.utils");
function verifyToken(req, res, next) {
  console.log(req.originalUrl);
  if (req.originalUrl.includes("/auth")) {
    next();
    return;
  }
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    //decode and verify token
    let replaceToken = token.replace("Bearer ", "");
    const decoded = jwt.verify(replaceToken, "secret");

    //set in req
    req.userId = decoded.userId;

    //set new token in response
    let accessToken = generateJwtToken(decoded.userId);
    res.setHeader("accessToken", accessToken);

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error });
  }
}

module.exports = verifyToken;
