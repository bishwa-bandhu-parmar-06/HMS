
import express from'express';
const router = express.Router();
import Doctor from'../models/doctorModel.js';
import Appointment from'../models/appointformModel.js';
import ensureAuthenticated from'../middleware/auth.js';



router.get('/:id',ensureAuthenticated,async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.render('error', { error: 'Doctor not found' });
    }
    res.render('appointmentForm', { doctor, message: req.flash('success') });
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).render('error', { error: 'Internal Server Error' });
  }
});

router.post('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.render('error', { error: 'Doctor not found' });
    }

    // Process the form data and save the appointment
    const { patientName, illness, appointmentDate, appointmentTime } = req.body;
    const newAppointment = new Appointment({
      doctorId: doctor._id,
      patientName,
      illness,
      appointmentDate,
      appointmentTime,
    });
    await newAppointment.save();

    // Ensure notifications array exists in the doctor document
    if (!doctor.notifications) {
      doctor.notifications = [];
    }


    await doctor.save();

    req.flash('success', 'Appointment booked successfully!');
    res.redirect(`/patientAppointment/${doctor._id}`);
  } catch (error) {
    console.error('Error processing appointment:', error);
    res.status(500).render('error', { error: 'Internal Server Error' });
  }
});





export default router;
