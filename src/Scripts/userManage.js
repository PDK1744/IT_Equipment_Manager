document.addEventListener('DOMContentLoaded', async () => {
    const userTableBody = document.getElementById('userTableBody');
    
    const apiUrl = window.electronAPI.getApiUrl();
    
    let users = [];

    async function loadUsers() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/users/view`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            users = await response.json();
            renderUsers(users);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    function renderUsers(users) {
        userTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>
                    <select class="role-select" data-userid="${user.id}">
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
                <td>
                    <button class="delete-btn" data-userid="${user.id}">Delete</button>
                    <button class="reset-btn" data-userid="${user.id}">Reset Password</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });

        // Add event listeners for role changes and delete buttons
        document.querySelectorAll('.role-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const userId = e.target.dataset.userid;
                const newRole = e.target.value;
                await updateUserRole(userId, newRole);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const userId = e.target.dataset.userid;
                if (await confirmDelete()) {
                    await deleteUser(userId);
                }
            });
        });

        document.querySelectorAll('.reset-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const userId = e.target.dataset.userid;
                const tempPassword = 'Texar123'; // Default temp password
                
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${apiUrl}/auth/admin-reset-password`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ 
                            userId, 
                            tempPassword 
                        })
                    });
        
                    if (response.ok) {
                        await window.electronAPI.showAlert(
                            `Password has been reset to: ${tempPassword}\nUser will be prompted to change password on next login.`
                        );
                    } else {
                        const data = await response.json();
                        await window.electronAPI.showAlert(data.message || 'Failed to reset password');
                    }
                } catch (error) {
                    console.error('Error resetting password:', error);
                    await window.electronAPI.showAlert('Failed to reset password');
                }
            });
        });
    }

    async function updateUserRole(userId, newRole) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            if (response.ok) {
                await loadUsers();
            }
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    }

    async function deleteUser(userId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                await loadUsers();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }

    async function confirmDelete() {
        return window.electronAPI.showConfirmDialog('Are you sure you want to delete this user?');
    }

    // Initial load
    await loadUsers();

    // Search functionality
    /*searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredUsers = users.filter(user => 
            user.username.toLowerCase().includes(searchTerm)
        );
        renderUsers(filteredUsers);
    });*/
});