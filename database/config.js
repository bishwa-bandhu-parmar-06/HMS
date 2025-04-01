import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const dbURI = process.env.BACKEND_URI;
        if (!dbURI) throw new Error("❌ BACKEND_URI is not defined in environment variables.");

        mongoose.set("strictQuery", false); // Ensure compatibility with Mongoose 7+

        await mongoose.connect(dbURI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });

        console.log("✅ Connected to MongoDB");

        mongoose.connection.on("disconnected", () => {
            console.warn("⚠️ Disconnected from MongoDB");
        });

        mongoose.connection.on("error", (err) => {
            console.error("❌ MongoDB connection error:", err);
        });

        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            console.log("❌ MongoDB connection closed due to app termination");
            process.exit(0);
        });

    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1); // Exit process if DB connection fails
    }
};

export default connectDB;  // Export as a function instead of an object
