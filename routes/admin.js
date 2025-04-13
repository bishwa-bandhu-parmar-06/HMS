import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';

import Admin from '../models/adminModel.js';
import Notification from '../models/notificationModel.js';
import authenticate from '../middleware/auth.js';
import Patient from '../models/patientModel.js';
import Doctor from '../models/doctorModel.js';
import Hospital from '../models/hospitalModel.js';

const router = express.Router();
router.use(cookieParser());

const SECRETKEY = 'NOTESAPI';

// **Fix for __dirname in ES Modules**
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// **Function to create a notification**
async function createNotification(userId, message) {
    try {
        const notification = new Notification({ userId, message });
        await notification.save();
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

// **Ensure upload directory exists**
const uploadDir = path.join(__dirname, '../public/images/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// **Set up multer for file uploads**
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) =>
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({ storage });

// **Render admin signup form**
router.get('/admin-signup', (req, res) => {
    res.render('adminSignup', { csrfToken: req.csrfToken() });
});

// **Admin Registration**
router.post('/admin-signup', async (req, res) => {
    try {
        const { username, name, email, mobile, password, role } = req.body;

        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            req.flash('error', 'Admin with this username already exists.');
            return res.redirect('/admin/admin-signup');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new Admin({ username, password: hashedPassword, mobile, email, name, role, id: Date.now() });

        await admin.save();
        await createNotification(admin._id, 'A new admin has registered.');

        req.flash('success', 'Admin registered successfully!');
        res.redirect('/admin/admin-login');
    } catch (error) {
        console.error('Error registering admin:', error);
        req.flash('error', 'Internal Server Error');
        res.redirect('/admin/admin-signup');
    }
});

// **Render admin login form**
router.get('/admin-login', (req, res) => {
    res.render('adminLogin');
});

// **Handle admin login**
router.post('/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/admin/admin-login');
        }

        const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET || SECRETKEY, { expiresIn: '1h' });
        res.cookie('jwtName', token, { httpOnly: true });
        req.flash('success', 'Login successful!');
        res.redirect('/admin/admin-profile');
    } catch (error) {
        console.error('Error during admin login:', error);
        req.flash('error', 'Internal Server Error');
        res.redirect('/admin/admin-login');
    }
});

// **Render admin profile**
router.get('/admin-profile', authenticate, async (req, res) => {
    try {
        const adminId = req.user._id;
        const admin = await Admin.findById(adminId);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        const patients = await Patient.find();
        const doctors = await Doctor.find();
        const hospitals = await Hospital.find();
        const notifications = await Notification.find({ userId: adminId });

        res.render('adminProfile', { admin, notifications, patients, doctors, hospitals });
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// **Serve the edit details page**
router.get('/edit-details', authenticate, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user._id);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        res.render('AdminEditDetails', { admin });
    } catch (error) {
        console.error('Error serving edit details page:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// **Handle edit details form submission**
router.post('/edit-details', authenticate, upload.single('profileImage'), async (req, res) => {
    try {
        const { name, username, email, mobile } = req.body;
        const updatedFields = { name, username, email, mobile };

        if (req.file) updatedFields.profileImage = req.file.filename;

        await Admin.findByIdAndUpdate(req.user._id, updatedFields);

        res.json({ message: 'Admin details updated successfully.' });
    } catch (error) {
        console.error('Error updating admin details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// **Admin Logout**
router.post('/admin-logout', (req, res) => {
    res.cookie('jwtName', '', { expires: new Date(0), httpOnly: true });
    res.json({ message: 'Logout successful.' });
});

export default router;
