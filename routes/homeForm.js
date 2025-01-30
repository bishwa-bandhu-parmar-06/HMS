const express = require('express');
const router = express.Router();
const Contact = require('../models/homeModel');
const flash = require("connect-flash")
// router.get("/visitors",(req,res)=>{
//     res.render("home")
// });

router.post('/visitors', async (req, res) => {
    try {
        const visitors = new Contact({
            name: req.body.name,
            email: req.body.email,
            message: req.body.message,
            phone: req.body.phone,
            // name: req.body.name,
            // role: 'patient',  // Set the default role here
        });

        await visitors.save();
        // const successMessage = req.flash('success');
        // req.flash('success', 'Message  Send successfully!');

        // res.render('home', {successMessage});
        res.redirect("/")

        // res.status(201).send('message registered successfully');
    } catch (error) {
        // console.error('Error registering patient:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
