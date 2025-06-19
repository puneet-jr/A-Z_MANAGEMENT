import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

const dbconnect= async()=>{
    try{
        const connect= await mongoose.connect(process.env.CONNECTION_STRING);
        console.log(`MongoDB connected: ${connect.connection.host}, ${connect.connection.port}`);
    } catch(error)
    
    {
        console.log(error);
    }
};


export default dbconnect;
