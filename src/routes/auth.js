const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation.js");
const User = require("../model/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 8 * 60 * 60 * 1000,
};

authRouter.post("/signup", async (req, res) => {
  try {
    //validate the data
    validateSignupData(req);

    //encrpt the password

    const { firstName, lastName, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    //creating a instance of the user model
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    const savedUser = await user.save();

    // const token = await jwt.sign({ _id: user._id }, "DEV@Tinder$790");
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    console.log(token);

    res.cookie("token", token, cookieOptions);

    res.json({ message: "req added succesfullly", data: savedUser });
  } catch (err) {
    res.status(400).send("Error saving the user : " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error("Email is not present in DB");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      // const token = await jwt.sign({ _id: user._id }, "DEV@Tinder$790");
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      console.log(token);

      // res.cookie("token", token);
      res.cookie("token", token, cookieOptions);

      res.send(user);
      console.log("login succesfull");
    } else {
      throw new Error("Password is not Correct ");
    }
  } catch (err) {
    // res.status(400).send("Error saving the user : " + err.message.);/
    res.status(400).send(err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("logout succesful !!");
});

module.exports = authRouter;
