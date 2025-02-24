const { mongoose } = require("../config/mongo.config");

const messageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    messageType: { type: String, enum: ["text", "image", "video", "file"], default: "text" },
    fileUrl: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
