import { Router } from "express";
import { Chat } from "../models/chat.model";

const router = Router();

// GET /api/chat/:room → 특정 방의 메시지 받기
router.get("/:room", async (req, res) => {
  try {
    const room = req.params.room;
    const messages = await Chat.find({ room }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
