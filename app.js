//stating point of your app
const express = require("express");
const connectDB = require("./src/config/database.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const http = require("http");
require("dotenv").config();
// const cors from "cors"

app.use("/app", (req, res) => {
  res.send("Hello bhaioo");
});

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} - ${Date.now() - start}ms`);
  });

  next();
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./src/routes/auth.js");
const profileRouter = require("./src/routes/profile.js");
const requestRouter = require("./src/routes/requests.js");
const userRouter = require("./src/routes/user.js");
const intializeSocket = require("./src/utils/intializeSocket.js");
const chatRouter = require("./src/routes/chat.js");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
intializeSocket(server);

connectDB()
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log("Succesfully running on 8080...");
    });
  })
  .catch((err) => {
    console.log("Error connecting to the database:", err);
  });
