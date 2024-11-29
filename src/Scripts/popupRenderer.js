

document.addEventListener("DOMContentLoaded", () => {
    // Select the forms
    const pcForm = document.getElementById("pcForm");
    const printerForm = document.getElementById("printerForm");

    // Add event listener for the "Add PC" form
    if (pcForm) {
        pcForm.addEventListener("submit", (event) => {
            event.preventDefault(); // Prevent default form submission

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
            };

            // Send the data to the main process
            window.electronAPI.addPc(pcData);
        });

        // Handle the cancel button for the PC form
        document.getElementById("cancelBtn").addEventListener("click", () => {
            window.close(); // Close the popup window
        });
    }

    // Add event listener for the "Add Printer" form
    if (printerForm) {
        printerForm.addEventListener("submit", (event) => {
            event.preventDefault(); // Prevent default form submission

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
            };

            // Send the data to the main process
            window.electronAPI.addPrinter(printerData);
        });

        // Handle the cancel button for the Printer form
        document.getElementById("cancelPrinterBtn").addEventListener("click", () => {
            window.close(); // Close the popup window
        });
    }
});
