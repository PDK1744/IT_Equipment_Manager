document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('role');
    
    if (role === 'admin') {
        document.getElementById('addPcBtn').style.display = 'inline-block';
        document.getElementById('addPrinterBtn').style.display = 'inline-block';
        document.getElementById('addUserBtn').style.display = 'inline-block';
    }
    document.getElementById('addPcBtn').addEventListener('click', () => {
        window.electronAPI.openAddPc();
    });
    
    document.getElementById('addPrinterBtn').addEventListener('click', () => {
        window.electronAPI.openAddPrinter();
    });
    
    document.getElementById('addUserBtn').addEventListener('click', () => {
        window.electronAPI.openAddUser();
    });

});

