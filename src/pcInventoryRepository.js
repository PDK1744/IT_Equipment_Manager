const client = require('../db');

async function getAllPCInventory() {
    const res = await client.query('SELECT * FROM pc_inventory');
    return res.rows;
}

async function deletePCInventoryItem(itemId) {
    const res = await client.query('DELETE FROM pc_inventory WHERE id = $1', [itemId]);
    return res.rowCount;
}

module.exports = {
    getAllPCInventory,
    deletePCInventoryItem,
};