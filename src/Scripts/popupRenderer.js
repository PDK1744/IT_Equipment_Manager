document.addEventListener("DOMContentLoaded", () => {
    // Select the forms
    const pcForm = document.getElementById("pcForm");
    const printerForm = document.getElementById("printerForm");
    const userForm = document.getElementById("userForm");

    // Add event listener for the "Add PC" form
    if (pcForm) {
        pcForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent default form submission
            console.log('Form submitted');
            const token = localStorage.getItem('token');

            // Collect data from the PC form
            const pcData = {
                pc_number: document.getElementById("pc_number").value,
                ease_number: document.getElementById("ease_number").value,
                model: document.getElementById("model").value,
                asset_tag: document.getElementById("asset_tag").value,
                service_tag: document.getElementById("service_tag").value,
                warranty_expiration: document.getElementById("warranty_expiration").value,
                location: document.getElementById("location").value,
                branch: document.getElementById("branch").value,
                notes: document.getElementById("notes").value,
                status: document.getElementById("status").value,
            };

            // Send the data to the main process
            window.electronAPI.addPc({pcData, token});

            // Reset the form and provide feedback
            pcForm.reset();
            alert("PC added successfully!");
            window.close();
        });

        // Handle the cancel button for the PC form
        document.getElementById("cancelBtn").addEventListener("click", () => {
            window.close(); // Close the popup window
        });
    }

    // Add event listener for the "Add Printer" form
    if (printerForm) {
        printerForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent default form submission
            const token = localStorage.getItem('token');


            // Collect data from the Printer form
            const printerData = {
                printer_name: document.getElementById("printer_name").value,
                branch: document.getElementById("branch").value,
                location: document.getElementById("location").value,
                model: document.getElementById("model").value,
                features: document.getElementById("features").value,
                ip_address: document.getElementById("ip_address").value,
                portrait: document.getElementById("portrait").value,
                landscape: document.getElementById("landscape").value,
                notes: document.getElementById("notes").value,
                status: document.getElementById("status").value,
            };

            // Send the data to the main process
            window.electronAPI.addPrinter({ printerData, token });

            // Reset the form and provide feedback
            printerForm.reset();
            alert("Printer added successfully!");
            window.close();
        });

        // Handle the cancel button for the Printer form
        document.getElementById("cancelPrinterBtn").addEventListener("click", () => {
            window.close(); // Close the popup window
        });
    }
});

    
    // Add event listener for the "Add User" form
    if (userForm) {
        userForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent default form submission
            const token = localStorage.getItem('token');

            // Collect data from the User form
            const userData = {
                username: document.getElementById("username").value,
                password: document.getElementById("password").value,
                role: document.getElementById("role").value,
            };

            // Send the data to the main process
            window.electronAPI.addUser({ userData, token });

            // Reset the form and provide feedback
            userForm.reset();
            alert("User added successfully!");
            window.close();
        });

        // Handle the cancel button for the User form
        document.getElementById("cancelBtn").addEventListener("click", () => {
            window.close(); // Close the popup window
        });
    }

