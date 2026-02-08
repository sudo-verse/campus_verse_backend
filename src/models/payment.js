const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String
    },
    signature: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["created", "earned", "captured", "failed"],
        default: "created"
    },
    membershipType: {
        type: String, // "silver", "gold"
        required: true
    },
    membershipStatus: {
        type: String, // "pending", "active", "expired"
        default: "pending"
    },
    receipt: {
        type: String
    },
    notes: {
        type: Object
    },


    createdAt: {
        type: Date,
        default: Date.now

    }
});
const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;