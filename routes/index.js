// routes/index.js

import express from'express';
const router = express.Router();
import Doctor from'../models/doctorModel.js';
import Patient from"../models/patientModel.js";
import Admin from"../models/adminModel.js";
// Home Page
router.get('/', async (req, res) => {
    try {
        const token = req.cookies.jwtName;
        const doctor = await Doctor.find();
        const patient = await Patient.find();
        const admin = await Admin.find();
        res.render('home', {
            token,
            doctor,
            patient,
            admin,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error loading home page:', error);
        res.status(500).render('error', { 
            error: { message: 'Error loading home page' },
            csrfToken: req.csrfToken()
        });
    }
});

router.get("/visitors",(req,res)=>{
    res.render("home", { csrfToken: req.csrfToken() });
})

router.get("/about", (req,res) =>{
    res.render("about", { csrfToken: req.csrfToken() });
});

router.get("/contact", (req,res)=>{
    res.render("contact", { csrfToken: req.csrfToken() });
})

router.get("/department", (req,res) =>{
    res.render("departments", { csrfToken: req.csrfToken() });
})

// Patient Routes
router.get('/patient-signup',async (req, res) => {
    try {
        const token = req.cookies.jwtName;
        const patient = await Patient.find();
        res.render('register', {
            token,
            patient,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error loading patient signup:', error);
        res.status(500).render('error', { 
            error: { message: 'Error loading patient signup' },
            csrfToken: req.csrfToken()
        });
    }
});

// hospital registeration Routes
router.get('/hospital-registeration', (req, res) => {
    res.render('register-hospital', { csrfToken: req.csrfToken() });
});

router.get('/patient-login', (req, res) => {
    res.render('login', { csrfToken: req.csrfToken() });
});

// Doctor Routes
router.get('/doctor-signup', (req, res) => {
    res.render('doctorSignup', { csrfToken: req.csrfToken() });
});

router.get('/doctor-login', (req, res) => {
    res.render('doctorLogin', { csrfToken: req.csrfToken() });
});

// Admin Routes
router.get('/admin-signup', (req, res) => {
    res.render('adminSignup', { csrfToken: req.csrfToken() });
});

router.get('/admin-login', (req, res) => {
    res.render('adminLogin', { csrfToken: req.csrfToken() });
});

router.get('/allDoctors', async (req, res) => {
    try {
        const doctors = await Doctor.find();
        const token = req.cookies.jwtName;
        res.render('allDoctors', { 
            doctors, 
            token,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).render('error', { 
            error: { message: 'Error loading doctors list' },
            csrfToken: req.csrfToken()
        });
    }
});

export default router;
