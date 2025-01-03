const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electronAPI', {
    // URL for localhost
    getApiUrl: () => {
        // Default to port 3000 if server port not found
        try {
            const portArg = process.argv.find(arg => arg.startsWith('--server-port='));
            const port = portArg ? portArg.split('=')[1] : '3000';
            return `http://localhost:${port}`;
        } catch (error) {
            console.error('Error getting API URL:', error);
            return 'http://localhost:3000';
        }
    },

    // To open "Add PC" or "Add Printer" popup windows
    openAddPc: () => ipcRenderer.send('open-add-pc'),
    openAddPrinter: () => ipcRenderer.send('open-add-printer'),
    openAddUser: () => ipcRenderer.send('open-add-user'),
    openManageUsers: () => ipcRenderer.send('open-manage-users'),

    // To handle form submissions
    addPc: (pcData) => {
        console.log("Sending PC data to main:", pcData);
        ipcRenderer.send('add-pc', pcData);
    },
    addPrinter: (printerData) => {
        console.log('Sending Printer data:', printerData);
        ipcRenderer.send('add-printer', printerData);
    },
    addUser: (userData) => {
        console.log('Sending User data:', userData);
        const result = ipcRenderer.invoke('add-user', userData);
        return result;
    },
    refreshPcTable: () => ipcRenderer.send('refresh-pc-table'),

    // To show confirmation dialog for delete
    showConfirmDialog: (message) => ipcRenderer.invoke('show-confirm-dialog', message),
});