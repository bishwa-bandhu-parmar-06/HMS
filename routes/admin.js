const express = require('express');
const router = express.Router();
const Admin = require('../models/adminModel');
const Notification = require('../models/notificationModel'); // Import the Notification model
const bcrypt = require('bcrypt');
const flash = require("connect-flash");
const jwt = require("jsonwebtoken");
const SECRETKEY = "NOTESAPI";
const cookieParser = require("cookie-parser");
const authenticate = require("../middleware/auth");
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Patient = require("../models/patientModel");
const Doctor = require("../models/doctorModel");
const Hospital = require("../models/hospitalModel");
router.use(cookieParser());

// Function to create a notification
async function createNotification(userId, message) {
    try {
        const notification = new Notification({
            userId, // Ensure the field matches your schema
            message
        });
        await notification.save();
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/images/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Render admin signup form
router.get('/admin-signup', (req, res) => {
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    res.render('adminSignup', { successMessage, errorMessage });
});

// Admin Registration
router.post('/admin-signup', async (req, res) => {
    try {
        const { username, name, email, mobile, password, role} = req.body;

        // Check if the Admin with the provided Username already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            req.flash('error', 'Admin with this Username already exists.');
            return res.redirect('/admin/admin-signup');
        }

        const admin = new Admin({
            username,
            password: await bcrypt.hash(password, 10),
            mobile,
            email,
            name,
            role,
            id: Date.now(),
        });

        await admin.save();

        await createNotification(admin._id, 'A new admin has registered.');

        req.flash('success', 'Admin registered successfully.');
        res.redirect('/admin/admin-login');
    } catch (error) {
        console.error('Error registering admin:', error);
        req.flash('error', 'Error adding Admin');
        res.status(500).send('Internal Server Error');
    }
});

// Render admin login form
router.get('/admin-login', (req, res) => {
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    res.render('adminLogin', { successMessage, errorMessage });
});

// Handle admin login form submission
router.post('/admin/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const admin = await Admin.findOne({ username });

        if (admin) {
            const isPasswordValid = await bcrypt.compare(password, admin.password);

            if (isPasswordValid) {
                req.flash('success', 'Admin Login successfully.');
                const generateToken = jwt.sign({ _id: admin._id }, SECRETKEY);
                res.cookie("jwtName", generateToken, {
                    httpOnly: true
                });
                res.redirect('/admin/admin-profile');
            } else {
                req.flash('error', 'Invalid username or password');
                res.redirect("/admin-login");
            }
        } else {
            req.flash('error', 'Admin not found');
            res.redirect("/admin-login");
        }
    } catch (error) {
        console.error('Error during admin login:', error);
        req.flash('error', 'Invalid username or password');
        res.redirect("/admin-login");
    }
});

// Render admin profile
router.get('/admin-profile', authenticate, async (req, res) => {
    try {
        const adminId = req.user._id;

        const admin = await Admin.findById(adminId);
        const patient = await Patient.find(); // Assuming you have a User model to fetch registered users
        const doctor = await Doctor.find();
        const hospital = await Hospital.find();
        if (!admin) {
            return res.status(404).send('Admin not found');
        }

        const notifications = await Notification.find({ userId: adminId });

        res.render('adminProfile', { admin, notifications, patient, doctor, hospital });
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Serve the edit details page
router.get('/edit-details', authenticate, async (req, res) => {
    try {
        const token = req.cookies.jwtName;
        if (!token) {
            return res.redirect('/');
        }

        const decoded = jwt.verify(token, SECRETKEY);
        const admin = await Admin.findById(decoded._id);

        if (!admin) {
            return res.status(404).send('Admin not found');
        }

        res.render('AdminEditDetails', { admin });
    } catch (error) {
        console.error('Error serving edit details page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Handle edit details form submission
router.post('/edit-details', authenticate, upload.single('profileImage'), async (req, res) => {
    try {
        const token = req.cookies.jwtName;
        if (!token) {
            return res.redirect('/');
        }

        const decoded = jwt.verify(token, SECRETKEY);
        const {
            name,
            username,
            email,
            mobile,
        } = req.body;

        const updatedFields = {
            name,
            username,
            email,
            mobile,
        };

        if (req.file) {
            updatedFields.profileImage = req.file.filename;
        }

        await Admin.findByIdAndUpdate(decoded._id, updatedFields);

        res.redirect('/admin-profile');
    } catch (error) {
        console.error('Error updating admin details:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Admin Logout
router.post('/admin-logout', (req, res) => {
    res.cookie("jwtName", "", { expires: new Date(0), httpOnly: true });
    res.redirect('/'); // Redirect to the homepage or login page after logout
});

module.exports = router;
