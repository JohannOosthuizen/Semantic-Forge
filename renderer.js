const OpenAI = require('openai');
const TurndownService = require('turndown');
const { PythonShell } = require('python-shell');
const axios = require('axios');
const log = require('electron-log');
//require('@electron/remote').initialize();
const { dialog } = require('@electron/remote');

const webview = document.getElementById('webview');
const urlInput = document.getElementById('url-input');
const goBtn = document.getElementById('go');
const backBtn = document.getElementById('back');
const forwardBtn = document.getElementById('forward');
const refreshBtn = document.getElementById('refresh');
const styleBtn = document.getElementById('apply-style');
const llmBtn = document.getElementById('send-to-llm');
const themeSelect = document.getElementById('theme-select');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const llmEndpointInput = document.getElementById('llm-endpoint');
const llmModelInput = document.getElementById('llm-model');
const apiKeyInput = document.getElementById('api-key');
const useDoclingCheckbox = document.getElementById('use-docling');
const newPromptTextarea = document.getElementById('new-prompt');
const addPromptBtn = document.getElementById('add-prompt');
const promptList = document.getElementById('prompt-list');
const saveSettings = document.getElementById('save-settings');
const closeSettings = document.getElementById('close-settings');
const sidebar = document.getElementById('llm-sidebar');
const llmOutput = document.getElementById('llm-output');
const injectBtn = document.getElementById('inject-rewrite');
const exportBtn = document.getElementById('export-response');
const closeSidebar = document.getElementById('close-sidebar');

// Load settings
let llmEndpoint = window.electronAPI.storeGet('llmEndpoint') || 'http://localhost:1234/v1';
let llmModel = window.electronAPI.storeGet('llmModel') || 'local-model';
let apiKey = window.electronAPI.storeGet('apiKey') || 'lm-studio';
let useDocling = window.electronAPI.storeGet('useDocling') || false;
let userPrompts = window.electronAPI.storeGet('userPrompts') || [];  // Array of strings
llmEndpointInput.value = llmEndpoint;
llmModelInput.value = llmModel;
apiKeyInput.value = apiKey;
useDoclingCheckbox.checked = useDocling;

// Restore session
(async () => {
    const session = await window.electronAPI.restoreSession();
    urlInput.value = session.lastUrl;
    webview.loadURL(session.lastUrl);
})();

// Navigation
goBtn.addEventListener('click', () => webview.loadURL(urlInput.value));
backBtn.addEventListener('click', () => webview.goBack());
forwardBtn.addEventListener('click', () => webview.goForward());
refreshBtn.addEventListener('click', () => webview.reload());
webview.addEventListener('did-navigate', () => {
    urlInput.value = webview.getURL();
    window.electronAPI.storeSet('lastUrl', urlInput.value);
});

// Preset Themes
const presetThemes = {
    default: `body { background-color: #fff; color: #000; font-family: Arial; }`,
    dark: `body { background-color: #121212; color: #fff; } a { color: #bb86fc; }`,
    'high-contrast': `body { background-color: #000; color: #fff; font-size: 1.2em; } a { color: #ffff00; }`,
};

// Load Theme Selector
function loadThemes() {
    themeSelect.innerHTML = '';
    Object.keys(presetThemes).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        themeSelect.appendChild(option);
    });
    userPrompts.forEach((prompt, index) => {
        const option = document.createElement('option');
        option.value = `ai-${index}`;
        option.textContent = `AI: ${prompt.slice(0, 20)}${prompt.length > 20 ? '...' : ''}`;
        themeSelect.appendChild(option);
    });
}
loadThemes();

// Apply Style
styleBtn.addEventListener('click', applySelectedStyle);
themeSelect.addEventListener('change', applySelectedStyle);
async function applySelectedStyle() {
    const value = themeSelect.value;
    let css;
    if (value.startsWith('ai-')) {
        const index = parseInt(value.slice(3));
        const prompt = userPrompts[index];
        css = await generateCssFromLlm(prompt);
    } else {
        css = presetThemes[value];
    }
    applyCustomStyle(css);
}

async function generateCssFromLlm(userPrompt) {
    try {
        await axios.get(`${llmEndpoint}/models`);
        const openai = new OpenAI({ baseURL: llmEndpoint, apiKey });
        const response = await openai.chat.completions.create({
            model: llmModel,
            messages: [{ role: 'user', content: `Generate CSS styles for a ${userPrompt} theme for web pages, focusing on body, links, headings. Output only the CSS code.` }],
        });
        return response.choices[0].message.content.replace(/```css\n?|\n?```/g, '').trim();
    } catch (error) {
        log.error('CSS Generation Error:', error);
        alert('Failed to generate CSS. Using default.');
        return presetThemes.default;
    }
}

function applyCustomStyle(css) {
    const js = `
    (function() {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '${css.replace(/\n/g, '').replace(/'/g, "\\'")}';
      document.head.appendChild(style);
    })();
  `;
    webview.executeJavaScript(js).catch(log.error);
}

// Settings
settingsBtn.addEventListener('click', () => {
    loadPromptList();
    settingsModal.classList.remove('hidden');
});
closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));
saveSettings.addEventListener('click', () => {
    llmEndpoint = llmEndpointInput.value;
    llmModel = llmModelInput.value;
    apiKey = apiKeyInput.value;
    useDocling = useDoclingCheckbox.checked;
    window.electronAPI.storeSet('llmEndpoint', llmEndpoint);
    window.electronAPI.storeSet('llmModel', llmModel);
    window.electronAPI.storeSet('apiKey', apiKey);
    window.electronAPI.storeSet('useDocling', useDocling);
    loadThemes();  // Refresh after potential prompt changes
    settingsModal.classList.add('hidden');
});

// Prompt Management
addPromptBtn.addEventListener('click', () => {
    const prompt = newPromptTextarea.value.trim();
    if (prompt) {
        userPrompts.push(prompt);
        window.electronAPI.storeSet('userPrompts', userPrompts);
        newPromptTextarea.value = '';
        loadPromptList();
        loadThemes();
    }
});

function loadPromptList() {
    promptList.innerHTML = '';
    userPrompts.forEach((prompt, index) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between mb-1';
        li.innerHTML = `<span>${prompt}</span><button class="text-red-500 hover:text-red-700" data-index="${index}">Delete</button>`;
        promptList.appendChild(li);
    });
    promptList.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            userPrompts.splice(index, 1);
            window.electronAPI.storeSet('userPrompts', userPrompts);
            loadPromptList();
            loadThemes();
        });
    });
}

// Auth Handling (unchanged)
webview.addEventListener('will-navigate', (event) => {
    if (event.url.includes('login') || event.url.includes('auth')) {
        event.preventDefault();
        window.electronAPI.openAuth(event.url);
    }
});

// LLM Send (updated with apiKey)
llmBtn.addEventListener('click', sendToLLM);
async function sendToLLM() {
    try {
        await axios.get(`${llmEndpoint}/models`);

        const selectedHtml = await webview.executeJavaScript(`
      (function() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const container = document.createElement('div');
          container.appendChild(selection.getRangeAt(0).cloneContents());
          return '<!DOCTYPE html><html><body>' + container.innerHTML + '</body></html>';
        }
        return document.body.innerHTML.substring(0, 5000);
      })();
    `);

        if (!selectedHtml) {
            alert('No content selected.');
            return;
        }

        let inputContent = selectedHtml;
        if (useDocling) {
            try {
                inputContent = await convertToMarkdown(selectedHtml);
            } catch {
                log.warn('Docling failed; falling back.');
                const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
                inputContent = turndown.turndown(selectedHtml);
            }
        } else {
            const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
            inputContent = turndown.turndown(selectedHtml);
        }

        const openai = new OpenAI({ baseURL: llmEndpoint, apiKey });
        const response = await openai.chat.completions.create({
            model: llmModel,
            messages: [{ role: 'user', content: `Re-write or analyze this snippet flexibly: \n\n${inputContent}` }],
        });

        const llmText = response.choices[0].message.content;
        llmOutput.innerHTML = llmText.replace(/\n/g, '<br>');
        sidebar.classList.remove('hidden');
    } catch (error) {
        log.error('Error:', error);
        llmOutput.innerHTML = 'Error: Check settings and LM Studio.';
        sidebar.classList.remove('hidden');
    }
}

function convertToMarkdown(htmlContent) {
    return new Promise((resolve, reject) => {
        const options = {
            mode: 'text',
            pythonOptions: ['-u'],
            args: [htmlContent],
        };

        PythonShell.runString(`
import sys
from docling.document_converter import DocumentConverter
from io import BytesIO

html_content = sys.argv[1]
converter = DocumentConverter()
result = converter.convert_from_bytes(BytesIO(html_content.encode('utf-8')), 'text/html')
md = result.document.export_to_markdown()
print(md)
    `, options, (err, results) => {
            if (err) reject(err);
            else resolve(results[0]);
        });
    });
}

// Sidebar Actions
closeSidebar.addEventListener('click', () => {
    sidebar.classList.add('hidden');
    llmOutput.innerHTML = '';
});

exportBtn.addEventListener('click', async () => {
    const { filePath } = await dialog.showSaveDialog({ defaultPath: 'llm-response.md' });
    if (filePath) await window.electronAPI.saveFile(llmOutput.textContent, filePath);
});

injectBtn.addEventListener('click', () => {
    const llmText = llmOutput.textContent;
    const injectJs = `
    (function() {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode('${llmText.replace(/'/g, "\\'")}'));
      }
    })();
  `;
    webview.executeJavaScript(injectJs).catch(log.error);
});

// Auto-apply on load
webview.addEventListener('dom-ready', applySelectedStyle);