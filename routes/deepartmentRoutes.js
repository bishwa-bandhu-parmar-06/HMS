const express = require("express");
const router = express.Router();

router.get('/orthopaedics', (req, res) => {
    // Render admin login page
    res.render('Deepartments/orthopaedics');
});

router.get('/JointReplacement', (req, res) => {
    // Render admin login page
    res.render('Deepartments/JointReplacement.ejs');
});

router.get('/Medicine', (req, res) => {
    // Render admin login page
    res.render('Deepartments/Medicine.ejs');
});
router.get('/Trauma', (req, res) => {
    // Render admin login page
    res.render('Deepartments/Trauma.ejs');
});
router.get('/Paediatics', (req, res) => {
    // Render admin login page
    res.render('Deepartments/Paediatics.ejs');
});
router.get('/Deratology', (req, res) => {
    // Render admin login page
    res.render('Deepartments/Deratology.ejs');
});
router.get('/Nephrology', (req, res) => {
    // Render admin login page
    res.render('Deepartments/Nephrology.ejs');
});
router.get('/Gastrology', (req, res) => {
    // Render admin login page
    res.render('Deepartments/Gastrology');
});
router.get('/Neurology', (req, res) => {
    // Render admin login page
    res.render('Deepartments/Neurology.ejs');
});
router.get('/PainManagement', (req, res) => {
    // Render admin login page
    res.render('Deepartments/PainManagement');
});
router.get('/BloodServices', (req, res) => {
    // Render admin login page
    res.render('Deepartments/BloodServices.ejs');
});
router.get('/Cardiology', (req, res) => {
    // Render admin login page
    res.render('Deepartments/Cardiology');
});
router.get('/Psychiatry', (req, res) => {
    // Render admin login page
    res.render('Deepartments/Psychiatry.ejs');
});
router.get('/IntensiceCare', (req, res) => {
    // Render admin login page
    res.render('Deepartments/IntensiceCare.ejs');
});
router.get('/Gynacology', (req, res) => {
    // Render admin login page
    res.render('Deepartments/Gynacology.ejs');
});
router.get('/IVF', (req, res) => {
    // Render admin login page
    res.render('Deepartments/IVF.ejs');
});
router.get('/Maternity', (req, res) => {
    // Render admin login page
    res.render('Deepartments/Maternity.ejs');
});
router.get('/GeneralSurgery', (req, res) => {
    // Render admin login page
    res.render('Deepartments/GeneralSurgery.ejs');
});
router.get('/ENT', (req, res) => {
    // Render admin login page
    res.render('Deepartments/ENT.ejs');
});
router.get('/CosmeticSurgery', (req, res) => {
    // Render admin login page
    res.render('Deepartments/CosmeticSurgery.ejs');
});
router.get('/Cuology', (req, res) => {
    // Render admin login page
    res.render('Deepartments/Cuology.ejs');
});
router.get('/NeuroSurgery', (req, res) => {
    // Render admin login page
    res.render('Deepartments/NeuroSurgery.ejs');
});
router.get('/OncoSurgery', (req, res) => {
    // Render admin login page
    res.render('Deepartments/OncoSurgery.ejs');
});
router.get('/Dietician', (req, res) => {
    // Render admin login page
    res.render('Deepartments/Dietician.ejs');
});
router.get('/PlasticSurgery', (req, res) => {
    // Render admin login page
    res.render('Deepartments/PlasticSurgery');
});
router.get('/Dialysis', (req, res) => {
    // Render admin login page
    res.render('Deepartments/Dialysis.ejs');
});
router.get('/GastroSurgery', (req, res) => {
    // Render admin login page
    res.render('Deepartments/GastroSurgery.ejs');
});

module.exports = router;