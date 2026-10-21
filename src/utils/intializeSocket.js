const socket = require("socket.io");
const Chat = require("../model/chat.js");
const ConnectionRequest = require("../model/connectionRequest.js");

const intializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");

      socket.join(roomId);
      console.log("Joined room:", roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, userId, targetUserId, text }) => {
        const roomId = [userId, targetUserId].sort().join("_");

        console.log("Message received:", firstName, text);

        //you shoul be friend before sending messages
        try {
          const acceptedConnection = await ConnectionRequest.findOne({
            status: "accepted",
            $or: [
              { fromUserId: userId, toUserId: targetUserId },
              { fromUserId: targetUserId, toUserId: userId },
            ],
          });

          if (!acceptedConnection) {
            socket.emit("messageError", {
              message: "You must be friends to send a message.",
            });
            return;
          }

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          // Create a chat only if one does not exist
          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              message: [],
            });
          }

          // Save every message, whether the chat is new or existing
          chat.message.push({
            senderId: userId,
            text,
          });

          await chat.save();

          // Deliver every message to both users in the room
          io.to(roomId).emit("messageReceived", {
            firstName,
            userId,
            text,
          });
        } catch (err) {
          console.error("Error sending message:", err);
        }
      },
    );

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = intializeSocket;
