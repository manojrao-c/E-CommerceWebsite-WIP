const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());  // Enable CORS
app.use(bodyParser.json());

// Database configuration
const config = {
    user: 'dbadmin',
    password: 'Cskadmin@123',
    server: 'csk12.database.windows.net',
    database: 'csk-db',
    options: {
        encrypt: true // Use encryption for Azure SQL Database
    }
};

// Connect to the database
sql.connect(config, err => {
    if (err) {
        console.error('Database connection failed: ', err);
    } else {
        console.log('Connected to Azure SQL Database');
    }
});

// Handle sign-in requests
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await sql.query`
            SELECT * FROM Users WHERE Email = ${email} AND PasswordHash = ${password};
        `;

        if (result.recordset.length > 0) {
            res.status(200).send('Sign-in successful');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        console.error('Database query error: ', err);
        res.status(500).send('Internal server error');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Backend server running on http://localhost:3000');
});
