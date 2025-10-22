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
let llmEndpoint, llmModel, apiKey, useDocling;
let userPrompts = [];

async function loadSettings() {
    llmEndpoint = await window.electronAPI.storeGet('llmEndpoint') || 'http://localhost:1234/v1';
    llmModel = await window.electronAPI.storeGet('llmModel') || 'local-model';
    apiKey = await window.electronAPI.storeGet('apiKey') || 'lm-studio';
    useDocling = await window.electronAPI.storeGet('useDocling') || false;
    const storedPrompts = await window.electronAPI.storeGet('userPrompts');
    userPrompts = Array.isArray(storedPrompts) ? storedPrompts : [];
    
    llmEndpointInput.value = llmEndpoint;
    llmModelInput.value = llmModel;
    apiKeyInput.value = apiKey;
    useDoclingCheckbox.checked = useDocling;
}

document.addEventListener('DOMContentLoaded', () => {
    // Restore session and initialize
    (async () => {
        await loadSettings();
        loadThemes(); // Initial theme load
        const session = await window.electronAPI.restoreSession();
        urlInput.value = session.lastUrl;
        webview.loadURL(session.lastUrl);
    })();
});

// Navigation
goBtn.addEventListener('click', () => {
    let url = urlInput.value.trim();
    if (url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url;
        }
        webview.loadURL(url);
    }
});
backBtn.addEventListener('click', () => webview.goBack());
forwardBtn.addEventListener('click', () => webview.goForward());
refreshBtn.addEventListener('click', () => webview.reload());
webview.addEventListener('did-navigate', () => {
    urlInput.value = webview.getURL();
    window.electronAPI.storeSet('lastUrl', urlInput.value);
});

// Preset Themes
const presetThemes = {
    none: ``,
    dark: `body { background-color: #121212; color: #fff; } a { color: #bb86fc; }`,
    'high-contrast': `body { background-color: #000; color: #fff; font-size: 1.2em; } a { color: #ffff00; }`,
    'solarized-dark': `body { background-color: #002b36; color: #839496; } a { color: #268bd2; }`,
    'solarized-light': `body { background-color: #fdf6e3; color: #657b83; } a { color: #268bd2; }`,
    'nord': `body { background-color: #2e3440; color: #d8dee9; } a { color: #81a1c1; }`,
    'gruvbox': `body { background-color: #282828; color: #ebdbb2; } a { color: #83a598; }`,
};

webview.addEventListener('dom-ready', () => {
    loadThemes();
    applySelectedStyle();
});

// Load Theme Selector
function loadThemes() {
    console.log('Loading themes...');
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
        const prompt = `Generate CSS styles for a ${userPrompt} theme for web pages, focusing on body, links, headings. Output only the CSS code.`;
        const result = await window.electronAPI.llmRequest(prompt);
        if (result.success) {
            return result.content.replace(/```css\n?|\n?```/g, '').trim();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('CSS Generation Error:', error);
        alert('Failed to generate CSS. Using default.');
        return presetThemes.none;
    }
}

function applyCustomStyle(css) {
    if (!css) return;
    const js = `
    (function() {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '${css.replace(/\n/g, '').replace(/'/g, "\\'")}';
      document.head.appendChild(style);
    })();
  `;
    webview.executeJavaScript(js).catch(console.error);
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

// Auth Handling
webview.addEventListener('will-navigate', (event) => {
    if (event.url.includes('login') || event.url.includes('auth')) {
        event.preventDefault();
        window.electronAPI.openAuth(event.url);
    }
});

// LLM Send
llmBtn.addEventListener('click', sendToLLM);
async function sendToLLM() {
    try {
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

        const inputContent = await window.electronAPI.convertToMarkdown(selectedHtml, useDocling);

        const result = await window.electronAPI.llmRequest(inputContent);

        if (result.success) {
            const llmText = result.content;
            llmOutput.innerHTML = llmText.replace(/\n/g, '<br>');
            sidebar.classList.remove('hidden');
        } else {
            throw new Error(result.error);
        }

    } catch (error) {
        console.error('Error in sendToLLM:', error);
        llmOutput.innerHTML = `Error: ${error.message}.<br><br>Check your settings and ensure your local LLM server (like LM Studio) is running.`;
        sidebar.classList.remove('hidden');
    }
}

// Sidebar Actions
closeSidebar.addEventListener('click', () => {
    sidebar.classList.add('hidden');
    llmOutput.innerHTML = '';
});

exportBtn.addEventListener('click', async () => {
    const result = await window.electronAPI.showSaveDialog({ defaultPath: 'llm-response.md' });
    const filePath = result.filePath;
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
    webview.executeJavaScript(injectJs).catch(console.error);
});

// Auto-apply on load
webview.addEventListener('dom-ready', applySelectedStyle);

// Debug Load Events (optional, from previous suggestion)
webview.addEventListener('did-fail-load', (e) => {
    console.error('Load failed:', e.errorDescription, 'Code:', e.errorCode);
    alert('Page load failed: ' + e.errorDescription);
});
webview.addEventListener('did-finish-load', () => {
    console.log('Page loaded successfully');
});
webview.addEventListener('console-message', (e) => {
    console.log('Webview console:', e.message);
});