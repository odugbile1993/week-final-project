module.exports = function(app, db, upload) {
    
    // Registration Endpoint for Patients
    app.post('/register/patient', (req, res) => {
        const { name, email, password, medicalHistory, emergencyContact } = req.body;
        const query = 'INSERT INTO patients (name, email, password, medical_history, emergency_contact) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [name, email, password, medicalHistory, emergencyContact], (err, result) => {
            if (err) {
                console.log('Error during patient registration:', err);
                return res.status(500).json({ error: 'Database error during patient registration' });
            }
            res.status(200).json({ message: 'Patient registration successful' });
        });
    });

    // Registration Endpoint for Doctors with file upload
    app.post('/register/doctor', upload.single('cvFile'), (req, res) => {
        const { name, email, password, specialty, education, workExperience, location } = req.body;
        const cvFile = req.file ? req.file.path : null; // Save the file path

        const query = 'INSERT INTO doctors (name, email, password, specialty, education, work_experience, cv_file, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [name, email, password, specialty, education, workExperience, cvFile, location], (err, result) => {
            if (err) {
                console.log('Error during doctor registration:', err);
                return res.status(500).json({ error: 'Database error during doctor registration' });
            }
            res.status(200).json({ message: 'Doctor registration successful' });
        });
    });

    // Login Endpoint for All Users
    app.post('/login', (req, res) => {
        const { email, password } = req.body;
        
        // Check patient table
        const query = 'SELECT * FROM patients WHERE email = ? AND password = ?';
        db.query(query, [email, password], (err, results) => {
            if (err) {
                console.log('Error during login:', err);
                return res.status(500).json({ error: 'Login failed' });
            }

            if (results.length > 0) {
                return res.status(200).json({ message: 'Login successful', role: 'patient' });
            }

            // Check doctor table
            const query2 = 'SELECT * FROM doctors WHERE email = ? AND password = ?';
            db.query(query2, [email, password], (err, results) => {
                if (err) {
                    console.log('Error during doctor login:', err);
                    return res.status(500).json({ error: 'Login failed' });
                }

                if (results.length > 0) {
                    return res.status(200).json({ message: 'Login successful', role: 'doctor' });
                }

                return res.status(400).json({ error: 'Invalid credentials' });
            });
        });
    });
};
