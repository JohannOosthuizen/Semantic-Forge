const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    restoreSession: () => ipcRenderer.invoke('restore-session'),
    storeGet: (key) => ipcRenderer.invoke('store-get', key),
    storeSet: (key, value) => ipcRenderer.send('store-set', key, value),
    saveFile: (content, filePath) => ipcRenderer.invoke('save-file', content, filePath),
    openAuth: (url) => ipcRenderer.send('open-auth', url),
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    llmRequest: (prompt, isThemePrompt) => ipcRenderer.invoke('llm-request', prompt, isThemePrompt),
    convertToMarkdown: (html, useDocling) => ipcRenderer.invoke('convert-to-markdown', html, useDocling),
});