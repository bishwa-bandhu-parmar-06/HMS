const express = require('express');
const router = express.Router();
const Hospital = require('../models/hospitalModel');
const Admin = require('../models/adminModel');
const io = require('../app').io; // Import the initialized Socket.IO instance from app.js


// Hospital Registration - Render the hospital registration form
router.get('/hospital-registeration', (req, res) => {
    // Pass the flash messages to the view
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    res.render('register-hospital', { successMessage, errorMessage });
});

// Hospital Registration - Handle POST request
router.post('/hospital-registeration', async (req, res) => {
    try {
        // Data validation could be added here

        // Check if the hospital with the provided GSTIN already exists
        const existingHospital = await Hospital.findOne({ gstin: req.body.gstin });

        if (existingHospital) {
            // If hospital with the same GSTIN exists, set an error flash message
            req.flash('error', 'Hospital with this GSTIN already exists.');
            return res.redirect('/hospital/hospital-registeration');
        }

        const hospitalsData = new Hospital({
            gstin: req.body.gstin,
            licenseNumber: req.body.licenseNumber,
            certifiedProofDocument: req.body.certifiedProofDocument,
            hospitalName: req.body.hospitalName,
            address: {
                street: req.body.street,
                city: req.body.city,
                state: req.body.state,
                zip: req.body.zip
            },
            directors: {
                name: req.body.directorName,
                contactNumber: req.body.directorContact
            },
            email: req.body.email,
            contactNumber: req.body.contactNumber
            

        });

        // Save the hospital data to the database
        await hospitalsData.save();

        // Set a success flash message
        req.flash('success', 'Hospital registered successfully.');

        // Emit event for new hospital registration
        io.emit('newRegistration', { type: 'hospital', data: hospitalsData });


        // Redirect to the registration page with the flash message
        res.redirect('/hospital/hospital-registeration');
    } catch (err) {
        console.error('Error adding hospital:', err);
        // Set an error flash message
        req.flash('error', 'Error adding hospital');

        // Handle the error and redirect to the registration page
        res.redirect('/hospital/hospital-registeration');
    }
});




module.exports = router;
