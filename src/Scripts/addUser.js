const cancelBtn = document.getElementById('cancelUserBtn');

// Listen for the success event from the main process
window.electronAPI.onAddUserSuccess(() => {
    alert("User added successfully!");
    window.close(); // Close the popup after success
});

// Listen for the failure event from the main process
window.electronAPI.onAddUserFailed((event, errorMessage) => {
    alert(`Failed to add user: ${errorMessage}`);
});

document.getElementById('addUserForm').addEventListener('submit', function (event) {
    const userForm = document.getElementById("addUserForm");

    event.preventDefault();
    

    const userData = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value,

    };

    const token = localStorage.getItem('token');

    console.log('Sending user data to main:', userData);
    console.log('Sending token:', token);

    window.electronAPI.addUser({ userData, token });

    userForm.reset();
    
    
    
});

cancelBtn.addEventListener('click', function () {
    window.close();
});