const { mongoose } = require("../config/mongo.config");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  recentChat: {type: Boolean, required: true, default: false},
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
}, {timestamps: true});

module.exports = mongoose.model("Users", userSchema);
