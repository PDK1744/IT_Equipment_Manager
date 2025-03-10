const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const { join } = require('path');
const fetch = require('node-fetch');
const { updateElectronApp } = require('update-electron-app');

//updateElectronApp();


require('./server');


let win;

if (require('electron-squirrel-startup')) return app.quit();


const getApiUrl = () => {
    if (!global.serverPort) {
        console.error('Server port not initialized');
        return 'http://localhost:3000'; // fallback port
    }
    return `http://localhost:${global.serverPort}`;
};


function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const win = new BrowserWindow({
        width: width,
        height: height,
        frame: true,
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
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

// Failed login message
ipcMain.handle('show-alert', async (event, message) => {
    return dialog.showMessageBox({
        type: 'info',
        title: 'IT Equipment Manager',
        message: message,
        buttons: ['OK']
    });
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
            preload: join(__dirname, 'preload.js'),
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
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/pcs`, {
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
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/printers`, {
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

ipcMain.handle('add-user', async (event, { userData, token }) => {
    
    try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
             },
            body: JSON.stringify(userData),
        });
        const data = await response.json();

        return {
            success: response.status === 201,
            message: response.status === 201 ? 'User added successfully!' : (data.message || 'Failed to create user')
        };
    } catch (error) {
        console.error('Failed to add user:', error);
        return {
            success: false,
            message: error.message || 'Failed to create user'
        };
    }
        
        /*if (response.ok) {
            console.log('User added!', result);
            //event.reply('add-user-success', result);
        } else {
            console.error('Error adding user:', result.message);
            //event.reply('add-user-error', result.message);
        }
    } catch (error) {
        console.error('Failed to add user:', error);
    }*/
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