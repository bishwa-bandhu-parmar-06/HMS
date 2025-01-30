// Import Mongoose
import mongoose from 'mongoose';

// Define the schema for the contact form data
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: String,
    message: {
        type: String,
        required: true
    }
});

// Create the Mongoose model
const Contact = mongoose.model('Visitors', contactSchema);

// Export the model
export default Contact;

