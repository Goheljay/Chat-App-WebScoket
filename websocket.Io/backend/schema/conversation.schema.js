const { mongoose } = require("../config/mongo.config");

const conversationSchema = new mongoose.Schema({
    chatName: { type: String },
    isGroupChat: { type: Boolean, default: false },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("Conversation", conversationSchema);

