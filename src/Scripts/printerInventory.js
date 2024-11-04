document.addEventListener('DOMContentLoaded', async () => {
    const printerTableBody = document.getElementById('printerTableBody');
    const searchInput = document.getElementById('searchInput');
    let printers = [];

    

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

    try {
        // Fetch items from the server
        const response = await fetch('http://localhost:3000/printers');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        printers = await response.json();
        console.log('Fetched Printers:', printers);

        renderPrinters(printers);
    } catch (error) {
        console.error('Failed to fetch Printers:', error);
        printerTableBody.innerHTML = '<tr><td colspan="9">Failed to load data</td></tr>';
    }

    // Search functionality
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredPrinters = printers.filter(printer =>
            Object.values(printer).some(value =>
                value.toString().toLowerCase().includes(searchTerm)
            )
        );
        renderPrinters(filteredPrinters);
    });
});
