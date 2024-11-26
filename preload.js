const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    showConfirmDialog: (message) => ipcRenderer.invoke('show-confirm-dialog', message),
});