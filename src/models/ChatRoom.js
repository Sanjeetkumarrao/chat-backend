import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false },
    name: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }
  },
  { timestamps: true }
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
export default ChatRoom;
