const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const connectDb = require("./config/database");
require("dotenv").config();


app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "true",
  credentials: true
}));
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDb()
  .then(() => {
    console.log("DataBase Connected Successfully");
    app.listen(7776, () => {
      console.log("app is running at port 7776");
    });
  })
  .catch((error) => {
    console.log("DataBase Connection Failed");
  });
