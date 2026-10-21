const express = require("express");
const { userAuth } = require("../middleware/auth");
const { Chat } = require("../model/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const userId = req.user._id;
  const { targetUserId } = req.params;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "message.senderId",
      select: "firstName lastName",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });

      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = chatRouter;
