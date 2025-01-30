import mongoose from 'mongoose';

const connect = async () => {
    try {
        const dbURI = process.env.BACKEND_URI;

        // Connect to MongoDB with updated options
        await mongoose.connect(dbURI, {
        });
        console.log('✅ Connected to MongoDB');

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ Disconnected from MongoDB');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('❌ MongoDB connection closed due to app termination');
            process.exit(0);
        });

    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1); // Exit process if DB connection fails
    }
};

export default { connect };
