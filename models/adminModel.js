import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const adminSchema = new mongoose.Schema({
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
        default: 'admin'
    },
    profileImage: {
        type: String
    },
    id: {
        type: Number,
        required: true,
        unique: true
    }
});

// Indexing for text search on the "name" field
adminSchema.index({ name: "text" });

adminSchema.methods.generateToken = async function(){
    try {
        return jwt.sign(
            {
                userId: this._id.toString(),
                email: this.email,
                role: this.role
            },
            process.env.SECRET_KEY,
            {
                expiresIn: "30s"
            }
        );
    } catch (error) {
        console.error("JWT Error:", error);
        return null;
    }
}

const Admin = mongoose.model('Admin', adminSchema);

// Correct export for CommonJS
export default Admin;
