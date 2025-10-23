const { app, BrowserWindow, ipcMain, session, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const Store = require('electron-store').default;
const axios = require('axios');
const OpenAI = require('openai');
const TurndownService = require('turndown');
const { spawn } = require('child_process');
const tmp = require('tmp');
const util = require('util');

const store = new Store();

// Helper function for Markdown conversion
function convertToMarkdown(htmlContent, useDocling) {
    return new Promise((resolve, reject) => {
        console.log(`[convertToMarkdown] Starting conversion. useDocling: ${useDocling}`);
        if (useDocling) {
            const pythonScript = `
import sys
import traceback
import tempfile
import os
from docling.document_converter import DocumentConverter

temp_path = None
try:
    html_content = sys.stdin.read()
    
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.html', encoding='utf-8') as f:
        f.write(html_content)
        temp_path = f.name

    converter = DocumentConverter()
    result = converter.convert(temp_path)
    md = result.document.export_to_markdown()
    print(md)
except Exception as e:
    print(traceback.format_exc(), file=sys.stderr)
    sys.exit(1)
finally:
    if temp_path and os.path.exists(temp_path):
        os.unlink(temp_path)
`;
            const python = spawn('python', ['-c', pythonScript]);
            
            let stdout = '';
            let stderr = '';

            python.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            python.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            python.on('close', (code) => {
                if (code !== 0) {
                    console.warn('[convertToMarkdown] Docling conversion failed, falling back to Turndown.', stderr);
                    const turndown = new TurndownService();
                    resolve(turndown.turndown(htmlContent));
                } else {
                    console.log('[convertToMarkdown] Docling conversion successful.');
                    resolve(stdout);
                }
            });

            python.stdin.write(htmlContent || '');
            python.stdin.end();
        } else {
            console.log('[convertToMarkdown] Using Turndown for conversion.');
            const turndown = new TurndownService();
            resolve(turndown.turndown(htmlContent));
        }
    });
}


function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webviewTag: true
        },
    });

    win.loadFile('index.html');

    session.defaultSession.clearCache().catch(console.error);
    session.defaultSession.clearStorageData().catch(console.error);

    ipcMain.handle('restore-session', () => ({
        lastUrl: store.get('lastUrl', 'https://www.google.com'),
        bookmarks: store.get('bookmarks', []),
    }));

    ipcMain.on('open-auth', (event, authUrl) => {
        shell.openExternal(authUrl);
    });

    ipcMain.handle('store-get', (event, key) => store.get(key));
    ipcMain.on('store-set', (event, key, value) => store.set(key, value));

    ipcMain.handle('show-save-dialog', async (event, options) => {
        return await dialog.showSaveDialog(options);
    });

    ipcMain.handle('save-file', async (event, content, filePath) => {
        try {
            await fs.writeFile(filePath, content);
            return { success: true };
        } catch (error) {
            console.error('Failed to save file:', error);
            return { success: false, error: error.message };
        }
    });

    // IPC handler for Markdown conversion
    ipcMain.handle('convert-to-markdown', async (event, html, useDocling) => {
        return await convertToMarkdown(html, useDocling);
    });

    // IPC handler for LLM requests
    ipcMain.handle('llm-request', async (event, inputContent) => {
        const llmEndpoint = store.get('llmEndpoint', 'http://localhost:1234/v1');
        const llmModel = store.get('llmModel', 'local-model');
        const apiKey = store.get('apiKey', 'lm-studio');

        try {
            // 1. Health check
            await axios.get(`${llmEndpoint}/models`);

            // 2. OpenAI call
            const openai = new OpenAI({ baseURL: llmEndpoint, apiKey });
            const response = await openai.chat.completions.create({
                model: llmModel,
                messages: [{ role: 'user', content: `Re-write or analyze this snippet flexibly: \n\n${inputContent}` }],
            });

            return { success: true, content: response.choices[0].message.content };

        } catch (error) {
            console.error('LLM Request Error:', error);
            return { success: false, error: error.message };
        }
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});