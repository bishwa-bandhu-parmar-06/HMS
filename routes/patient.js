import express from 'express';
const router = express.Router();
import Patient from '../models/patientModel.js';
import upload from'../middleware/upload.js'; // Import the upload middleware

import bcrypt from 'bcrypt';
import cookieParser from "cookie-parser";


router.use(cookieParser()); // Initialize cookie-parser middleware




// #########################################  PATIENT REGISTRATION   ###################################
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
        console.log('Patient registered successfully:');
        return res.redirect('/patient-login');
        
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred. Please try again.');
        return res.redirect('/patient-signup');
    }
});


// #########################################  PATIENT DASHBOARD   ###################################

router.get('/patient-dashboard', async (req, res) => {
    if (!req.session.patientId) {
        req.flash('error', 'Please login to access the dashboard.');
        return res.redirect('/patient/patient-login');
    }

    try {
        // Fetch the patient's data from the database
        const patient = await Patient.findById(req.session.patientId);

        if (!patient) {
            req.flash('error', 'Patient not found.');
            return res.redirect('/patient/patient-login');
        }

        // Render the patientProfile.ejs template and pass the patient data
        res.render('patientProfile', { patient });
    } catch (error) {
        console.error('Error fetching patient data:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/patient/patient-login');
    }
});


// #########################################  PATIENT LOGIN   ###################################


router.get('/patient-login', (req, res) => {
    res.render('login'); // Ensure you have a `patientLogin.ejs` file in your views folder
});
// Login route for patients
router.post("/patient-login", async (req, res) => {
    const { email, password } = req.body;

    console.log('Request body:', req.body);

    try {
        // Check if the patient exists by email
        const existingPatient = await Patient.findOne({ email });

        if (!existingPatient) {
            console.log('No patient found with this email:', email);
            req.flash('error', 'No patient found with this email.');
            return res.redirect('/patient-login'); // Redirect back to login page
        }

        // Compare the entered password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, existingPatient.password);

        if (!isMatch) {
            console.log('Incorrect password for email:', email);
            req.flash('error', 'Incorrect password. Please try again.');
            return res.redirect('/patient-login'); // Redirect back to login page
        }

        // If login is successful, you can save the user session or send a success response
        req.session.patientId = existingPatient._id; // Store the patient ID in the session
        req.flash('success', 'Login successful!');
        return res.redirect('/patient/patient-dashboard'); // Redirect to the patient's dashboard or home page

    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred. Please try again.');
        return res.redirect('/patient-login'); // Redirect back to login page
    }
});



// #########################################  PATIENT EDIT DETAILS   ###################################

router.get('/edit-details', async (req, res) => {
    if (!req.session.patientId) {
        req.flash('error', 'Please login to edit your details.');
        return res.redirect('/patient/patient-login');
    }

    try {
        const patient = await Patient.findById(req.session.patientId);
        res.render('patientdetailsEdit', { patient });
    } catch (error) {
        console.error('Error fetching patient data:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/patient/patient-dashboard');
    }
});




router.post('/edit-details', upload.single('profileImage'), async (req, res) => {
    if (!req.session.patientId) {
        req.flash('error', 'Please login to edit your details.');
        return res.redirect('/patient/patient-login');
    }
    // D:\Web\HMS\public\images\uploads\profileImage-1738234140699-372609464.jpg
    const { name, email } = req.body;
    const profileImage = req.file ? `${req.file.filename}` : null; // Get the file path if uploaded
    try {
        // Fetch the patient's data from the database
        const patient = await Patient.findById(req.session.patientId);

        if (!patient) {
            req.flash('error', 'Patient not found.');
            return res.redirect('/patient/patient-dashboard');
        }

        // Update the patient's details
        patient.name = name;
        patient.email = email;
        if (profileImage) {
            patient.profileImage = profileImage; // Update profile image only if a new file is uploaded
        }

        // Save the updated patient data
        await patient.save();

        req.flash('success', 'Your details have been updated successfully.');
        res.redirect('/patient/patient-dashboard');
    } catch (error) {
        console.error('Error updating patient details:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/patient/edit-details');
    }
});


export default router;
