const { app, BrowserWindow, ipcMain, session, shell, dialog } = require('electron');  // Add dialog here
const path = require('path');
const Store = require('electron-store').default;  // Assuming the ESM fix from earlier

const store = new Store();

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webviewTag: true  // From previous fixes
        },
    });

    win.loadFile('index.html');

    // Clear the HTTP cache
    session.defaultSession.clearCache()
        .then(() => console.log('Cache cleared successfully'))
        .catch(error => console.error('Error clearing cache:', error));

    // Clear all storage data (including local storage, IndexedDB, etc.)
    session.defaultSession.clearStorageData()
        .then(() => console.log('Storage data cleared successfully'))
        .catch(error => console.error('Error clearing storage data:', error));

    ipcMain.handle('restore-session', () => ({
        lastUrl: store.get('lastUrl', 'https://www.google.com'),
        bookmarks: store.get('bookmarks', []),
    }));

    ipcMain.on('open-auth', (event, authUrl) => {
        shell.openExternal(authUrl);
    });

    ipcMain.handle('store-get', (event, key) => store.get(key));
    ipcMain.on('store-set', (event, key, value) => store.set(key, value));

    // New: IPC handler for showSaveDialog
    ipcMain.handle('show-save-dialog', async (event, options) => {
        return await dialog.showSaveDialog(options);
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});