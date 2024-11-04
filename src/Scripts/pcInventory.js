document.addEventListener('DOMContentLoaded', async () => {
    const pcTableBody = document.getElementById('pcTableBody');
    const searchInput = document.getElementById('searchInput');
    let pcs = [];

    // Function to format the date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${month}/${day}/${year}`;
    };

    // Function to render PCs in the table
    const renderPCs = (pcs) => {
        pcTableBody.innerHTML = ''; // Clear the table body
        pcs.forEach(pc => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td data-field="pc_number">${pc.pc_number}</td>
            <td data-field="ease_number">${pc.ease_number}</td>
            <td data-field="model">${pc.model}</td>
            <td data-field="asset_tag">${pc.asset_tag}</td>
            <td data-field="service_tag">${pc.service_tag}</td>
            <td data-field="warranty_expiration">${formatDate(pc.warranty_expiration)}</td>
            <td data-field="location">${pc.location}</td>
            <td data-field="branch">${pc.branch}</td>
            <td class="notes" data-field="notes">${pc.notes}</td>`;
            pcTableBody.appendChild(row);
        });
    };

    try {
        // Fetch items from the server
        const response = await fetch('http://localhost:3000/pcs');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        pcs = await response.json();
        console.log('Fetched PCs:', pcs);

        renderPCs(pcs);
    } catch (error) {
        console.error('Failed to fetch PCs:', error);
        pcTableBody.innerHTML = '<tr><td colspan="9">Failed to load data</td></tr>';
    }

    // Search functionality
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredPCs = pcs.filter(pc =>
            Object.values(pc).some(value =>
                value.toString().toLowerCase().includes(searchTerm)
            )
        );
        renderPCs(filteredPCs);
    });
});
