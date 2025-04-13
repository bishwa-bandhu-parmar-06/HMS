import express from 'express';
const router = express.Router();
import Doctor from '../models/doctorModel.js';

router.get('/:id', async (req, res) => {
  try {
    // First check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    const doctor = await Doctor.findById(req.params.id).exec();
    
    if (!doctor) {
      return res.status(404).render('error', { 
        error: 'Doctor not found' 
      });
    }

    res.render('doctorDetails', { 
      doctor, // Note: singular 'doctor' not 'doctors'
      token: req.cookies.jwtName 
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).render('error', { 
      error: error.message || 'Internal Server Error' 
    });
  }
});

export default router;