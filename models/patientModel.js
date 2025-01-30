import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'patient'
    },
    profileImage: {
        type: String
    } // Add this field
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
