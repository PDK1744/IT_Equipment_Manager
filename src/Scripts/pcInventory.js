document.addEventListener('DOMContentLoaded', async () => {
    const pcTableBody = document.getElementById('pcTableBody');
    const searchInput = document.getElementById('searchInput');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    let pcs = [];
    let selectedRow = null;
    let originalData = [];
    let editMode = false;

    // Fetch initial data
    await refreshTable();

    // Format the date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    // Handle search input
    function handleSearchInput(event) {
        const searchTerm = event.target.value.toLowerCase();
        const filteredPCs = pcs.filter(pc =>
            Object.values(pc).some(value =>
                value.toString().toLowerCase().includes(searchTerm)
            )
        );
        renderPCs(filteredPCs);
    }

    // Render PCs in the table
    function renderPCs(pcs) {
        pcTableBody.innerHTML = ''; // Clear existing rows
        pcs.forEach(pc => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', pc.id);

            const columns = [
                { key: 'pc_number', value: pc.pc_number },
                { key: 'ease_number', value: pc.ease_number },
                { key: 'model', value: pc.model },
                { key: 'asset_tag', value: pc.asset_tag },
                { key: 'service_tag', value: pc.service_tag },
                { key: 'warranty_expiration', value: formatDate(pc.warranty_expiration) },
                { key: 'location', value: pc.location },
                { key: 'branch', value: pc.branch },
                { key: 'notes', value: pc.notes }
            ];

            columns.forEach(col => {
                const cell = document.createElement('td');
                cell.setAttribute('data-column', col.key);
                cell.textContent = col.value;
                row.appendChild(cell);
            });

            // Add click event listener to each row
            row.addEventListener('click', function () {
                handleRowClick(row);
            });

            pcTableBody.appendChild(row);
        });

        // Ensure the search input is still focused after re-render
        searchInput.focus();
    }

    // Handle row click event
    function handleRowClick(row) {
        if (selectedRow && row !== selectedRow) {
            exitEditMode();
            selectedRow.classList.remove('highlight');
        }

        selectedRow = row;
        selectedRow.classList.add('highlight');

        originalData = Array.from(selectedRow.children).map(cell => {
            const input = cell.querySelector('input');
            return input ? input.value : cell.textContent;
        });

        document.getElementById('actionButtons').style.display = 'block';
    }

    // Exit edit mode
    function exitEditMode() {
        if (selectedRow && editMode) {
            editMode = false;
            const cells = selectedRow.getElementsByTagName('td');
            Array.from(cells).forEach((cell, index) => {
                cell.textContent = originalData[index];
            });
            selectedRow.classList.remove('highlight');
            selectedRow = null;
            originalData = [];
            document.getElementById('actionButtons').style.display = 'none';
        }
    }

    // Save changes to the table row
    saveBtn.addEventListener('click', async function () {
        if (selectedRow && editMode) {
            const updatedData = {
                id: selectedRow.getAttribute('data-id')
            };

            // Collect new data from inputs inside each table cell
            const cells = selectedRow.getElementsByTagName('td');
            Array.from(cells).forEach((cell) => {
                const input = cell.querySelector('input');
                if (input) {
                    updatedData[cell.getAttribute('data-column')] = input.value;
                    cell.textContent = input.value; // Update the cell immediately
                }
            });

            // Temporarily update the UI to reflect the changes before calling the API
            editMode = false;
            selectedRow.classList.remove('highlight');
            document.getElementById('actionButtons').style.display = 'none';

            try {
                // Perform PUT request to update the data on the backend
                const response = await fetch(`http://localhost:3000/pcs/${updatedData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData),
                });

                if (response.ok) {
                    pcs = pcs.map(pc =>
                        pc.id === parseInt(updatedData.id) ? { ...pc, ...updatedData } : pc
                    );
                } else {
                    console.error('Failed to save changes');
                }
            } catch (error) {
                console.error('Error updating row:', error);
            }
        }
    });

    // Cancel edit mode
    cancelBtn.addEventListener('click', () => {
        if (editMode) exitEditMode();
        selectedRow.classList.remove('highlight');
    });

    // Delete button functionality
    deleteBtn.addEventListener('click', async function () {
        if (selectedRow) {
            const rowId = selectedRow.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this row?')) {
                try {
                    const response = await fetch(`http://localhost:3000/pcs/${rowId}`, { method: 'DELETE' });
                    if (response.ok) {
                        // Remove row from the pcs array
                        pcs = pcs.filter(pc => pc.id !== parseInt(rowId));
                        selectedRow.remove(); // Remove the row from the DOM

                        // Reset State
                        selectedRow = null;
                        originalData = [];
                        document.getElementById('actionButtons').style.display = 'none';

                        // Rebuild the table after deletion
                        renderPCs(pcs);

                        // Force focus on the search input after deletion
                        searchInput.focus();

                        // Ensure that input is properly triggered
                        setTimeout(() => {
                            searchInput.setAttribute('value', searchInput.value);
                            searchInput.dispatchEvent(new Event('input'));
                        }, 100);

                    } else {
                        console.error('Failed to delete row');
                    }
                } catch (error) {
                    console.error('Error deleting row:', error);
                }
            }
        }
    });

    // Refresh table from the backend
    async function refreshTable() {
        try {
            const response = await fetch('http://localhost:3000/pcs');
            pcs = await response.json();
            renderPCs(pcs);
        } catch (error) {
            console.error('Error refreshing table:', error);
        }
    }

    // Set up search input listener
    searchInput.addEventListener('input', handleSearchInput);

    // Handle edit button click
    editBtn.addEventListener('click', function () {
        if (selectedRow) {
            editMode = true;
            const cells = selectedRow.getElementsByTagName('td');
            Array.from(cells).forEach((cell, index) => {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = cell.textContent;
                cell.innerHTML = '';  // Clear the cell
                cell.appendChild(input);
            });

            // Hide action buttons until save or cancel
            document.getElementById('actionButtons').style.display = 'block';
        }
    });
});
