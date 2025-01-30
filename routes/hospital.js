import express from 'express';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';
import Hospital from '../models/hospitalModel.js';
import Admin from '../models/adminModel.js';

const router = express.Router();

// Hospital Registration - Render the hospital registration form
router.get('/hospital-registeration', (req, res) => {
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    res.render('register-hospital', { successMessage, errorMessage });
});

// Hospital Registration - Handle POST request
router.post('/hospital-registeration', async (req, res) => {
    try {
        const { gstin, licenseNumber, certifiedProofDocument, hospitalName, street, city, state, zip, directorName, directorContact, email, contactNumber } = req.body;

        // Check if the hospital with the provided GSTIN already exists
        const existingHospital = await Hospital.findOne({ gstin });

        if (existingHospital) {
            req.flash('error', 'Hospital with this GSTIN already exists.');
            return res.redirect('/hospital/hospital-registeration');
        }

        const hospitalData = new Hospital({
            gstin,
            licenseNumber,
            certifiedProofDocument,
            hospitalName,
            address: { street, city, state, zip },
            directors: { name: directorName, contactNumber: directorContact },
            email,
            contactNumber
        });

        await hospitalData.save();

        req.flash('success', 'Hospital registered successfully.');

        // Emit event for new hospital registration
        io.emit('newRegistration', { type: 'hospital', data: hospitalData });

        res.redirect('/hospital/hospital-registeration');
    } catch (err) {
        console.error('Error adding hospital:', err);
        req.flash('error', 'Error adding hospital');
        res.redirect('/hospital/hospital-registeration');
    }
});

export default router;
