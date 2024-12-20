const client = require('./db');

async function addUser(userData) {
    const { username, password, role } = userData;
    try {
        const result = await client.query(
            `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING *`,
            [username, password, role]
        );
        return result.rows[0];
    } catch (err) {
        console.error('Error adding user:', err);
        throw err;
    }
}

async function getUserByUsername(username) {
    try {
        const result = await client.query(`SELECT * FROM users WHERE username = $1`, [username]);
        return result.rows[0];
    } catch (err) {
        console.error('Error fetching user:', err);
        throw err;
    }
}

module.exports = {
    addUser,
    getUserByUsername,
};