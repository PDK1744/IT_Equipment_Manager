const client = require('./db');
const bcrypt = require('bcrypt');

async function addUser(userData) {
    const { username, password, role } = userData;
    try {
        // Start transaction
        await client.query('BEGIN');
        
        // Add user
        const userResult = await client.query(
            `INSERT INTO users (username, password_hash, role) 
             VALUES ($1, $2, $3) RETURNING id`,
            [username, password, role]
        );
        
        // Add password reset record
        await client.query(
            `INSERT INTO password_resets (user_id, needs_reset) 
             VALUES ($1, true)`,
            [userResult.rows[0].id]
        );

        await client.query('COMMIT');
        return userResult.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
}

async function checkNeedsPasswordReset(userId) {
    const result = await client.query(
        'SELECT needs_reset FROM password_resets WHERE user_id = $1',
        [userId]
    );
    return result.rows[0]?.needs_reset || false;
}

async function updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await client.query('BEGIN');
    try {
        await client.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [hashedPassword, userId]
        );
        await client.query(
            'UPDATE password_resets SET needs_reset = false WHERE user_id = $1',
            [userId]
        );
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}

async function resetUserPassword(userId, tempPassword) {
    try {
        await client.query('BEGIN');
        
        // Hash temporary password
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        // Update password and set needs_reset
        await client.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [hashedPassword, userId]
        );
        
        await client.query(
            'UPDATE password_resets SET needs_reset = true WHERE user_id = $1',
            [userId]
        );
        
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
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
        await client.query('BEGIN');
        
        // First delete from password_resets
        await client.query(
            'DELETE FROM password_resets WHERE user_id = $1',
            [userId]
        );
        
        // Then delete from users
        await client.query(
            'DELETE FROM users WHERE id = $1',
            [userId]
        );
        
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Failed to delete user: ${error.message}`);
    }
}

module.exports = {
    addUser,
    getUserByUsername,
    getAllUsers,
    updateUserRole,
    deleteUser,
    checkNeedsPasswordReset,
    updatePassword,
    resetUserPassword

};