


document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page

    const form = document.getElementById('loginForm');
    const username = document.getElementById('username').value;
    const usernameInput = document.getElementById('username');
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    usernameInput.focus();

    try {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Token:', data.token);
            localStorage.setItem('token', data.token); // Save JWT token
            //alert('Login successful!');

            window.electronAPI.loginSuccess();

            // Redirect to main app window
            //window.location.href = 'main.html';
        } else {
            const errorText = await response.text();
            showErrorMessage(errorText);
            
        }
    } catch (error) {
        console.error('Error logging in:', error);
        showErrorMessage('Error logging in. Please try again.');
    }

    function showErrorMessage(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';

        form.reset();
    }

    document.getElementById('username').addEventListener('input', resetErrorMessage);
    document.getElementById('password').addEventListener('input', resetErrorMessage);

    function resetErrorMessage() {
        errorMessage.style.display = 'none';
    }
});
