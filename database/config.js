const mongoose = require('mongoose');

const connect = async () => {
    try {
        const dbURI = process.env.BACKEND_URI || 'mongodb://127.0.0.1:27017/mydatabase'; // Fallback URI

        await mongoose.connect(dbURI, {
            useNewUrlParser: true,  // No longer needed in Mongoose 6+
            useUnifiedTopology: true, // No longer needed in Mongoose 6+
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

module.exports = { connect };
