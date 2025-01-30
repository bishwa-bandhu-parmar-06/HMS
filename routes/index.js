// routes/index.js

const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctorModel');
const Patient = require("../models/patientModel");
const Admin = require("../models/adminModel");
// Home Page
router.get('/', async (req, res) => {
    // Render your home page
    const token = req.cookies.jwtName;
    const doctor = await Doctor.find();
    const patient = await Patient.find();
    const admin = await Admin.find();
    res.render('home', {token: token, doctor,patient,admin});
});

router.get("/visitors",(req,res)=>{
    res.render("home")
})

router.get("/about", (req,res) =>{
    res.render("about")
});

router.get("/contact", (req,res)=>{
    res.render("contact")
})

router.get("/department", (req,res) =>{
    res.render("departments")
})

// Patient Routes
router.get('/patient-signup',async (req, res) => {
    // Render patient signup page
    const token = req.cookies.jwtName;
    const patient = await Patient.find();
    res.render('register', {token: token, patient});
    // res.render('register');
});

// hospital registeration Routes
router.get('/hospital-registeration', (req, res) => {
    // Render patient signup page
    res.render('register-hospital');
});

router.get('/patient-login', (req, res) => {
    // Render patient login page
    res.render('login');
});

// Doctor Routes
router.get('/doctor-signup', (req, res) => {
    // Render doctor signup page
    res.render('doctorSignup');
});

router.get('/doctor-login', (req, res) => {
    // Render doctor login page
    res.render('doctorLogin');
});

// Admin Routes
router.get('/admin-signup', (req, res) => {
    // Render admin signup page
    res.render('adminSignup');
});

router.get('/admin-login', (req, res) => {
    // Render admin login page
    res.render('adminLogin');
});




router.get('/allDoctors', async (req, res) => {
    try {
        const doctors = await Doctor.find(); // Fetch all doctors from the database
        const token = req.cookies.jwtName;
        res.render('allDoctors', { doctors, token: token });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
