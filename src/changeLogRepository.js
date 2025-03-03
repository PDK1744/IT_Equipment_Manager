const client = require('./db');

const changeLogRepo = {
    async getRecentChanges() {
        
        const result = await client.query(`
            SELECT 
                timestamp,
                device_name,
                device_type,
                action,
                updated_by
            FROM change_log
            ORDER BY timestamp DESC
            LIMIT 5
        `);
        return result.rows;
    },

    async logChange(deviceId, deviceName, deviceType, action, updatedBy) {

        const values = [deviceId, deviceName, deviceType, action, updatedBy];
        const result = await client.query(`
            INSERT INTO change_log (device_id, device_name, device_type, action, updated_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, values);
        return result.rows[0];
    },
    async getAllChanges() {
        
        const result = await client.query(`
            SELECT 
                timestamp,
                device_name,
                device_type,
                action,
                updated_by
            FROM change_log
            ORDER BY timestamp DESC
        `);
        return result.rows;
    },
};

module.exports = changeLogRepo;