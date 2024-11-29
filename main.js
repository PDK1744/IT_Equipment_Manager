const { app, BrowserWindow, ipcMain, dialog, ipcRenderer } = require('electron');
const path = require('path');

require('./server');

let win;

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

// Function to create popup window
function createPopupWindow(file) {
    const popupWindow = new BrowserWindow({
        width: 400,
        height: 500,
        parent: win,
        modal: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        }
    });

    popupWindow.loadFile(file);

    popupWindow.setMenuBarVisibility(false);
    return popupWindow;
}
// Listen for open
ipcMain.on('open-add-pc', () => {
    createPopupWindow('src/UI/addPC.html');
});

ipcMain.on('open-add-printer', () => {
    createPopupWindow('src/UI/addPrinter.html');
})

// Listen for addPc and addPrinter
ipcMain.on('add-pc', (event, pcData) => {
    console.log('PC Data Received:', pcData);
    // Need to add logic to add data
});

ipcMain.on('add-printer', (event, printerData) => {
    console.log('Printer Data Received:', printerData);
    // Need to add logic to add data
});