const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctorModel');

router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.render('error', { error: 'Doctor not found' });
    }
    res.render('doctorDetails', { doctor });
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).render('error', { error: 'Internal Server Error' });
  }
});

module.exports = router;
