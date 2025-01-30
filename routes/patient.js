const express = require('express');
const router = express.Router();
const Patient = require('../models/patientModel');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const SECRETKEY = "NOTESAPI";
const cookieParser = require("cookie-parser");
const authenticate = require("../middleware/auth");
const path = require('path');
const multer = require('multer');
const Notification = require('../models/notificationModel'); // Ensure the Notification model is imported
const bodyParser = require('body-parser');

// Middleware to parse request body
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));


router.use(cookieParser()); // Initialize cookie-parser middleware

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

// Render patient signup form
router.get('/patient-signup', (req, res) => {
    res.render('register');
});

router.post("/patient/patient-signup", async (req, res) => {
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    const mobilenumber = req.body.mobilenumber;
    const username = req.body.username;
    const email = req.body.email;

    console.log('Request body:', req.body);

    if (password !== cpassword) {
        req.flash("error", "Passwords do not match.");
        return res.redirect("/patient-signup");
    }

    try {
        console.log('Checking for existing patient with mobile number:', mobilenumber);
        const existingPatientByMobile = await Patient.findOne({ mobilenumber: mobilenumber });
        console.log('Checking for existing patient with username:', username);
        const existingPatientByUsername = await Patient.findOne({ username: username });
        console.log('Checking for existing patient with email:', email);
        const existingPatientByEmail = await Patient.findOne({ email: email });

        if (existingPatientByMobile) {
            console.log('Found existing patient by mobile:', existingPatientByMobile);
            req.flash('error', 'Patient with this mobile number already exists.');
            return res.redirect('/patient-signup'); // Redirect back to signup page
        }

        if (existingPatientByUsername) {
            console.log('Found existing patient by username:', existingPatientByUsername);
            req.flash('error', 'Patient with this username already exists.');
            return res.redirect('/patient-signup'); // Redirect back to signup page
        }

        if (existingPatientByEmail) {
            console.log('Found existing patient by email:', existingPatientByEmail);
            req.flash('error', 'Patient with this email already exists.');
            return res.redirect('/patient-signup'); // Redirect back to signup page
        }

        // Create new Patient instance
        const patientData = new Patient({
            username: username,
            name: req.body.name,
            password: password,
            mobilenumber: mobilenumber, // Ensure field name matches
            email: email,
            dob: req.body.dob,
            gender: req.body.gender,
            State: req.body.State,
            District: req.body.District,
            City: req.body.City,
            Pincode: req.body.Pincode,
            role: 'patient',
        });

        await patientData.save();

        // Redirect to patient login page after successful signup
        res.redirect('/patient/patient-login');
    } catch (error) {
        console.error('Error during patient signup:', error);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/patient-signup');
    }
});

// router.post('/patient-signup', async (req, res) => {
//     try {
//         console.log('Received signup request:', req.body); // Log the request body

//         const Password = req.body.password;
//         const Cpassword = req.body.cpassword;

//         // Check if passwords match
//         if (Password !== Cpassword) {
//             req.flash('error', 'Passwords do not match');
//             return res.redirect('/patient-signup'); // Redirect back to signup page
//        }

//         // Check if a patient with the same mobile number or username already exists
//         const existingPatientByMobile = await Patient.findOne({ mobilenumber: req.body.mobilenumber });
//         const existingPatientByUsername = await Patient.findOne({ username: req.body.username });
//         const existingPatientByEmail = await Patient.findOne({ email: req.body.email });

//         console.log('Existing patient by mobile:', existingPatientByMobile);
//         console.log('Existing patient by username:', existingPatientByUsername);

//         if (existingPatientByMobile) {
//             req.flash('error', 'Patient with this Mobile Number already exists.');
//             return res.redirect('/patient-signup'); // Redirect back to signup page
//         }

//         if (existingPatientByUsername) {
//             req.flash('error', 'Patient with this Username already exists.');
//             return res.redirect('/patient-signup'); // Redirect back to signup page
//         }

//         if (existingPatientByEmail) {
//             req.flash('error', 'Patient with this Email  already exists.');
//             return res.redirect('/patient-signup'); // Redirect back to signup page
//         }

//         // Create new Patient instance
//         const user = new Patient({
//             username: req.body.username,
//             name: req.body.name,
//             password: req.body.password,
//             mobilenumber: req.body.mobilenumber,
//             email: req.body.email,
//             dob: req.body.dob,
//             gender: req.body.gender,
//             State: req.body.State,
//             District: req.body.District,
//             City: req.body.City,
//             Pincode: req.body.Pincode,
//             role: 'patient',
//         });
        
//         // Save the new patient to the database
//         await user.save();

//         // Send notification to the admin
//         const io = req.app.get('socketio');
//         io.emit('new registration', user);

//         // Redirect to patient login page after successful signup
//         res.redirect('/patient/patient-login');
//     } catch (error) {
//         console.error('Error registering patient:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// Patient Registration
// router.post('/patient/patient-signup', async (req, res) => {
//     try {
//         const Password = req.body.password;
//         const Cpassword = req.body.cpassword;

//         // Check if passwords match
//         if (Password !== Cpassword) {
//             req.flash('error', 'Passwords do not match');
//             return res.redirect('/patient-signup'); // Redirect back to signup page
//         }

//         // Check if a patient with the same mobile number or username already exists
//         // const existingPatientByMobile = await Patient.findOne({ mobilenumber: req.body.mobilenumber });
//         const existingPatientByUsername = await Patient.findOne({ username: req.body.username });
//         const existingPatientByEmail = await Patient.findOne({ email: req.body.email });

//         // console.log('Existing patient by mobile:', existingPatientByMobile);
//         // console.log('Existing patient by username:', existingPatientByUsername);

//         // if (existingPatientByMobile) {
//         //     req.flash('error', 'Patient with this Mobile Number already exists.');
//         //     return res.redirect('/patient-signup'); // Redirect back to signup page
//         // }

//         if (existingPatientByUsername) {
//             req.flash('error', 'Patient with this Username already exists.');
//             return res.redirect('/patient-signup'); // Redirect back to signup page
//         }

//         if (existingPatientByEmail) {
//             req.flash('error', 'Patient with this Email  already exists.');
//             return res.redirect('/patient-signup'); // Redirect back to signup page
//         }
//         console.log(req.body);
//         const user = new Patient({
//             username: req.body.username,
//             password: await bcrypt.hash(req.body.password, 10),
//             // mobilenumber: req.body.mobilenumber,
//             email: req.body.email,
//             name: req.body.name,
//             dob: req.body.dob,
//             gender: req.body.gender,
//             State: req.body.State,
//             District: req.body.District,
//             City: req.body.City,
//             Pincode: req.body.Pincode,
//             role: 'patient',  // Set the default role here
//         });
//         console.log("Hello Users creating");
//         await user.save();
//         console.log("Hello Users Created");

//         // Send notification to the admin
//         const io = req.app.get('socketio');
//         io.emit('new registration', user);
//         console.log("Hello Notification Sent");


//         // req.flash('success', 'User registered successfully.');
//         res.redirect('/patient/patient-login');
//     } catch (error) {
//         console.error('Error registering patient:', error);
//         // req.flash('error', 'Error registering patient:');
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// });


// Render patient profile
router.get('/patient-profile', authenticate, async (req, res) => {
    try {
        // Get the patient ID from the authenticated user's token
        const patientId = req.user._id;

        // Query the database to find the patient by ID
        const patient = await Patient.findById(patientId);

        if (patient) {
            // Render the patient profile page with patient data
            res.render('patientProfile', { patient });
        } else {
            res.status(404).send('Patient not found');
        }
    } catch (error) {
        console.error('Error fetching patient profile:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Render patient login form
router.get('/patient-login', (req, res) => {
    res.render('login');
});

// Handle patient login form submission
// router.post('/patient-login', async (req, res) => {
//     try {
//         const { username, password } = req.body;

//         // Query the database to find a patient with the provided username
//         const patient = await Patient.findOne({ username });

//         // Check if a patient was found
//         if (patient) {
//             // Compare the hashed password strings
//             const match = await bcrypt.compare(password, patient.password);

//             console.log(`Entered Password: ${password}`);
//             console.log(`Stored Hashed Password: ${patient.password}`);

//             if (match) {
//                 // Login successful
//                 const generateToken = jwt.sign({ _id: patient._id }, SECRETKEY);

//                 res.cookie("jwtName", generateToken, {
//                     // expires: new Date(Date.now() + 60000), // Optional: Set expiration time for the cookie
//                     httpOnly: true
//                 });

//                 res.redirect('/patient/patient-profile');
//             } else {
//                 // Password is incorrect
//                 res.status(401).send('Invalid username or password');
//             }
//         } else {
//             // Patient not found
//             res.status(401).send('Invalid username or password');
//         }
//     } catch (error) {
//         console.error('Error during patient login:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });




// Serve the edit details page
router.get('/edit-details', async (req, res) => {
    try {
        const token = req.cookies.jwtName;
        if (!token) {
            return res.redirect('/');
        }

        const decoded = jwt.verify(token, SECRETKEY);
        const patient = await Patient.findById(decoded._id);

        if (!patient) {
            return res.status(404).send('Patient not found');
        }

        res.render('patientdetailsEdit', { patient });
    } catch (error) {
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
            mobilenumber,
            dob,
            gender,
            State,
            District,
            City,
            Pincode
        } = req.body;

        const updatedFields = {
            name,
            username,
            email,
            mobilenumber,
            dob,
            gender,
            State,
            District,
            City,
            Pincode
        };

        if (req.file) {
            updatedFields.profileImage = req.file.filename;
        }

        await Patient.findByIdAndUpdate(decoded._id, updatedFields);

        res.redirect('/patient/patient-profile');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// Handle patient logout
router.post('/patient-logout', (req, res) => {
    res.cookie("jwtName", "", { expires: new Date(0), httpOnly: true });
    res.redirect('/'); // Redirect to the homepage or login page after logout
});

module.exports = router;
