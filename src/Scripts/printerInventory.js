document.addEventListener('DOMContentLoaded', async () => {
    const printerTableBody = document.getElementById('printerTableBody');
    const searchInput = document.getElementById('searchInput');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const actionButtons = document.getElementById('actionButtons');
    const refreshBtn = document.getElementById('refreshBtn');
    const role = localStorage.getItem('role');
    const apiUrl = window.electronAPI.getApiUrl();

    let printers = [];
    let selectedRow = null;
    let originalData = [];
    let editMode = false;
    let currentSortColumn = null;
    let currentSortOrder = 'asc';

    if (role === 'admin') {
        document.getElementById('addPrinterBtn-second').style.display = 'inline-block';
    }

    // Fetch initial data
    await refreshTable();

    document.getElementById('addPrinterBtn-second').addEventListener('click', () => {
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

    function editRow(row) {
        editMode = true;
        handleRowClick(row);
        if (selectedRow) {
            const cells = row.getElementsByTagName('td');
            Array.from(cells).forEach((cell, index) => {
                const columnName = cell.getAttribute('data-column');
                
                if (columnName === 'status') {
                    // Create select element for status
                    const select = document.createElement('select');
                    select.style.width = '95%';
                    select.style.padding = '8px';
                    select.style.border = '1px solid #ccc';
                    select.style.borderRadius = '4px';
                    
                    // Add status options
                    const statuses = ['Active', 'Decommed', 'Destroyed', 'New'];
                    statuses.forEach(status => {
                        const option = document.createElement('option');
                        option.value = status;
                        option.textContent = status;
                        if (cell.textContent === status) {
                            option.selected = true;
                        }
                        select.appendChild(option);
                    });
                    
                    cell.innerHTML = '';
                    cell.appendChild(select);
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = cell.textContent;
                    input.style.width = '95%';
                    input.style.boxSizing = 'border-box';
                    input.style.padding = '8px';
                    input.style.border = '1px solid #ccc';
                    input.style.borderRadius = '4px';
                    cell.innerHTML = '';
                    cell.appendChild(input);
                }
            });
            document.getElementById('actionButtons').style.display = 'block';
        }
    }

    //Tool Tip for Notes column
    function createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);
        return tooltip;
    }

    // Render Printers in the table
    function renderPrinters(printers) {
        printerTableBody.innerHTML = ''; // Clear existing rows
        printers.forEach(printer => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', printer.id);

            if (printer.status === 'Decommed') {
                row.classList.add('decommed-row');
            } else if (printer.status === 'Destroyed') {
                row.classList.add('destroyed-row');
            }

            const columns = [
                { key: 'printer_name', value: printer.printer_name },
                { key: 'branch', value: printer.branch },
                { key: 'location', value: printer.location },
                { key: 'model', value: printer.model },
                { key: 'features', value: printer.features },
                { key: 'ip_address', value: printer.ip_address },
                { key: 'portrait', value: printer.portrait },
                { key: 'landscape', value: printer.landscape },
                { key: 'notes', value: printer.notes },
                { key: 'status', value: printer.status }
            ];

            columns.forEach(col => {
                const cell = document.createElement('td');
                cell.setAttribute('data-column', col.key);
                cell.textContent = col.value;
                // Add tooltip for notes column
                if (col.key === 'notes' || col.key === 'features') {
                    const tooltip = createTooltip();
                    let tooltipTimeout;
                    cell.addEventListener('mouseover', (e) => {
                        tooltipTimeout = setTimeout(() => {
                            tooltip.textContent = col.value;
                            tooltip.style.display = 'block';
                            const rect = cell.getBoundingClientRect();
                            tooltip.style.left = `${rect.left}px`;
                            tooltip.style.top = `${rect.bottom + 5}px`;

                        }, 500);
                        
                    });
                    cell.addEventListener('mouseout', () => {
                        clearTimeout(tooltipTimeout);
                        tooltip.style.display = 'none';
                    });
                }
                row.appendChild(cell);
            });

            // Add click event listener to each row
            row.addEventListener('click', function (e) {
                // Prevent double click from triggering single click
                if (e.detail === 1) {
                    setTimeout(() => {
                        if (e.detail === 1) {
                            handleRowClick(row);
                        }
                }, 200);
            }
            });

            row.addEventListener('dblclick', function () {
                //handleRowClick(row);
                editRow(row);
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
        const filteredPrinters = applyStatusFilter();
        renderPrinters(filteredPrinters);
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
            const select = cell.querySelector('select');
            if (input) {
                return input.value;
            } else if (select) {
                return select.value;
            }
            return cell.textContent;
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
                const input = cell.querySelector('input');
                const select = cell.querySelector('select');
                if (input) {
                    cell.textContent = originalData[index];
                } else if (select) {
                    cell.textContent = originalData[index];
                }
                
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
        const filteredPrinters = printers.filter(printer => {
            return statusFilter === '' || printer.status === statusFilter;
        });

        return filteredPrinters;
    }

    document.getElementById('statusFilter').addEventListener('change', () => {
        const filteredPrinters = applyStatusFilter();
        renderPrinters(filteredPrinters);
    })

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
                const select = cell.querySelector('select');
                if (input) {
                    updatedData[cell.getAttribute('data-column')] = input.value;
                    cell.textContent = input.value; // Update the cell immediately
                } else if (select) {
                    updatedData[cell.getAttribute('data-column')] = select.value;
                    cell.textContent = select.value;
                }
            });

            // Temporarily update the UI to reflect the changes before calling the API
            editMode = false;
            selectedRow.classList.remove('highlight');
            document.getElementById('actionButtons').style.display = 'none';

            try {
                // Perform PUT request to update the data on the backend
                const token = localStorage.getItem('token');
                const response = await fetch(`${apiUrl}/printers/${updatedData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                     },
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
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${apiUrl}/printers/${rowId}`, { method: 'DELETE',
                        headers: {'Authorization': `Bearer ${token}` }
                     });
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
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/printers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            printers = await response.json();

            const filteredPrinters = applyStatusFilter();
            renderPrinters(filteredPrinters);

            // Sort Data
            printers.sort((a, b) => {
                const nameA = a.printer_name || '';
                const nameB = b.printer_name || '';
                const statusA = a.status || '';
                const statusB = b.status || '';

                if (nameA !== nameB) {
                    return nameA.localeCompare(nameB);
                }
                return statusA.localeCompare(statusB);
            });

            //renderPrinters(printers);
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
            if (role === 'admin') {
                document.getElementById('actionButtons').style.display = 'block';
            }
            
        }
    });
    // Export to CSV functionality
    exportBtn.addEventListener('click', () => {
        const csvContent = "data:text/csv;charset=utf-8," + 
            ["Printer Name", "Branch", "Location", "Model", "Features", "IP Address", "Portrait", "Landscape", "Notes", "Status"]
            .join(",") + "\n" +
            printers.map(printer => [
                printer.printer_name,
                printer.branch,
                printer.location,
                printer.model,
                printer.features,
                printer.ip_address,
                printer.portrait,
                printer.landscape,
                printer.notes,
                printer.status
            ].join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "printer_inventory.csv");
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
