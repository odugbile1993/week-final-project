const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

// Initialize Express app
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your DB username
    password: 'Odugbile@1993', // Replace with your DB password
    database: 'telemedicine_fp'
});

db.connect(err => {
    if (err) {
        console.log('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage, 
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(file.mimetype);
        const mimetype = filetypes.test(file.originalname.split('.').pop().toLowerCase());
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            return cb(new Error('Only PDF, DOC, DOCX files are allowed!'), false);
        }
    }
});

// Routes
require('./routes')(app, db, upload);

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
