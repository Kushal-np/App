import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI environment variable is not defined");
        }

        const connect = await mongoose.connect(uri);
        console.log(`MongoDB connected: ${connect.connection.host}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error("MongoDB connection error:", error.message);
        } else {
            console.error("Unknown error occurred during MongoDB connection");
        }
    }
};
