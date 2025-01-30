import express from 'express';
const router = express.Router();
import Patient from '../models/patientModel.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import authenticate from "../middleware/auth.js";
import path from 'path';
import multer from 'multer';
import Notification from '../models/notificationModel.js';
import bodyParser from 'body-parser';

// Middleware to parse request body
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

router.use(cookieParser()); // Initialize cookie-parser middleware

// Render patient signup form
router.get('/patient-signup', (req, res) => {
    res.render('register');
});

router.post("/patient-signup", async (req, res) => {
    const { name, email, password } = req.body;

    console.log('Request body:', req.body);

    try {
        // Check for existing patient by email
        const existingPatient = await Patient.findOne({ email });

        if (existingPatient) {
            console.log('Found existing patient by email:', existingPatient);
            req.flash('error', 'Patient with this email already exists.');
            return res.redirect('/patient-signup'); // Redirect back to signup page
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new Patient instance
        const patientData = new Patient({
            name,
            email,
            password: hashedPassword,
            role: 'patient',
        });

        await patientData.save();

        // Redirect to patient login page after successful registration
        req.flash('success', 'Registration successful! Please login.');
        return res.redirect('/patient/patient-login');
        
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred. Please try again.');
        return res.redirect('/patient-signup');
    }
});

export default router;
