const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctorModel');
const bcrypt = require('bcrypt'); // Import bcrypt library
const jwt = require("jsonwebtoken");
const SECRETKEY = "NOTESAPI";
const cookieParser = require("cookie-parser"); // Corrected the import statement
const authenticate = require("../middleware/auth");
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const flash = require('connect-flash');

router.use(cookieParser()); // Initialize cookie-parser middleware

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

// Middleware for flash messages
router.use(flash());

// Render doctor signup form
router.get('/doctor-signup', (req, res) => {
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    res.render('doctorSignup', { successMessage, errorMessage });
});

// Doctor Registration
router.post('/doctor/doctor-signup', async (req, res) => {
    try {
        // Check if the Doctor with the provided Username already exists
        const existingDoctor = await Doctor.findOne({ username: req.body.username });
        if (existingDoctor) {
            // If Doctor with the same Username exists, set an error flash message
            req.flash('error', 'Doctor with this Username already exists.');
            return res.redirect('/doctor/doctor-signup');
        }

        const doctor = new Doctor({
            username: req.body.username,
            speciality: req.body.speciality,
            password: await bcrypt.hash(req.body.password, 10),
            mobile: req.body.mobile,
            email: req.body.email,
            name: req.body.name,
            role: 'doctor',  // Set the default role here
        });

        await doctor.save();
        // req.flash('success', 'Doctor registered successfully.');
        res.redirect("/doctor-login");
    } catch (error) {
        console.error('Error registering doctor:', error);
        // req.flash('error', 'Email Already Exists');
        res.redirect('/doctor/doctor-signup');
    }
});

// Render doctor profile
router.get('/doctor-profile', authenticate, async (req, res) => {
    try {
        const doctorId = req.user._id;
        const doctor = await Doctor.findById(doctorId);

        if (doctor) {
            res.render('doctorProfile', { doctor });
        } else {
            res.status(404).send('Doctor not found');
        }
    } catch (error) {
        console.error('Error fetching doctor profile:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Render doctor login form
router.get('/doctor-login', (req, res) => {
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    res.render('doctorLogin', { successMessage, errorMessage });
});

// Handle doctor login
router.post('/doctor-login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const doctor = await Doctor.findOne({ username });
        if (doctor) {
            const isPasswordValid = await bcrypt.compare(password, doctor.password);
            // console.log(`Entered Password: ${password}`);
            // console.log(`Stored Hashed Password: ${doctor.password}`);
            if (isPasswordValid) {
                req.flash('success', 'Doctor Login successfully.');
                const generateToken = jwt.sign({ _id: doctor._id }, SECRETKEY);
                res.cookie("jwtName", generateToken, {
                    httpOnly: true
                });
                res.redirect('/doctor-profile');
            } else {
                req.flash('error', 'Invalid username or password');
                res.redirect("/doctor-login");
            }
        } else {
            req.flash('error', 'Doctor not found');
            res.redirect("/doctor-login");
        }
    } catch (error) {
        console.error('Error during doctor login:', error);
        req.flash('error', 'Invalid username or password');
        res.redirect("/doctor-login");
    }
});

// ###############################  DOCTOR DETAILS  #################################

router.get("/doctors/:id", async (req, res) => {
    try {
        const doctors = await Doctor.find(); // Fetch all doctors from the database
        const token = req.cookies.jwtName;
        res.render('doctorDetails', { doctors, token: token });
    } catch (error) {
        console.error('Error fetching doctors:', error);
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
        const doctor = await Doctor.findById(decoded._id);

        if (!doctor) {
            return res.status(404).send('Doctor not found');
        }

        res.render('DoctorEditDetails', { doctor });
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
            speciality,
            role
        } = req.body;

        const updatedFields = {
            name,
            username,
            email,
            mobile,
            speciality,
            role
        };

        if (req.file) {
            updatedFields.profileImage = req.file.filename;
        }

        await Doctor.findByIdAndUpdate(decoded._id, updatedFields);

        res.redirect('/doctor-profile');
    } catch (error) {
        console.error('Error updating doctor details:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Handle doctor logout
router.post('/doctor-logout', (req, res) => {
    res.cookie("jwtName", "", { expires: new Date(0), httpOnly: true });
    res.redirect('/'); // Redirect to the homepage or login page after logout
});

// Home route
router.get("/", (req, res) => {
    res.render("home");
});

module.exports = router;
