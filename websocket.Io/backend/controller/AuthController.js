const Users = require("../schema/user.schema");
const {
  userValidationSchema,
  loginValidationSchema,
} = require("../validation/user.validate");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {generateJwtToken} = require("../utils/jwt.utils");

class AuthController {
  async registerUser(req, res) {
    const { error } = userValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { firstName, lastName, email, password } = req.body;

    try {
      const existingUser = await Users.findOne({ email: email });

      if (existingUser) {
        res.status(500).json({ message: "User Already Exist" });
        return;
      }
      const user = new Users({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: await bcrypt.hash(password, 10),
      });

      // Save user to database
      const saveUser = await user.save();

      res
        .status(201)
        .json({ message: "User created successfully!", data: saveUser });
    } catch (error) {
      console.error("Error saving user:", error);
      res
        .status(500)
        .json({ message: "Error creating User", error: error.message });
    }
  }

  async loginUser(req, res) {
    //validation
    const { error } = loginValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { email, password } = req.body;

    try {
      //check user exist
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Authentication failed" });
      }

      //match password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Authentication failed" });
      }

      //generate Jwt
      let accessToken = generateJwtToken(user._id);

      res.status(200).json({ accessToken: accessToken });
    } catch (error) {
      res.status(500).json({ message: "Login failed", error: error });
    }
  }
}

module.exports = new AuthController();
