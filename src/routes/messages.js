import express from "express";
import auth from "../middlewares/authMiddleware.js";
import Message from "../models/Message.js";

const router = express.Router();

// get all messages of a chat
router.get("/:chatId", auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId })
      .populate("sender", "name avatarUrl")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
