import userModel from "../models/userModel.js"

// add items to user cart
const addToCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartData || {};
        if(!cartData[req.body.itemId]){
            cartData[req.body.itemId] = 1;
        }
        else{
            cartData[req.body.itemId] += 1;
        }
        const updatedUser = await userModel.findByIdAndUpdate(
            req.body.userId,{cartData},
            { new: true, useFindAndModify: false }
        );

        if (!updatedUser) {
            return res.json({ success: false, message: "Failed to update cart" });
        }

        res.json({success:true,message:"Added to Cart"});
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}


// remove items from user cart
const removeFromCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = userData.cartData || {};
        if (cartData[req.body.itemId]>0) {
            cartData[req.body.itemId] -= 1;
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            req.body.userId,
            {cartData},
            { new: true, useFindAndModify: false }
        );

        res.json({success:true,message:"Removed From Cart"})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// fetch user cart data
const getCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = userData.cartData || {};
        res.json({success:true,cartData})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"});
    }
}

export {addToCart, removeFromCart, getCart};