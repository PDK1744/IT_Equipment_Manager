// Global variables
let pcs = [];
let selectedRow = null;
let editMode = false;
let originalData = [];

// Utility Functions
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
};

function renderPCs(pcs) {
    const pcTableBody = document.getElementById('pcTableBody');
    pcTableBody.innerHTML = '';
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
        pcTableBody.appendChild(row);
    });
}

async function refreshTable() {
    try {
        const response = await fetch('http://localhost:3000/pcs');
        pcs = await response.json();
        renderPCs(pcs);
    } catch (error) {
        console.error('Error refreshing table:', error);
    }
}

// Edit Functions (edit, save, cancel, delete, exitEditMode)
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

// Event Listener Setup on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    const pcTableBody = document.getElementById('pcTableBody');
    const searchInput = document.getElementById('searchInput');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    // Fetch initial data
    await refreshTable();

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

    // Click row event
    pcTableBody.addEventListener('click', function(event) {
        const row = event.target.closest('tr');
        if (row && row.tagName === 'TR') {
            if (selectedRow && row !== selectedRow) {
                exitEditMode();
                selectedRow.classList.remove('highlight');
            }
            selectedRow = row;
            selectedRow.classList.add('highlight');

            originalData = Array.from(selectedRow.children).map(cell => {
                const input = cell.querySelector('input');
                return input ? input.value : cell.textContent; // Get value if input exists, otherwise textContent. This fixed the cells going blank issue when cancelling out of edit on a row.
            });
            document.getElementById('actionButtons').style.display = 'block';
            saveBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
        }
    });

    // Edit button
    editBtn.addEventListener('click', function() {
        if (selectedRow) {
            editMode = true;
            saveBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
            const cells = selectedRow.getElementsByTagName('td');
            Array.from(cells).forEach(cell => {
                const currentText = cell.textContent;
                cell.innerHTML = `<input type="text" value="${currentText}">`;
            });
            const firstInput = selectedRow.querySelector('td input');
            if (firstInput) {
                firstInput.focus();
            }
        }
    });

    // Save button
    // Save button
    saveBtn.addEventListener('click', async function() {
        if (selectedRow && editMode) {
            const updatedData = {
                id: selectedRow.getAttribute('data-id')
            };
            const cells = selectedRow.getElementsByTagName('td');
            Array.from(cells).forEach((cell) => {
                const input = cell.querySelector('input');
                updatedData[cell.getAttribute('data-column')] = input.value;
                cell.textContent = input.value; // Update cell content immediately
            });
        
        editMode = false;
        selectedRow.classList.remove('highlight');
        document.getElementById('actionButtons').style.display = 'none';

        try {
            const response = await fetch(`http://localhost:3000/pcs/${updatedData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                // Directly update the row's data without a full refresh
                Object.keys(updatedData).forEach(key => {
                    const cell = selectedRow.querySelector(`td[data-column="${key}"]`);
                    if (cell) {
                        cell.textContent = updatedData[key];
                    }
                });
            } else {
                console.error('Failed to save changes');
            }

        } catch (error) {
            console.error('Error updating row:', error);
        }
    }
});


    // Cancel button
    cancelBtn.addEventListener('click', () => {
        if (editMode) exitEditMode();
    });

    // Delete button
    deleteBtn.addEventListener('click', async function() {
        if (selectedRow) {
            const rowId = selectedRow.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this row?')) {
                try {
                    const response = await fetch(`http://localhost:3000/pcs/${rowId}`, { method: 'DELETE' });
                    if (response.ok) {
                        selectedRow.remove();
                        selectedRow = null;
                        originalData = [];

                        if (pcs.length > 0) {
                            const firstRow = document.querySelector('tr');
                            if (firstRow) {
                                firstRow.click();
                            }
                        }
                    }
                } catch (error) { console.error('Error deleting row:', error); }
            }
        }
    });
});
