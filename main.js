const { app, BrowserWindow, ipcMain, dialog } = require('electron');

require('./server');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: __dirname + '/preload.js',
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        }
    });

    win.loadFile('src/UI/index.html');

    //win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle Confirmation dialog
ipcMain.handle('show-confirm-dialog', async (event, message) => {
    const result = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Cancel', 'Yes'],
        defaultId: 1,
        title: 'Confirm',
        message: message,
    });
    return result.response === 1;
});