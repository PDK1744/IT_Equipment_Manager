

document.getElementById('addPcBtn').addEventListener('click', () => {
    window.electronAPI.openAddPc();
});

document.getElementById('addPrinterBtn').addEventListener('click', () => {
    window.electronAPI.openAddPrinter();
});

document.getElementById('addUserBtn').addEventListener('click', () => {
    window.electronAPI.openAddUser();
})