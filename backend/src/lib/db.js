import mongoose from "mongoose"

export const connectToDb = async() => {
    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        console.log(`connection host is ${db.connection.host}`);
    } catch (error) {
        console.log(`Mongo error : ${error}`);
    }
}