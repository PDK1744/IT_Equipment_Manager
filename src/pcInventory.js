async function fetchPCs() {
    try {
        const response = await fetch('/pcs');
        const pc = await response.json();
        console.log(pcs);

        // Get the table body element
        const tableBody = document.getElementById('pc-table-body');

        // Clear any exsisting rows
        tableBody.innerHTML = '';

        // Iterate over the PCs and create table rows
        pcs.forEach(pc => {
            const row = document.createElement('tr');

            // Iterate over each key-value pair in the PC object
            for (const key in pc) {
                if (pc.hasOwnProperty(key)) {
                    const cell = docuemnt.createElement('td');
                    cell.textContent = pc[key];
                    row.appendChild(cell);
                }
            }

            // Append the row to the table body
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error('Error fetching PCs:', err);
    }
}