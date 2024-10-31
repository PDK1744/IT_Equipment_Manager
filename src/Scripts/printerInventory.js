document.addEventListener('DOMContentLoaded', async () => {
    const printerTableBody = document.getElementById('printerTableBody');

    try {
        // Fetch items from the server
        const response = await fetch('http://localhost:3000/printers');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const printers = await response.json();
        console.log(printers);



        // Function to render Printers in the table
        const renderPrinters = (printers) => {
            printerTableBody.innerHTML = ''; // Clear the table body
            printers.forEach(printer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td data-field="printer_name">${printer.printer_name}</td>
                <td data-field="branch">${printer.branch}</td>
                <td data-field="location">${printer.location}</td>
                <td data-field="model">${printer.model}</td>
                <td data-field="features">${printer.features}</td>
                <td data-field="ip_address">${printer.ip_address}</td>
                <td data-field="portrait">${printer.portrait}</td>
                <td data-field="landscape">${printer.landscape}</td>
                <td class="notes" data-field="notes">${printer.notes}</td>`;
                printerTableBody.appendChild(row);
            });
        };

        renderPrinters(printers);
    } catch (error) {
        console.error('Failed to fetch Printers:', error);
        printerTableBody.innerHTML = '<tr><td colspan="9">Failed to load data</td></tr>';
    }
});
