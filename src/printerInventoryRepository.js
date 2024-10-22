const client = require('../db');

async function getAllPrinerInventory() {
    const res = await client.query('SELECT * FROM printer_inventory');
    return res.rows;
}

async function deletePrinterInventoryItem(itemId) {
    const res = await client.query('DELETE FROM printer_inventory WHERE id = $1', [itemId]);
    return res.rowCount;
}

module.exports = {
    getAllPrinterInventory,
    deletePrinterInventoryItem,
};