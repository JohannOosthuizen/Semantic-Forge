const { app, BrowserWindow, ipcMain, session, shell } = require('electron');
const path = require('path');
const Store = require('electron-store').default;
const store = new Store();

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true  // Add this line
        },
    });

    win.loadFile('index.html');

    ipcMain.handle('restore-session', () => ({
        lastUrl: store.get('lastUrl', 'https://example.com'),
        bookmarks: store.get('bookmarks', []),
    }));

    ipcMain.on('open-auth', (event, authUrl) => {
        shell.openExternal(authUrl);
    });

    ipcMain.handle('store-get', (event, key) => store.get(key));
    ipcMain.on('store-set', (event, key, value) => store.set(key, value));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});