const express = require("express");
const { userAuth } = require("../middleware/auth.js");
const { validateEditProfileData } = require("../utils/validation.js");
const User = require("../model/user.js");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");

// get user profile api
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send("Error saving the user : " + err.message);
  }
});

//edit profile api
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }
    const loggedInUser = req.user;

    const allowedFields = [
      "firstName",
      "lastName",
      "photoUrl",
      "gender",
      "age",
      "about",
    ];

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        loggedInUser[field] = req.body[field];
      }
    });

    await loggedInUser.save();

    res.json({
      message: "profile updated successfully",
      data: loggedInUser,
    });

    // res.send("Your Profile Updated Successfully");
  } catch (err) {
    res.status(400).send("Error saving the user : " + err.message);
  }
});

//forget password for user
profileRouter.patch("/profile/password" , userAuth  , async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Email is not registered");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const hassedPassword = await bcrypt.hash(password, 10);

      user.password = hassedPassword;
      await user.save();
    }

    res.send("password updated succesfully");
  } catch (err) {
    res.status(400).send("Error updating password" + err.message);
  }
});

module.exports = profileRouter;
