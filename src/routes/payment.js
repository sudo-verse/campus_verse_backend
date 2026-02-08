const express = require("express");
const auth = require("../middlewares/auth");
const instance = require("../utils/razorpay");
const paymentRouter = express.Router();
const Payment = require("../models/payment");
const User = require("../models/user");
const { membershipAmounts } = require("../utils/constants");
const { validateWebhookSignature } = require("razorpay/dist/utils/razorpay-utils");

paymentRouter.post("/payment/create", auth, async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ msg: "Invalid request body. Please ensure 'Content-Type' is set to 'application/json'." });
    }

    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    const amount = membershipAmounts[membershipType];

    if (!amount) {
      return res.status(400).json({ msg: "Invalid membership type" });
    }

    const order = await instance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType,
      },
    });

    // Save it in my database
    // console.log(order);

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
      membershipType: membershipType,
    });

    const savedPayment = await payment.save();

    // Return back my order details to frontend
    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});
paymentRouter.post("/payment/webhooks", async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const requestBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);
    const isWebhookValid = validateWebhookSignature(requestBody, webhookSignature, process.env.RAZORPAY_WEBHOOK_SECRET)
    if (!isWebhookValid) {
      return res.status(400).json({ msg: "Invalid webhook signature" })

    }
    const paymentDetail = req.body.payload.payment.entity;
    const payment = await Payment.findOne({ orderId: paymentDetail.order_id })

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    payment.status = paymentDetail.status
    await payment.save()

    const user = await User.findById(payment.userId)
    if (user) {
      user.membershipType = payment.notes.membershipType
      user.membershipStatus = "active"
      await user.save()
    }
    res.json({ msg: "Webhook received successfully" })
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
});


module.exports = paymentRouter;
