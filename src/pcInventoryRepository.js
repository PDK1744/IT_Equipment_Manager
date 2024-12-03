const client = require('./db');

// Function to get all PCs
async function getAllPCs() {
    try {
        const result = await client.query('SELECT * FROM pc_inventory');
        return result.rows;
    } catch (err) {
        console.error('Error fetching PCs:', err);
        throw err;
    }
}

// Function to add a new PC
async function addPC(pcData) {
    const { pc_number, ease_number, model, asset_tag, service_tag, warranty_expiration, location, branch, notes, status } = pcData;
    try {
        const result = await client.query(
    `INSERT INTO pc_inventory (
        pc_number, 
        ease_number, 
        model, 
        asset_tag, 
        service_tag, 
        warranty_expiration, 
        location, 
        branch, 
        notes,
        status
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    ) RETURNING *`,
    [
        pc_number, 
        ease_number, 
        model, 
        asset_tag, 
        service_tag, 
        warranty_expiration, 
        location, 
        branch, 
        notes,
        status
    ]
);
        return result.rows[0];
    } catch (err) {
        console.error('Error adding PC:', err);
        throw err;
    }
}

// Function to update a PC
async function updatePC(id, pcData) {
    const { pc_number, ease_number, model, asset_tag, service_tag, warranty_expiration, location, branch, notes, status } = pcData;
    try {
        const result = await client.query(
            `
            UPDATE pc_inventory 
            SET 
                pc_number = $1, 
                ease_number = $2, 
                model = $3, 
                asset_tag = $4, 
                service_tag = $5, 
                warranty_expiration = $6, 
                location = $7, 
                branch = $8, 
                notes = $9,
                status = $10 
            WHERE 
                id = $11 
            RETURNING *
            `,
            [
                pc_number, 
                ease_number, 
                model, 
                asset_tag, 
                service_tag, 
                warranty_expiration, 
                location, 
                branch, 
                notes,
                status,
                id 
            ]
        );
        return result.rows[0];
    } catch (err) {
        console.error('Error updating PC:', err);
        throw err;
    }
}

// Function to delete a PC
async function deletePC(id) {
    try {
        const result = await client.query('DELETE FROM pc_inventory WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    } catch (err) {
        console.error('Error deleting PC:', err);
        throw err;
    }
}

module.exports = {
    getAllPCs,
    addPC,
    updatePC,
    deletePC,
};