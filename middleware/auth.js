import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
    throw new Error('JWT_SECRET environment variable is not set');
}

const commonAuthMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.jwtName;
        
        if (!token) {
            return redirectToLogin(req, res);
        }

        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                console.error("JWT verification error:", err);
                // Clear invalid token
                res.clearCookie('jwtName');
                return redirectToLogin(req, res);
            }

            // Add user info to request
            req.user = {
                _id: decoded._id,
                role: decoded.role,
                iat: decoded.iat,
                exp: decoded.exp
            };

            // Check token expiration
            if (decoded.exp * 1000 < Date.now()) {
                res.clearCookie('jwtName');
                req.flash('error', 'Session expired. Please login again.');
                return redirectToLogin(req, res);
            }

            // Route-specific role validation
            if (req.path.startsWith('/book-appointment') && req.user.role !== 'patient') {
                req.flash('error', 'Patient login required to book appointments');
                return res.redirect('/patient/login');
            }

            // Role-based path validation
            if (
                (req.path.startsWith('/doctor') && req.user.role !== 'doctor') ||
                (req.path.startsWith('/admin') && req.user.role !== 'admin') ||
                (req.path.startsWith('/patient') && req.user.role !== 'patient')
            ) {
                req.flash('error', 'Unauthorized access');
                return redirectToLogin(req, res);
            }

            next();
        });
    } catch (error) {
        console.error("Authentication error:", error);
        req.flash('error', 'Authentication failed');
        res.redirect('/');
    }
};

// Helper function to redirect to appropriate login page
function redirectToLogin(req, res) {
    let loginPage = '/';
    if (req.path.startsWith('/doctor')) {
        loginPage = '/doctor/login';
    } else if (req.path.startsWith('/admin')) {
        loginPage = '/admin/login';
    } else if (req.path.startsWith('/patient')) {
        loginPage = '/patient/login';
    }
    
    req.flash('error', 'Please login to continue');
    return res.redirect(loginPage);
}

export default commonAuthMiddleware;