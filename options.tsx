import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const Options: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    // On component mount, load the saved API key from storage
    useEffect(() => {
        chrome.storage.sync.get('geminiApiKey', (data) => {
            if (data.geminiApiKey) {
                setApiKey(data.geminiApiKey);
            }
        });
    }, []);

    // Handle saving the API key
    const handleSave = () => {
        if (!apiKey) {
            setStatus('Please enter an API key.');
            return;
        }
        chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
            if (chrome.runtime.lastError) {
                setStatus(`Error: ${chrome.runtime.lastError.message}`);
            } else {
                setStatus('API key saved successfully!');
                setTimeout(() => setStatus(''), 3000); // Clear status after 3 seconds
            }
        });
    };

    return (
        <div className="options-container">
            <header className="options-header">
                <h1>Semantic Forge Options</h1>
                <p>Configure your AI-powered browser extension.</p>
            </header>

            <main className="options-main">
                <h2>Set Gemini API Key</h2>
                <p>
                    Please enter your Gemini API key below. This key is required for the extension to function.
                    You can obtain a key from{' '}
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                        Google AI Studio
                    </a>.
                </p>
                <div className="input-group">
                    <input
                        type="password"
                        className="input-field"
                        placeholder="Enter your Gemini API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                    <button className="button-save" onClick={handleSave}>
                        Save Key
                    </button>
                </div>
                {status && <p className="status-message">{status}</p>}
            </main>
        </div>
    );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>
);
