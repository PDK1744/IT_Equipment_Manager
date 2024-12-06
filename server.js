require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./src/db');
const pcInvRepo = require('./src/pcInventoryRepository');
const printerInvRepo = require('./src/printerInventoryRepository');
const secretKey = process.env.JWT_SECRET || 'fallback-secret';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Middleware to validate token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Access denied.');

    jwt.verify(token, 'secretKey', (err, user) => {
        if (err) return res.status(403).send('Invalid Token');
        req.user = user;
        next();
    });
}

// Register a New User
app.post('/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
        INSERT INTO users (username, password_hash)
        VALUES ($1, $2) RETURNING id
        `;
        const values = [username, hashedPassword];

        const result = await db.query(query, values);
        res.status(201).send({ userId: result.rows[0].id });
    } catch (err) {
        if (err.code === '23505') {
            res.status(400).send('Username already exsists.');
        } else {
            console.error('Error registering user:', err);
            res.status(500).send('Server Error');
        }
    }
});

app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }
    try {
        const query = `
        SELECT * FROM users WHERE username = $1
        `;
        const values = [username];
        const result = await db.query(query, values);

        const user = result.rows[0];
        if (user && await bcrypt.compare(password, user.password_hash)) {
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                secretKey,
                { expiresIn: '1h' }
            );
            res.status(200).send({ token });
        } else {
            res.status(401).send('Invalid credentials.');
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Server Error');
    }
});

// PC ROUTES
// Get all PCs
app.get('/pcs', async (req, res) => {
    try {
        const pc = await pcInvRepo.getAllPCs();
        res.json(pc);
    } catch (err) {
        console.error('Error fetching PCs;', err);
        res.status(500).send('Server Error');
    }
});

// Add a new PC
app.post('/pcs', async (req, res) => {
    try{
        const newPC = await pcInvRepo.addPC(req.body);
        res.status(201).json(newPC); // 201 means newPC has been created
    } catch (err) {
        console.error('Error adding PC:', err);
        res.status(500).send('Server Error');
    }
});

// Update a PC
app.put('/pcs/:id', async (req, res) => {
    try {
        const updatedPC = await pcInvRepo.updatePC(req.params.id, req.body);
        res.json(updatedPC);
    } catch (err) {
        console.error('Error updating PC:', err);
        res.status(500).send('Server Error');
    }
});

// Delete a PC
app.delete('/pcs/:id', async (req, res) => {
    try {
        const deletedPC = await pcInvRepo.deletePC(req.params.id);
        res.json(deletedPC);
    } catch (err) {
        console.error('Error deleting PC:', err);
        res.status(500).send('Server Error');
    }
});


// PRINTER ROUTES
// Add a Printer
app.get('/printers', async (req, res) => {
    try {
        const printer = await printerInvRepo.getAllPrinters();
        res.status(201).json(printer);
    } catch (err) {
        console.error('Error getting Printers:', err);
        res.status(500).send('Server Error');
    }
});

// Add a Printer
app.post('/printers', async (req, res) => {
    try {
        const newPrinter = await printerInvRepo.addPrinter(req.body);
        res.status(201).json(newPrinter);
    } catch (err) {
        console.error('Error adding new Printer:', err);
        res.status(500).send('Server Error');
    }
});

// Update a Printer
app.put('/printers/:id', async (req, res) => {
    try {
        const updatedPrinter = await printerInvRepo.updatePrinter(req.params.id, req.body);
        res.status(201).json(updatedPrinter);
    } catch (err) {
        console.error('Error updating the Printer:', err);
        res.status(500).send('Server Error');
    }
});

// Delete a Printer
app.delete('/printers/:id', async (req, res) => {
    try {
        const deletedPrinter = await printerInvRepo.deletePrinter(req.params.id);
        res.status(201).json(deletedPrinter);
    } catch (err) {
        console.error('Error deleting Printer:', err);
        res.status(500).send('Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});