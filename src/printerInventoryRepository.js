const client = require('./db');

// Function to get all Printers
async function getAllPrinters() {
    try {
        const result = await client.query('SELECT * FROM printer_inventory');
        return result.rows;
    } catch (err) {
        console.error('Error fetching Printers:', err);
        throw err;
    }
}

async function logChange(deviceId, deviceName, action, updatedBy) {
    try {
        await client.query(`
            INSERT INTO change_log (device_id, device_name, device_type, action, updated_by)
            VALUES ($1, $2, $3, $4, $5)
        `, [deviceId, deviceName, 'Printer', action, updatedBy]);
    } catch (error) {
        console.error('Error logging change:', error);
    }
}

// Function to add a new Printer
async function addPrinter(printerData, username) {
    const { printer_name, branch, location, model, features, ip_address, portrait, landscape, notes, status } = printerData;
    try {
        const result = await client.query(
            `INSERT INTO printer_inventory (
            printer_name,
            branch,
            location,
            model,
            features,
            ip_address,
            portrait,
            landscape,
            notes,
            status
            ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
            ) RETURNING *`,
            [
                printer_name,
                branch,
                location,
                model,
                features,
                ip_address,
                portrait,
                landscape,
                notes,
                status
            ]
        );
        await logChange(result.rows[0].id, printerData.printer_name, 'Added', username);
        return result.rows[0];
    } catch (err) {
        console.error('Error adding printer:', err);
        throw err;
    }
}

// Function to update a printer
async function updatePrinter(id, printerData, username) {
    const { printer_name, branch, location, model, features, ip_address, portrait, landscape, notes, status } = printerData;
    try {
        const result = await client.query(
            `
            UPDATE printer_inventory
            SET
                printer_name = $1,
                branch = $2,
                location = $3,
                model = $4,
                features = $5,
                ip_address = $6,
                portrait = $7,
                landscape = $8,
                notes = $9,
                status = $10
            WHERE
                id = $11
            RETURNING *
            `,
            [
                printer_name,
                branch,
                location,
                model,
                features,
                ip_address,
                portrait,
                landscape,
                notes,
                status,
                id
            ]
        );
        await logChange(result.rows[0].id, printerData.printer_name, 'Updated', username);
        return result.rows[0];
    } catch (err) {
        console.error('Error updating Printer:', err);
        throw err;
    }
}

// Function to delete a Printer
async function deletePrinter(id, printerNumber, username) {
    try {
        const result = await client.query('DELETE FROM printer_inventory WHERE id = $1 RETURNING *', [id]);
        await logChange(result.rows[0].id, printerNumber, 'Removed', username);
        return result.rows[0];
    } catch (err) {
        console.error('Error deleting Printer:', err);
        throw err;
    }
}

// Count All Active Printers
async function countActivePrinters() {
    try {
        const activePrinters = await client.query('SELECT COUNT(*) FROM printer_inventory WHERE status = $1', ['Active']);

        return activePrinters.rows[0].count;
    } catch (error) {
        console.error('Error fetching dashboard counts:', error);
    }
}

module.exports = {
    getAllPrinters,
    addPrinter,
    updatePrinter,
    deletePrinter,
    countActivePrinters,
};