const express = require("express");
const auth = require("../middlewares/auth");
const requestRouter = express.Router();
const connectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

requestRouter.post("/request/send/:status/:id", auth, async (req, res) => {
  try {
    const toUserId = req.params.id;
    const status = req.params.status;
    const fromUserId = req.user._id;
    const allowedStatus = ["interested", "ignored"];
    if (!allowedStatus.includes(status))
      res.status(400).send("Invalid request");
    const isToUserExist = await User.findById({ _id: toUserId });
    if (!isToUserExist)
      return res.status(400).json({ message: "User not exist" });
    const isSent = await connectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { toUserId: fromUserId, fromUserId: toUserId },
      ], 
    });
    if (isSent)
      return res.status(400).send("Connection Request already exists!!!");
    const ConnectionRequest = new connectionRequest({
      fromUserId,
      toUserId,
      status,
    });
    await ConnectionRequest.save();
    res.send("Sent"); 
  } catch (err) {
    res.status(400).send("Error : ", err.message);
  }
});
requestRouter.post("/request/review/:status/:id",auth,async(req,res)=>{
  try{
    const loginUserId=req.user._id;
    const fromUserId=req.params.id;
    const status=req.params.status;
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status))
      res.status(400).send("Invalid request");
    const request=await connectionRequest.findOne({
      fromUserId,
      toUserId:loginUserId,
      status:"interested"
    });
    if(!request)
      return res.status(400).send("No such request found");
    request.status=status;
    const data = await request.save();
    res.json({message:"Request "+status+" successfully",data}); 
  }
  catch(err){
    res.status(400).send("Error : ", err.message);
  }
});
module.exports = requestRouter;
