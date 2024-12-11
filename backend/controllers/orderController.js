import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// Placing User Order for Frontend
const placeOrder = async (req, res) => {
    const frontend_url = "http://localhost:5173"; 

    try {
        
        let totalAmount = 0;
        const items = req.body.items;

        
        items.forEach((item) => {
            totalAmount += item.price * item.quantity; 
        });

        
        const deliveryCharges = 40;
        totalAmount += deliveryCharges;

        // Create a new order in the database
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: totalAmount, 
            address: req.body.address,
        });

        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: totalAmount * 100, 
            currency: "INR",
            receipt: `order_${newOrder._id}`,
            payment_capture: 1, 
        });

        res.json({
            success: true,
            orderId: newOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: totalAmount,
            currency: "INR",
            key_id: process.env.RAZORPAY_KEY_ID, 
            callback_url: `${frontend_url}/verify?orderId=${newOrder._id}&success=true`, 
        });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ success: false, message: "Failed to place order." });
    }
};

// Verifying User Order after Payment
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.query; 
    try {
        if (!orderId || !success) {
            return res.status(400).json({ success: false, message: "Invalid request. Missing orderId or success parameter." });
        }

        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" });
        }
    } catch (error) {
        console.error("Error verifying order:", error);
        res.status(500).json({ success: false, message: "Error occurred during verification." });
    }
};

// user orders for frontend
const userOrders = async (req,res) => {
    try {
        const orders = await orderModel.find({userId:req.body.userId})
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// Listing orders for admin panel
const listOrders = async(req,res)=>{
    try {
        const orders = await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// api for updating order status
const updateStatus = async (req,res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
        res.json({success:true,message:"Status Updated"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export { placeOrder, verifyOrder , userOrders, listOrders, updateStatus};
