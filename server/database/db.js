import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { 
             maxPoolSize: 10, // max 10 connections in the pool
         });;
        console.log('MongoDB Connected');
    } catch (error) {
        console.log("error occured", error); 
    }
}
export default connectDB;