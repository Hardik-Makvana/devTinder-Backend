const express = require("express");
const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../model/connectionRequest");
const User = require("../model/user");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

const userRouter = express.Router();

//get all the pending connection request for logged in user;
userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user._id;

    const connectionReq = await ConnectionRequest.find({
      toUserId: loggedInUser,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    const data = connectionReq.map((row) => ({
      ...row.fromUserId.toObject(),
      _id: row._id,
    }));

    res.json({
      message: "Data fetched succesfully",
      data: data,
    });
  } catch (err) {
    res.status(400).send("Error" + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user._id;

    const connectionRequest = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser, status: "accepted" },
        { toUserId: loggedInUser, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequest.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send("Error" + err.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    //user should see all the user excepet

    //already sent connection request
    //already rejectred that
    //already have a connection
    //his own card ni

    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    //jene req mokli je athva jeni aavi chhe teno llist karkne aapde tene hide karvana chhe
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hidUserFromFeed = new Set();

    connectionRequests.forEach((req) => {
      hidUserFromFeed.add(req.fromUserId.toString());
      hidUserFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      _id: {
        //not in hide user from feed
        $nin: Array.from(hidUserFromFeed),
        $ne: loggedInUser._id,
        //id not equal to it self
      },
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    console.log("Logged in user:", loggedInUser._id);
    console.log("Hidden user IDs:", Array.from(hidUserFromFeed));
    console.log("Users found:", users.length);
    console.log(users);
    res.json({ data: users });
  } catch (err) {
    res.status(400).send("error" + err.message);
  }
});

module.exports = userRouter;
