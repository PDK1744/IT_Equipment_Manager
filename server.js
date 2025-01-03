const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pcInvRepo = require('./src/pcInventoryRepository');
const printerInvRepo = require('./src/printerInventoryRepository');
const userRepo = require('./src/userRepository'); 

const app = express();
const port = process.env.PORT || 3000;
const secretKey = process.env.JWT_SECRET || 'fallback-secret';

const server = app.listen(0, () => {
    const port = server.address().port;
    global.serverPort = port;
    console.log(`Server running on port ${port}`);
});

app.use(cors());
app.use(bodyParser.json());

// Middleware to validate token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied. No Token Provided' });

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });

        req.user = user;
        next();
    });
}

// Middleware to check admin role
function checkAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Not an Admin' });
    }
    next();
}

// Register a New User
app.post('/auth/register', authenticateToken, checkAdmin, async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    if (role && !['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Role must be "user" or "admin".' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userRepo.addUser({ username, password: hashedPassword, role: role || 'user' });
        res.status(201).json({ userId: newUser.id, role: newUser.role });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ message: 'Username already exists.' });
        }
        res.status(500).json({ message: 'Server error.' });
    }
});

// Login User
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const user = await userRepo.getUserByUsername(username);
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        const token = jwt.sign({ username: user.username, role: user.role }, secretKey, { expiresIn: '1h' });
        res.json({ token, role: user.role });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Protect routes
app.use('/pcs', authenticateToken);
app.use('/printers', authenticateToken);

// PC ROUTES
app.get('/pcs', async (req, res) => {
    try {
        const pc = await pcInvRepo.getAllPCs();
        res.json(pc);
    } catch (err) {
        console.error('Error fetching PCs;', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/pcs', async (req, res) => {
    try {
        const newPC = await pcInvRepo.addPC(req.body);
        res.status(201).json(newPC);
    } catch (err) {
        console.error('Error adding PC:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.put('/pcs/:id', async (req, res) => {
    try {
        const updatedPC = await pcInvRepo.updatePC(req.params.id, req.body);
        res.json(updatedPC);
    } catch (err) {
        console.error('Error updating PC:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.delete('/pcs/:id', async (req, res) => {
    try {
        const deletedPC = await pcInvRepo.deletePC(req.params.id);
        res.json(deletedPC);
    } catch (err) {
        console.error('Error deleting PC:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PRINTER ROUTES
app.get('/printers', async (req, res) => {
    try {
        const printer = await printerInvRepo.getAllPrinters();
        res.status(201).json(printer);
    } catch (err) {
        console.error('Error getting Printers:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/printers', async (req, res) => {
    try {
        const newPrinter = await printerInvRepo.addPrinter(req.body);
        res.status(201).json(newPrinter);
    } catch (err) {
        console.error('Error adding new Printer:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.put('/printers/:id', async (req, res) => {
    try {
        const updatedPrinter = await printerInvRepo.updatePrinter(req.params.id, req.body);
        res.status(201).json(updatedPrinter);
    } catch (err) {
        console.error('Error updating the Printer:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.delete('/printers/:id', async (req, res) => {
    try {
        const deletedPrinter = await printerInvRepo.deletePrinter(req.params.id);
        res.status(201).json(deletedPrinter);
    } catch (err) {
        console.error('Error deleting Printer:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get all users (view)
app.get('/users/view', authenticateToken, async (req, res) => {
    try {
        const users = await userRepo.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Update user role endpoint
app.put('/users/:id/role', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }
    try {
        const userId = req.params.id;
        const { role } = req.body;
        
        // Validate role
        if (!role || !['admin', 'user'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        await userRepo.updateUserRole(userId, role);
        res.json({ success: true, message: 'Role updated successfully' });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ message: error.message });
    }
})

// Delete user endpoint
app.delete('/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }
    try {
        const userId = req.params.id;
        await userRepo.deleteUser(userId);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = server;