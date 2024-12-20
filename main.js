const { app, BrowserWindow, ipcMain, dialog, ipcRenderer, screen } = require('electron');
const path = require('path');
const secretKey = process.env.JWT_SECRET || 'fallback-secret';
const jwt = require('jsonwebtoken');

require('./server');

let win;


function createWindow(file) {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    

    win = new BrowserWindow({
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

    win.loadFile(file);

    

    
    //win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow('src/UI/login.html');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});



/* app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
}); */

ipcMain.on('login-success', () => {
    if (win) {
        win.close();
        //win = null;
    }
    

    createWindow('src/UI/index.html');
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
ipcMain.on('add-pc', async (event, pcData) => {
    console.log('PC Data Received:', pcData);
    // Need to add logic to add data
    try {
        const response = await fetch('http://localhost:3000/pcs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

ipcMain.on('add-printer', async (event, printerData) => {
    console.log('Printer Data Received:', printerData);
    // Need to add logic to add data
    try {
        const response = await fetch('http://localhost:3000/printers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

ipcMain.on('add-user', async (event, { userData, token}) => {
    try {
        console.log('Received data in main process:', { userData, token });
        const decoded = jwt.verify(token, secretKey);
        if (decoded.role !== 'admin') {
            throw new Error('Only admins can add users');
        }
        const response = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                
            },
            body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to add new user');
        }
        event.sender.send('add-user-success', result);

        
    } catch (error) {
        console.error('Error adding user:', error);

        event.sender.send('add-user-failed', error.message);
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