const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs').promises;
const axios = require('axios');
const OpenAI = require('openai');
const TurndownService = require('turndown');
const { PythonShell } = require('python-shell');
const log = require('electron-log');

contextBridge.exposeInMainWorld('electronAPI', {
    restoreSession: () => ipcRenderer.invoke('restore-session'),
    storeGet: (key) => ipcRenderer.invoke('store-get', key),
    storeSet: (key, value) => ipcRenderer.send('store-set', key, value),
    saveFile: async (content, filePath) => fs.writeFile(filePath, content),
    openAuth: (url) => ipcRenderer.send('open-auth', url),
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
});

contextBridge.exposeInMainWorld('modules', {
    axios,
    OpenAI,
    TurndownService,
    PythonShell,
    log,
});