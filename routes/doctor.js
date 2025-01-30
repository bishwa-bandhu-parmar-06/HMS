import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import flash from 'connect-flash';

import Doctor from '../models/doctorModel.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();
router.use(cookieParser());
router.use(flash());

const SECRETKEY = "NOTESAPI";

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/images/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) =>
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// Render doctor signup form
router.get('/doctor-signup', (req, res) => {
    res.render('doctorSignup', { successMessage: req.flash('success'), errorMessage: req.flash('error') });
});

// Doctor Registration
router.post('/doctor-signup', async (req, res) => {
    try {
        const { username, speciality, password, mobile, email, name } = req.body;
        
        if (await Doctor.findOne({ username })) {
            req.flash('error', 'Doctor with this Username already exists.');
            return res.redirect('/doctor-signup');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const doctor = new Doctor({ username, speciality, password: hashedPassword, mobile, email, name, role: 'doctor' });

        await doctor.save();
        req.flash('success', 'Doctor registered successfully.');
        res.redirect('/doctor-login');
    } catch (error) {
        console.error('Error registering doctor:', error);
        req.flash('error', 'Error registering doctor.');
        res.redirect('/doctor-signup');
    }
});

// Render doctor profile
router.get('/doctor-profile', authenticate, async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.user._id);
        if (!doctor) return res.status(404).send('Doctor not found');

        res.render('doctorProfile', { doctor });
    } catch (error) {
        console.error('Error fetching doctor profile:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Render doctor login form
router.get('/doctor-login', (req, res) => {
    res.render('doctorLogin', { successMessage: req.flash('success'), errorMessage: req.flash('error') });
});

// Handle doctor login
router.post('/doctor-login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const doctor = await Doctor.findOne({ username });

        if (!doctor || !(await bcrypt.compare(password, doctor.password))) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/doctor-login');
        }

        const token = jwt.sign({ _id: doctor._id }, SECRETKEY, { expiresIn: '1h' });
        res.cookie('jwtName', token, { httpOnly: true });
        req.flash('success', 'Doctor Login successful.');
        res.redirect('/doctor-profile');
    } catch (error) {
        console.error('Error during doctor login:', error);
        req.flash('error', 'Login failed');
        res.redirect('/doctor-login');
    }
});

// Get all doctors (doctor details page)
router.get('/doctors/:id', async (req, res) => {
    try {
        // Use req.params.id to fetch the specific doctor by ID
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).send('Doctor not found');
        }

        // Render doctorDetails page with the doctor data and the JWT token from cookies
        res.render('doctorDetails', { doctor, token: req.cookies.jwtName });
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Serve the edit details page
router.get('/edit-details', authenticate, async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.user._id);
        if (!doctor) return res.status(404).send('Doctor not found');
        
        res.render('DoctorEditDetails', { doctor });
    } catch (error) {
        console.error('Error serving edit details page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Handle edit details form submission
router.post('/edit-details', authenticate, upload.single('profileImage'), async (req, res) => {
    try {
        const { name, username, email, mobile, speciality, role } = req.body;
        const updatedFields = { name, username, email, mobile, speciality, role };
        if (req.file) updatedFields.profileImage = req.file.filename;
        
        await Doctor.findByIdAndUpdate(req.user._id, updatedFields);
        res.redirect('/doctor-profile');
    } catch (error) {
        console.error('Error updating doctor details:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Handle doctor logout
router.post('/doctor-logout', (req, res) => {
    res.cookie('jwtName', '', { expires: new Date(0), httpOnly: true });
    res.redirect('/');
});

// Home route
router.get('/', (req, res) => {
    res.render('home');
});

export default router;