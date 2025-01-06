document.getElementById('changePasswordForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/auth/change-password', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ newPassword }),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Password changed successfully');
            window.location.href = 'index.html';
        } else {
            alert(result.message || 'Failed to change password');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Failed to change password');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
});