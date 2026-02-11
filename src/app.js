const express = require("express");
const { createServer } = require("http");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const connectDb = require("./config/database");
require("dotenv").config();

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      process.env.FRONTEND_URL, // Allow dynamic frontend URL
      "https://campusverse.duckdns.org",
    ].filter(Boolean), // Filter out undefined if env var is missing
    credentials: true,
  }),
);



const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const initialSocket = require("./utils/socket");

const server = createServer(app);
initialSocket(server);

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

connectDb()
  .then(() => {
    console.log("DataBase Connected Successfully!!!");
    const PORT = process.env.PORT || 7776;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`app is running at port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("DataBase Connection Failed");
  });
