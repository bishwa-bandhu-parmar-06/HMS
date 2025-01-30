

// // commonAuthMiddleware.js
// const jwt = require("jsonwebtoken");

// const SECRETKEY = "NOTESAPI";

// const commonAuthMiddleware = (req, res, next) => {
//     try {
//         const token = req.cookies.jwtName;
//         if (!token) {
//             // Redirect to appropriate login page based on role
//             if (req.path.startsWith('/doctor')) {
//                 return res.redirect('/doctor-login');
//             } else if (req.path.startsWith('/admin')) {
//                 return res.redirect('/admin-login');
//             } else if (req.path.startsWith('/patient')) {
//                 return res.redirect('/patient-login');
//             } else {
//                 // Redirect to a generic login page or handle as needed
//                 return res.redirect('/'); // Redirect to home page or handle as needed
//             }
//         }

//         jwt.verify(token, SECRETKEY, (err, decoded) => {
//             if (err) {
//                 // If token verification fails, redirect to login page based on role
//                 if (req.path.startsWith('/doctor')) {
//                     return res.redirect('/doctor-login');
//                 } else if (req.path.startsWith('/admin')) {
//                     return res.redirect('/admin-login');
//                 } else if (req.path.startsWith('/patient')) {
//                     return res.redirect('/patient-login');
//                 } else {
//                     // Redirect to a generic login page or handle as needed
//                     return res.redirect('/'); // Redirect to home page or handle as needed
//                 }
//             }
//             req.user = decoded;

//             if (req.path.startsWith('/book-appointment') && req.user.role !== 'patient') {
//                 return res.redirect('/patient-login');
//             }
//             next();
//         });
//     } catch (error) {
//         console.error("Authentication error:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

// module.exports = commonAuthMiddleware;


const jwt = require("jsonwebtoken");

const SECRET_KEY = "NOTESAPI";

const commonAuthMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.jwtName;
        if (!token) {
            // Redirect to patient login page if trying to access book appointment without authentication
            if (req.path.startsWith('/book-appointment')) {
                return res.redirect('/patient-login');
            }
            // Redirect to appropriate login page based on role
            let loginPage = '/';
            if (req.path.startsWith('/doctor')) {
                loginPage = '/doctor-login';
            } else if (req.path.startsWith('/admin')) {
                loginPage = '/admin-login';
            } else if (req.path.startsWith('/patient')) {
                loginPage = '/patient-login';
            }
            return res.redirect(loginPage);
        }

        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                // Redirect to login page based on role
                let loginPage = '/';
                if (req.path.startsWith('/doctor')) {
                    loginPage = '/doctor-login';
                } else if (req.path.startsWith('/admin')) {
                    loginPage = '/admin-login';
                } else if (req.path.startsWith('/patient')) {
                    loginPage = '/patient-login';
                }
                return res.redirect(loginPage);
            }
            req.user = decoded;

            // Redirect to patient login page if trying to book appointment without patient role
            if (req.path.startsWith('/book-appointment') && req.user.role !== 'patient') {
                return res.redirect('/patient-login');
            }
            next();
        });
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = commonAuthMiddleware;
