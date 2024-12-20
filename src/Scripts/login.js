document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('token', result.token);
            window.location.href = 'index.html'; // Redirect to the main page
        } else {
            alert(result.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('Login failed');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html'; // Redirect to login page if not authenticated
    }
});