const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middleware/auth.js");
const User = require("../model/user.js");
const ConnectionRequest = require("../model/connectionRequest.js");

//request sent
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "invalid status type" });
      }

      // Check if the fromUserId is the same as toUserId.
      if (fromUserId.toString() === toUserId.toString()) {
        return res
          .status(400)
          .json({ message: "cannot send connection request to yourself" });
      }

      //if there is an existing connextion request
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "connection request already sent" });
      }

      //JENE MOKLE E  DATABASE MA CHHA KE NAI
      const user = await User.findById(toUserId);
      if (!user) {
        return res.status(400).send("Incorrect : User not found ");
      }

      const newconnectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await newconnectionRequest.save();

      res.json({
        message: "Connection request sent successfully",
        data,
      });
    } catch (err) {
      res.status(400).send("Error" + err.message);
    }
  },
);

//request review
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const requestId = req.params.requestId;
      const status = req.params.status;

      // const allowedStatus = ["interested", "rejected"];
      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).send("Invalid status");
      }

      const newConnectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!newConnectionRequest) {
        return res.status(400).send("Connection request not found");
      }

      newConnectionRequest.status = status;

      const data = await newConnectionRequest.save();

      res.json({ message: "Conection Request" + status, data });
    } catch (err) {
      res.status(400).send("Error" + err.message);
    }
  },
);

module.exports = requestRouter;
