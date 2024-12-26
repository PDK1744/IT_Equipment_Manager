document.addEventListener('DOMContentLoaded', async () => {
    const pcTableBody = document.getElementById('pcTableBody');
    const searchInput = document.getElementById('searchInput');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const actionButtons = document.getElementById('actionButtons');
    const exportBtn = document.getElementById('exportBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const role = localStorage.getItem('role');

    let pcs = [];
    let selectedRow = null;
    let originalData = [];
    let editMode = false;
    let currentSortColumn = null;
    let currentSortOrder = 'asc';

    
    
    if (role === 'admin') {
        document.getElementById('addPcBtn').style.display = 'inline-block';
    }

    // Fetch initial data
    await refreshTable();

    document.getElementById('addPcBtn').addEventListener('click', () => {
        window.electronAPI.openAddPc();
    });
    
    

    // Format the date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    // Handle search input
    function handleSearchInput(event) {
        const searchTerm = event.target.value.toLowerCase();
        const filteredPCs = pcs.filter(pc => {
            const { id, ...rest } = pc;
            return Object.values(rest).some(value =>
                value && value.toString().trim().toLowerCase().includes(searchTerm)
            );
    });
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
                { key: 'notes', value: pc.notes },
                { key: 'status', value: pc.status }
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

    // Sort by Column Logic
    document.getElementById('pcTableHeader').addEventListener('click', function (event) {
        const th = event.target.closest('th');
        if (!th) return;

        const key = th.getAttribute('data-key');
        if (!key) return;

        

        // Add sorting class to the clicked header

        if (currentSortColumn === key) {
            currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = key;
            currentSortOrder = 'asc';
        }

        // Remove sorting classed from all headers
        const headers = document.querySelectorAll('th');
        headers.forEach(header => {
            header.classList.remove('sorted-asc', 'sorted-desc');
        })

        // Add appropiate sort class
        th.classList.add(currentSortOrder === 'asc' ? 'sorted-asc' : 'sorted-desc');

        pcs.sort((a, b) => {
            const valueA = a[key] || '';
            const valueB = b[key] || '';

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return currentSortOrder === 'asc'
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
            } else if (typeof valueA === 'number' && typeof valueB === 'number') {
                return currentSortOrder === 'asc' ? valueA - valueB : valueB - valueA;
            } else {
                return 0;
            }
        });
        const filteredPCs = applyStatusFilter();
        renderPCs(filteredPCs);
    });

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

        if (role === 'admin') {
            document.getElementById('actionButtons').style.display = 'block';

        }
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

    // To apply status filter
    function applyStatusFilter() {
        // Get selected status
        const statusFilter = document.getElementById('statusFilter').value;

        // Filter PCs based on the selected status
        const filteredPCs = pcs.filter(pc => {
            return statusFilter === '' || pc.status === statusFilter;
        });

        return filteredPCs;
    }

    document.getElementById('statusFilter').addEventListener('change', () => {
        const filteredPCs = applyStatusFilter();
        renderPCs(filteredPCs);
    });

    document.addEventListener('DOMContentLoaded', () => {
        applyStatusFilter();
    });

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
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/pcs/${updatedData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                     },
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
        actionButtons.style.display = 'none';
    });

    // Delete button functionality
    deleteBtn.addEventListener('click', async function () {
        if (selectedRow) {
            const rowId = selectedRow.getAttribute('data-id');
            const confirmed = await window.electronAPI.showConfirmDialog('Are you sure you want to delete this row?');
            if (confirmed) {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`http://localhost:3000/pcs/${rowId}`, { method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                     });
                    if (response.ok) {
                        // Remove row from the pcs array
                        pcs = pcs.filter(pc => pc.id !== parseInt(rowId));
                        selectedRow.remove(); // Remove the row from the DOM

                        // Reset State
                        selectedRow = null;
                        originalData = [];
                        document.getElementById('actionButtons').style.display = 'none';

                        // Rebuild the table after deletion. DO I NEED THIS??
                        //renderPCs(pcs);

                        // Force focus on the search input after deletion
                        searchInput.focus();

                        // Ensure that input is properly triggered
                        setTimeout(() => {
                            searchInput.setAttribute('value', searchInput.value);
                            searchInput.dispatchEvent(new Event('input'));
                        }, 10);

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
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/pcs', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            pcs = await response.json();

            const filteredPCs = applyStatusFilter();
            renderPCs(filteredPCs);

            // Sort data by pc_number and status in ascending order
            pcs.sort((a, b) => {
                if (a.pc_number !== b.pc_number) {
                    return a.pc_number - b.pc_number;
                }
                return a.status.localeCompare(b.status);
            });
            
            
            //renderPCs(pcs);
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

                input.style.width = '100%';
                input.style.boxSizing = 'border-box';
                input.style.padding = '8px';
                input.style.border = '1px solid #ccc';
                input.style.borderRadius = '4px';
                cell.innerHTML = '';  // Clear the cell
                cell.appendChild(input);
            });

            // Hide action buttons until save or cancel
            document.getElementById('actionButtons').style.display = 'block';
        }
    });
    // Export to CSV functionality
    exportBtn.addEventListener('click', () => {
        const csvContent = "data:text/csv;charset=utf-8," + 
            ["PC Number", "EASE Number", "Model", "Asset Tag", "Service Tag", "Warranty Expiration", "Location", "Branch", "Notes", "Status"]
            .join(",") + "\n" +
            pcs.map(pc => [
                pc.pc_number,
                pc.ease_number,
                pc.model,
                pc.asset_tag,
                pc.service_tag,
                formatDate(pc.warranty_expiration),
                pc.location,
                pc.branch,
                pc.notes,
                pc.status
            ].join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "pc_inventory.csv");
        document.body.appendChild(link); // Required for FF

        link.click();
        document.body.removeChild(link);
    });

    refreshBtn.addEventListener('click', async () => {
        refreshBtn.classList.add('spinning');
        await refreshTable();
        setTimeout(() => {
            refreshBtn.classList.remove('spinning');
        }, 1000);
    });
});
