const express = require('express');
const bodyParser = require('body-parser');
const pcInvRepo = require('./src/pcInventoryRepository');
const printerInvRepo = require('./src/printerInventoryRepository');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

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