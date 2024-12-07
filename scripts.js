const express = require('express');
const app = express();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'telemedicine_fp'
});

db.connect(err => {
    if (err) {
        console.log('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Registration route
app.post('/register', (req, res) => {
    const { email, password, role, medicalHistory, emergencyContact, specialty, education, workExperience, cvFile } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ message: 'Internal server error' });

        const query = `INSERT INTO users (email, password, role, medicalHistory, emergencyContact, specialty, education, workExperience, cvFile) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(query, [email, hashedPassword, role, medicalHistory, emergencyContact, specialty, education, workExperience, cvFile], (err, result) => {
            if (err) return res.status(500).json({ message: 'Internal server error' });
            res.status(200).json({ message: 'User registered successfully' });
        });
    });
});

// Login route with JWT token generation
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) return res.status(500).json({ message: 'Internal server error' });

        if (result.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

        const user = result[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) return res.status(400).json({ message: 'Invalid credentials' });

            const token = jwt.sign({ email: user.email, role: user.role }, 'your_jwt_secret_key', { expiresIn: '1h' });
            res.status(200).json({ token, role: user.role });
        });
    });
});

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Access Denied: No token provided' });
    }

    jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Example of protected route
app.get('/protectedRoute', authenticateJWT, (req, res) => {
    res.status(200).json({ message: 'You have access to this route!' });
});

// Serve static files (your HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
