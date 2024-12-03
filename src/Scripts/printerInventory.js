document.addEventListener('DOMContentLoaded', async () => {
    const printerTableBody = document.getElementById('printerTableBody');
    const searchInput = document.getElementById('searchInput');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const actionButtons = document.getElementById('actionButtons');

    let printers = [];
    let selectedRow = null;
    let originalData = [];
    let editMode = false;
    let currentSortColumn = null;
    let currentSortOrder = 'asc';

    // Fetch initial data
    await refreshTable();

    document.getElementById('addPrinterBtn').addEventListener('click', () => {
        window.electronAPI.openAddPrinter();
    });


    // Handle search input
    function handleSearchInput(event) {
        const searchTerm = event.target.value.toLowerCase();
        const filteredPrinters = printers.filter(printer =>
            Object.values(printer).some(value =>
                value && value.toString().trim().toLowerCase().includes(searchTerm)
            )
        );
        renderPrinters(filteredPrinters);
    }

    // Render Printers in the table
    function renderPrinters(printers) {
        printerTableBody.innerHTML = ''; // Clear existing rows
        printers.forEach(printer => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', printer.id);

            const columns = [
                { key: 'printer_name', value: printer.printer_name },
                { key: 'branch', value: printer.branch },
                { key: 'location', value: printer.location },
                { key: 'model', value: printer.model },
                { key: 'features', value: printer.features },
                { key: 'ip_address', value: printer.ip_address },
                { key: 'portrait', value: printer.portrait },
                { key: 'landscape', value: printer.portrait },
                { key: 'notes', value: printer.notes },
                { key: 'status', value: printer.status }
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

            printerTableBody.appendChild(row);
        });

        // Ensure the search input is still focused after re-render
        searchInput.focus();
    }

    // Sort by Column Logic
    document.getElementById('printerTableHeader').addEventListener('click', function (event) {
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

        printers.sort((a, b) => {
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
        renderPrinters(printers);
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
                const response = await fetch(`http://localhost:3000/printers/${updatedData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData),
                });

                if (response.ok) {
                    printers = printers.map(printer =>
                        printer.id === parseInt(updatedData.id) ? { ...printer, ...updatedData } : printer
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
                    const response = await fetch(`http://localhost:3000/printers/${rowId}`, { method: 'DELETE' });
                    if (response.ok) {
                        // Remove row from the pcs array
                        printers = printers.filter(printer => printer.id !== parseInt(rowId));
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
            const response = await fetch('http://localhost:3000/printers');
            printers = await response.json();
            renderPrinters(printers);
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
