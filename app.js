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
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';

// Convert ES module path to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import database config
import connectDB from './database/config.js';

// Import routes
import patientAppointmentRoute from './routes/appointmentForm.js';
import indexRouter from './routes/index.js';
import patientRoutes from './routes/patient.js';
import adminRoutes from './routes/admin.js';
import doctorRoutes from './routes/doctor.js';
import hospitalRoutes from './routes/hospital.js';
import homeroutes from './routes/homeForm.js';
import deepartmentRoutes from './routes/deepartmentRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';

// Initialize app and server
const app = express();
const server = createServer(app);
const io = new Server(server);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "blob:", "cdnjs.cloudflare.com"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "cdnjs.cloudflare.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin']
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Connect to database
connectDB();

// Set up static file serving
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/stylesheets', express.static(path.join(__dirname, 'public/stylesheets')));

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session middleware with secure settings
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        },
        name: 'sessionId' // Don't use default connect.sid
    })
);

// CSRF protection
app.use(csrf({ cookie: true }));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Flash messages middleware
app.use(flash());
app.use((req, res, next) => {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Routes with consistent naming
app.use('/', indexRouter);
app.use('/patient', patientRoutes);
app.use('/admin', adminRoutes);
app.use('/doctor', doctorRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/visitors', homeroutes);
app.use('/departments', deepartmentRoutes); // Fixed typo in route name
app.use('/services', serviceRoutes);
app.use('/appointments', patientAppointmentRoute); // More RESTful naming

// Socket.IO setup with error handling
io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.set('socketio', io);

// Handle invalid routes
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// Improved Error Handling
app.use((error, req, res, next) => {
    console.error('Error:', error);
    
    res.status(error.status || 500);

    if (req.accepts('html')) {
        res.render('error', { 
            error,
            message: error.message || 'Internal Server Error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            csrfToken: req.csrfToken()
        });
    } else {
        res.json({ 
            error: { 
                message: error.message || 'Internal Server Error',
                status: error.status || 500
            } 
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
