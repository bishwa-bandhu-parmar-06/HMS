import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Convert ES module path to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import database config
import dbConfig from './database/config.js';

// Import models
import Patient from './models/patientModel.js';
import Doctor from './models/doctorModel.js';
import Hospitals from './models/hospitalModel.js';
import Admin from './models/adminModel.js';
import Visitors from './models/homeModel.js';

// Import routes
import doctorDetails from './routes/doctorDetails.js';
import patientAppointmentRoute from './routes/appointmentForm.js';
import indexRouter from './routes/index.js';
import patientRoutes from './routes/patient.js';
import adminRoutes from './routes/admin.js';
import doctorRoutes from './routes/doctor.js';
import hospitalRoutes from './routes/hospital.js';
import homeroutes from './routes/homeForm.js';
import deepartmentRoutes from './routes/deepartmentRoutes.js';
import ServicesRoutes from './routes/serviceRoutes.js';

// Initialize app and server
const app = express();
const server = createServer(app);
const io = new Server(server);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Connect to database
dbConfig.connect();

// Set up static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your-secret-key', // Use env variable for security
        resave: true,
        saveUninitialized: true,
    })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Flash messages middleware
app.use(flash());
app.use((req, res, next) => {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
});

// Routes
app.use('/', indexRouter);
app.use('/patient', patientRoutes);
app.use('/admin', adminRoutes);
app.use('/doctor', doctorRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/visitors', homeroutes);
app.use('/deepartments', deepartmentRoutes);
app.use('/services', ServicesRoutes);
app.use('/patientAppointment', patientAppointmentRoute);
app.use('/uploads', express.static(path.join(__dirname, 'public', 'images', 'uploads')));

// Socket.IO setup
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.set('socketio', io);

// Search route
app.get('/search', async (req, res) => {
    const query = req.query.q;

    if (!query || query.trim() === '') {
        return res.render('error', { error: 'Please enter a valid search query.' });
    }

    try {
        const patients = await Patient.find({ $text: { $search: query } });
        const doctors = await Doctor.find({ $text: { $search: query } });
        const hospitals = await Hospitals.find({ $text: { $search: query } }).select('name');
        const admin = await Admin.find({ $text: { $search: query } });

        res.render('searchResults', { patients, doctors, hospitals, admin, query, suggestions: { hospitals } });
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).render('error', { error: 'Internal Server Error' });
    }
});

// Suggest route
app.get('/suggest', async (req, res) => {
    const query = req.query.q;

    if (!query || query.trim() === '') {
        return res.json([]);
    }

    try {
        const doctors = await Doctor.find({ name: { $regex: `^${query}`, $options: 'i' } }).limit(5);
        const patients = await Patient.find({ name: { $regex: `^${query}`, $options: 'i' } }).limit(5);
        const hospitals = await Hospitals.find({ name: { $regex: `^${query}`, $options: 'i' } }).limit(5);
        const admin = await Admin.find({ name: { $regex: `^${query}`, $options: 'i' } }).limit(5);

        res.json([...doctors, ...patients, ...hospitals, ...admin]);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Handle invalid routes
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// Error handling middleware
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        error: { message: error.message },
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
