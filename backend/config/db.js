import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://salonisingh:Shubham62028@cluster0.nowwt.mongodb.net/food-del').then(()=>console.log("DB Connected"));
    
}