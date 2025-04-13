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
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
    throw new Error('JWT_SECRET environment variable is not set');
}

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/images/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration with improved security
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only allow 1 file
    },
    fileFilter: (req, file, cb) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG, PNG and GIF files are allowed!'), false);
        }
        
        // Validate file extension
        const ext = path.extname(file.originalname).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
            return cb(new Error('Invalid file extension!'), false);
        }
        
        cb(null, true);
    }
});

// ========== ROUTE DEFINITIONS ========== //

// Render doctor signup form
router.get('/signup', (req, res) => {
    res.render('doctorSignup', { 
        successMessage: req.flash('success'), 
        errorMessage: req.flash('error'),
        csrfToken: req.csrfToken()
    });
});

// Doctor Registration
router.post('/signup', async (req, res) => {
    try {
        const { username, speciality, password, mobile, email, name } = req.body;
        
        // Input validation
        if (!username || !password || !email) {
            req.flash('error', 'Username, password and email are required');
            return res.redirect('/doctor/signup');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            req.flash('error', 'Invalid email format');
            return res.redirect('/doctor/signup');
        }

        // Password validation
        if (password.length < 8) {
            req.flash('error', 'Password must be at least 8 characters long');
            return res.redirect('/doctor/signup');
        }

        const existingDoctor = await Doctor.findOne({ $or: [{ username }, { email }] });
        if (existingDoctor) {
            req.flash('error', 'Username or email already exists');
            return res.redirect('/doctor/signup');
        }

        const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds
        const doctor = new Doctor({ 
            username, 
            speciality, 
            password: hashedPassword, 
            mobile, 
            email, 
            name, 
            role: 'doctor' 
        });

        await doctor.save();
        req.flash('success', 'Doctor registered successfully');
        res.redirect('/doctor/login');
    } catch (error) {
        console.error('Error registering doctor:', error);
        req.flash('error', 'Error registering doctor');
        res.redirect('/doctor/signup');
    }
});

// Render doctor login form
router.get('/login', (req, res) => {
    res.render('doctorLogin', {
        errorMessage: req.flash('error'),
        successMessage: req.flash('success'),
        csrfToken: req.csrfToken()
    });
});

// Handle doctor login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const doctor = await Doctor.findOne({ username });
        if (!doctor) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/doctor/login');
        }

        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/doctor/login');
        }

        const token = jwt.sign(
            { _id: doctor._id, role: doctor.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );
        
        res.cookie('jwtName', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600000,
            path: '/'
        });
        
        return res.redirect('/doctor/profile');
        
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'Login failed');
        return res.redirect('/doctor/login');
    }
});

// Render doctor profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.user._id).select('-password');
        if (!doctor) {
            req.flash('error', 'Doctor not found');
            return res.redirect('/doctor/login');
        }
        
        res.render('doctorProfile', { 
            doctor,
            successMessage: req.flash('success'),
            errorMessage: req.flash('error'),
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Profile error:', error);
        req.flash('error', 'Error loading profile');
        res.redirect('/doctor/login');
    }
});

// Handle doctor logout
router.post('/logout', (req, res) => {
    res.clearCookie('jwtName');
    req.flash('success', 'Logged out successfully');
    res.redirect('/doctor/login');
});

// Render edit details page
router.get('/edit', authenticate, async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.user._id).select('-password');
        if (!doctor) {
            req.flash('error', 'Doctor not found');
            return res.redirect('/doctor/profile');
        }
        res.render('DoctorEditDetails', { 
            doctor,
            errorMessage: req.flash('error'),
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error serving edit details page:', error);
        req.flash('error', 'Error loading edit page');
        res.redirect('/doctor/profile');
    }
});

// Handle edit details form submission
router.post('/edit', authenticate, upload.single('profileImage'), async (req, res) => {
    try {
        const { name, username, email, mobile, speciality } = req.body;
        
        // Input validation
        if (!name || !username || !email) {
            req.flash('error', 'Name, username and email are required');
            return res.redirect('/doctor/edit');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            req.flash('error', 'Invalid email format');
            return res.redirect('/doctor/edit');
        }

        const existingDoctor = await Doctor.findOne({
            $and: [
                { $or: [{ username }, { email }] },
                { _id: { $ne: req.user._id } }
            ]
        });

        if (existingDoctor) {
            req.flash('error', 'Username or email already in use');
            return res.redirect('/doctor/edit');
        }

        const updatedFields = { name, username, email, mobile, speciality };
        
        if (req.file) {
            const doctor = await Doctor.findById(req.user._id);
            if (doctor.profileImage) {
                const oldImagePath = path.join(uploadDir, doctor.profileImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updatedFields.profileImage = req.file.filename;
        }
        
        await Doctor.findByIdAndUpdate(req.user._id, updatedFields);
        req.flash('success', 'Profile updated successfully');
        res.redirect('/doctor/profile');
    } catch (error) {
        console.error('Error updating doctor details:', error);
        req.flash('error', 'Error updating profile');
        res.redirect('/doctor/edit');
    }
});

export default router;