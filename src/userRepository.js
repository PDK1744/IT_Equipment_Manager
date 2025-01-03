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

async function getAllUsers()  {
    try {
        const result = await client.query('SELECT * FROM users_view');
        return result.rows;
    } catch (err) {
        console.error('Error fetching users:', err);
        throw err;
    }
}

// Function to update a user role
async function updateUserRole(userId, role) {
    try {
        const result = await client.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
            [role, userId]
        );
        if (result.rowCount === 0) {
            throw new Error('User not found');
        }
        return result.rows[0];
    } catch (error) {
        throw new Error(`Failed to update user role: ${error.message}`);
    }
}

// Function to delete a user
async function deleteUser(userId) {
    try {
        const result = await client.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [userId]
        );
        if (result.rowCount === 0) {
            throw new Error('User not found');
        }
        return result.rows[0];
    } catch (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
    }
}

module.exports = {
    addUser,
    getUserByUsername,
    getAllUsers,
    updateUserRole,
    deleteUser,
};