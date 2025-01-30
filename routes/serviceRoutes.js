const express = require("express");
const router = express.Router();

router.get('/bloodservices', (req, res) => {
    // Render admin login page
    res.render('Services/BloodServices');
});

router.get('/CaseManagementSystem', (req, res) => {
    // Render admin login page
    res.render('Services/CaseManagementSystem');
});
router.get('/emergencyRoom', (req, res) => {
    // Render admin login page
    res.render('Services/emergencyRoom');
});
router.get('/FamilySupport', (req, res) => {
    // Render admin login page
    res.render('Services/FamilySupport');
});
router.get('/FinancialServices', (req, res) => {
    // Render admin login page
    res.render('Services/FinancialServices');
});
router.get('/GeneralSurgical', (req, res) => {
    // Render admin login page
    res.render('Services/GeneralSurgical');
});
router.get('/GeneticTesting', (req, res) => {
    // Render admin login page
    res.render('Services/GeneticTesting');
});
router.get('/LaboratoryServices', (req, res) => {
    // Render admin login page
    res.render('Services/LaboratoryServices');
});
router.get('/MentalHealthCare', (req, res) => {
    // Render admin login page
    res.render('Services/MentalHealthCare');
});
router.get('/NationalCounselling', (req, res) => {
    // Render admin login page
    res.render('Services/NationalCounselling');
});
router.get('/NursingServices', (req, res) => {
    // Render admin login page
    res.render('Services/NursingServices');
});
router.get('/Pediatric', (req, res) => {
    // Render admin login page
    res.render('Services/Pediatric');
});
router.get('/Prescription', (req, res) => {
    // Render admin login page
    res.render('Services/Prescription');
});
router.get('/Rehabitations', (req, res) => {
    // Render admin login page
    res.render('Services/Rehabitations');
});
router.get('/shortTermHospitalisation', (req, res) => {
    // Render admin login page
    res.render('Services/shortTermHospitalisation');
});
router.get('/SocialWorkServices', (req, res) => {
    // Render admin login page
    res.render('Services/SocialWorkServices');
});
router.get('/SurgicalSpecialist', (req, res) => {
    // Render admin login page
    res.render('Services/SurgicalSpecialist');
});
router.get('/XRay', (req, res) => {
    // Render admin login page
    res.render('Services/XRay');
});


// New routes for the footer section


router.get('/consultOnline', (req, res) => {
    res.render('Services/ConsultOnline');
});


router.get('/bookHealthCheckup', (req, res) => {
    res.render('Services/BookHealthCheckup');
});

router.get('/findHospitals', (req, res) => {
    res.render('Services/FindHospitals');
});

router.get('/viewHealthRecord', (req, res) => {
    res.render('Services/ViewHealthRecord');
});

router.get('/BloodTest', (req, res) => {
    res.render('Services/BloodTest');
});

router.get('/urineTest', (req, res) => {
    res.render('Services/UrineTest');
});

router.get('/stoolTest', (req, res) => {
    res.render('Services/StoolTest');
});

// router.get('/xray', (req, res) => {
//     res.render('/XRay');
// });

router.get('/ctScan', (req, res) => {
    res.render('Services/CTScan');
});

router.get('/mri', (req, res) => {
    res.render('Services/MRI');
});

router.get('/ecg', (req, res) => {
    res.render('Services/ECG');
});


// New routes for bed categories

router.get('/generalbed', (req, res) => {
    res.render('Services/generalbed');
});
router.get('/semiprivatebed', (req, res) => {
    res.render('Services/semiprivatebed');
});
router.get('/privatebed', (req, res) => {
    res.render('Services/privatebed');
});
router.get('/icubed', (req, res) => {
    res.render('Services/icubed');
});
router.get('/otbed', (req, res) => {
    res.render('Services/otbed');
});



// New routes for other services
router.get('/ot', (req, res) => {
    res.render('Services/OT');
});

router.get('/ward', (req, res) => {
    res.render('Services/Ward');
});

router.get('/opd', (req, res) => {
    res.render('Services/OPD');
});

export default router;