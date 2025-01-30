// models/hospitalModel.js

import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  gstin: {
    type: String,
    required: true,
  },
  licenseNumber: {
    type: String,
    required: true,
  },
  certifiedProofDocument: {
    type: String,
    required: true,
  },
  hospitalName: {
    type: String,
    required: true,
  },
  address: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zip: {
      type: String,
      required: true,
    },
  },
  directors: {
    name: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    
  },
  email: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
});

hospitalSchema.index({ hospitalName: 'text' });
const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
