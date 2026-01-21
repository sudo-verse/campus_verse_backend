const express = require("express");
const userRouter = express.Router();
const User = require("../models/user");
const connectionRequest = require("../models/connectionRequest");
const auth = require("../middlewares/auth");
const userString = "name gender about photoUrl";
userRouter.get("/user/request/received",auth,async(req,res)=>{
  try{
    const loginUserId=req.user._id;
    const users=await connectionRequest.find({
        toUserId:loginUserId,
        status:"interested"
    }).populate("fromUserId", userString);
    res.send(users);
  }catch(err){
    res.status(400).send("Error : ", err.message);
  }
});
userRouter.get("/user/connections",auth,async(req,res)=>{
  try{
    const loginUserId=req.user._id;
    const connections=await connectionRequest.find({
        $or:[
          {fromUserId:loginUserId},
          {toUserId:loginUserId}
        ],
        status:"accepted"
    }).populate("fromUserId toUserId", userString);
    
    const data = connections.map(conn => {
      if (conn.fromUserId._id.equals(loginUserId)) {
        return conn.toUserId;
      } else {
        return conn.fromUserId;
      }
    });
    res.send(data);
  }catch(err){
    res.status(400).send("Error : ", err.message);
  }
});
userRouter.get("/user/feed",auth,async(req,res)=>{
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await connectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId  toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(userString)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;