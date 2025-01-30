import mongoose from 'mongoose';

import passportLocalMongoose from 'passport-local-mongoose';

const doctorSchema = new mongoose.Schema({
    // Doctor-specific fields
    username: { 
        type: String, 
        unique: true, 
        required: true 
    },
      name: { 
        type: String, 
        required: true
    },
      email: {
        type: String,
        required: true,
        unique: true
      },
      mobile: {
        type: String,
        unique: true,
        required: true
      },
      password: { 
        type: String, 
        required: true
    },
    role: { 
      type: String,
      default: 'doctor'
    },
    speciality: {
      type: String,
      required: true,
    },
    profileImage: {
        type: String
    } // Add this field
});
// Add Passport-local-mongoose plugin to Doctor schema
doctorSchema.plugin(passportLocalMongoose);
doctorSchema.index({ name: 'text' });

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
