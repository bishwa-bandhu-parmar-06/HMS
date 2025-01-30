import express from 'express';
import Contact from '../models/homeModel.js';
import flash from 'connect-flash';

const router = express.Router();

// Handle visitor messages
router.post('/visitors', async (req, res) => {
    try {
        const { name, email, message, phone } = req.body;

        const visitor = new Contact({
            name,
            email,
            message,
            phone,
        });

        await visitor.save();

        // req.flash('success', 'Message sent successfully!');
        // const successMessage = req.flash('success');
        // res.render('home', { successMessage });

        res.redirect('/');
    } catch (error) {
        console.error('Error saving visitor message:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
