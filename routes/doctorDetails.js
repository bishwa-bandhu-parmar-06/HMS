import express  from 'express';
const router = express.Router();
import Doctor  from '../models/doctorModel.js';


// router.get('/:id', async (req, res) => {
//   try {
//     const doctor = await Doctor.findById(req.params.id);
//     if (!doctor) {
//       return res.render('error', { error: 'Doctor not found' });
//     }
//     res.render('doctorDetails', { doctor });
//   } catch (error) {
//     console.error('Error fetching doctor profile:', error);
//     res.status(500).render('error', { error: 'Internal Server Error' });
//   }
// });


router.get('/doctors/:id', async (req, res) => {
  try {
      const doctors = await Doctor.find();
      res.render('doctorDetails', { doctors, token: req.cookies.jwtName });
  } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).send('Internal Server Error');
  }
});
export default router;
