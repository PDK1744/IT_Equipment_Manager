const { app, BrowserWindow, ipcMain, dialog, ipcRenderer, screen } = require('electron');
const path = require('path');
const fetch = require('node-fetch');

require('./server');

let win;


function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const win = new BrowserWindow({
        width: width,
        height: height,
        frame: true,
        webPreferences: {
            preload: __dirname + '/preload.js',
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        }
    });

    win.loadFile('src/UI/login.html');

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
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const popupWindow = new BrowserWindow({
        width: width,
        height: height,
        frame: true,
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
});

ipcMain.on('open-add-user', () => {
    createPopupWindow('src/UI/addUser.html');
});

// Listen for addPc and addPrinter
ipcMain.on('add-pc', async (event, { pcData, token }) => {
    console.log('PC Data Received:', pcData);
    // Need to add logic to add data
    try {
        const response = await fetch('http://localhost:3000/pcs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
             },
            body: JSON.stringify(pcData),
        });
        const result = await response.json();
        if (result.success) {
            console.log('PC added!', result.message);
            event.reply('add-pc-success', result.message);
        } else {
            console.error('Error adding PC:', result.message);
            event.reply('add-pc-error', result.message);
        }
    } catch (error) {
        console.error('Failed to add PC:', error);
    }
});

ipcMain.on('add-printer', async (event, { printerData, token }) => {
    console.log('Printer Data Received:', printerData);
    // Need to add logic to add data
    try {
        const response = await fetch('http://localhost:3000/printers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
             },
            body: JSON.stringify(printerData),
        });
        const result = await response.json();
        if (result.success) {
            console.log('Printer added!', result.message);
            event.reply('add-printer-success', result.message);
        } else {
            console.error('Error adding Printer:', result.message);
            event.reply('add-printer-error', result.message);
        }
    } catch (error) {
        console.error('Failed to add printer:', error);
    }
});

ipcMain.on('add-user', async (event, { userData, token }) => {
    console.log('User Data Received:', userData);
    try {
        const response = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
             },
            body: JSON.stringify(userData),
        });
        const result = await response.json();
        if (response.ok) {
            console.log('User added!', result);
            event.reply('add-user-success', result);
        } else {
            console.error('Error adding user:', result.message);
            event.reply('add-user-error', result.message);
        }
    } catch (error) {
        console.error('Failed to add user:', error);
    }
});

/*
ipcRenderer.on('add-pc-success', (event, message) => {
    alert(`Success: ${message}`);
    // close the window or clear the form
});


ipcRenderer.on('add-pc-error', (event, message) => {
    alert(`Error: ${message}`);
});

ipcRenderer.on('add-printer-success', (event, message) => {
    alert(`Success: ${message}`);
});

ipcRenderer.on('add-printer-error', (event, message) => {
    alert(`Error: ${message}`);
});
*/