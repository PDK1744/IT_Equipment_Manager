document.addEventListener('DOMContentLoaded', async () => {
    const pcTableBody = document.getElementById('pcTableBody');

    try {
        // Fetch items from the server
        const response = await fetch('http://localhost:3000/pcs');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const pcs = await response.json();
        console.log(pcs);

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

        renderPCs(pcs);
    } catch (error) {
        console.error('Failed to fetch PCs:', error);
        pcTableBody.innerHTML = '<tr><td colspan="9">Failed to load data</td></tr>';
    }
    
    // Search functionality
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.ariaValueMax.toLowerCase();
        const filteredItems = item.filter(item =>
            item.name.toLowerCase().includes(searchTerm)
        );
        renderPCs(filteredItems);
    });
});
