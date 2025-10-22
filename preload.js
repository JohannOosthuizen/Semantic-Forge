const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs').promises;

contextBridge.exposeInMainWorld('electronAPI', {
    restoreSession: () => ipcRenderer.invoke('restore-session'),
    storeGet: (key) => ipcRenderer.invoke('store-get', key),
    storeSet: (key, value) => ipcRenderer.send('store-set', key, value),
    saveFile: async (content, filePath) => fs.writeFile(filePath, content),
    openAuth: (url) => ipcRenderer.send('open-auth', url),
});