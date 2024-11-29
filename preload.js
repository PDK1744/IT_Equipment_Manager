const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {

    // To open "Add PC" or "Add Printer" popup windows
    openAddPc: () => ipcRenderer.send('open-add-pc'),
    openAddPrinter: () => ipcRenderer.send('open-add-printer'),

    // To handle form submissions
    addPc: (pcData) => ipcRenderer.send('add-pc', pcData),
    addPrinter: (printerData) => ipcRenderer.send('add-printer', printerData),

    // To show confirmation dialog for delete
    showConfirmDialog: (message) => ipcRenderer.invoke('show-confirm-dialog', message),
});