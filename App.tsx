import React, { useState, useEffect } from 'react';
import { BrowserTheme } from './types';
import ThemeManager from './components/ThemeManager';
import Spinner from './components/Spinner';
import { forgeHtmlFromText } from './services/geminiService';

const defaultThemes: BrowserTheme[] = [
    { name: 'Default Light', prompt: 'A clean, modern, and accessible web design with a light color scheme, sans-serif fonts, and plenty of white space. Professional and clear.' },
    { name: 'Default Dark', prompt: 'A sleek, modern dark mode design. Use a dark gray or navy background with high-contrast white or light-colored text. Use accent colors sparingly.' },
    { name: 'Blueprint', prompt: 'Re-render the website as a technical architectural blueprint. Use white lines and text on a deep blue background. Include grid lines and annotations.' },
    { name: 'Claymorphism', prompt: 'A soft, 3D, clay-like aesthetic. Use a pastel color palette with smooth, rounded shapes and subtle shadows to create a friendly, tactile feel.' },
    { name: 'Memphis Design', prompt: 'A vibrant, playful 1980s Memphis Design theme. Use a riot of bright, contrasting colors and bold geometric patterns like squiggles, triangles, and circles. Employ a mix of sans-serif and novelty fonts in a seemingly chaotic but energetic layout.' },
    { name: 'Letterpress', prompt: 'An elegant, tactile letterpress design. Use an off-white, textured paper background. Text should be set in a classic serif font with a subtle debossed effect. Use a limited color palette of black, deep red, and cream. The layout should be clean and structured, reminiscent of a high-quality print.' },
    { name: 'Web Brutalism', prompt: 'A raw, unapologetic brutalist web design. Use a monospaced font for all text. The color scheme is strictly black and white. Layout is a rigid grid of sharp-cornered rectangles. No gradients, shadows, or decorative elements. Function over form is paramount.' },
    { name: 'Art Nouveau', prompt: 'An elegant design inspired by the Art Nouveau movement. Feature flowing, organic lines and decorative motifs based on nature (vines, flowers, insects). Use a color palette of muted earth tones (olive green, mustard yellow, deep burgundy) and graceful, stylized serif fonts.' },
    { name: 'Shakespeare', prompt: 'First, rewrite the entire page content in the authentic and eloquent style of a 16th-century Shakespearean playwright. Use period-appropriate vocabulary (e.g., "hark," "perchance," "verily"), poetic cadence, and classical metaphors, while remaining faithful to the original message. Then, create the HTML page with the following "Elizabethan Era" theme. The page background should be parchment (#f5eecf). The font should be a classic serif like Garamond or Times New Roman, in a dark brown color (#5d4037). The rewritten text must be in a single, centered container (max-width: 600px) with a simple 2px solid dark brown border. The very first letter of the text must be a large "drop cap" to mimic a manuscript.' },
];

// Fix: Removed API key storage key to align with guideline of using process.env.API_KEY
const THEMES_STORAGE_KEY = 'semantic-forge-themes';
const ACTIVE_THEME_NAME_STORAGE_KEY = 'semantic-forge-active-theme-name';

// This is the main UI for the Chrome Extension's popup.
const App: React.FC = () => {
    const [savedThemes, setSavedThemes] = useState<BrowserTheme[]>(defaultThemes);
    const [activeTheme, setActiveTheme] = useState<BrowserTheme>(defaultThemes[1] || defaultThemes[0]);
    const [isForging, setIsForging] = useState(false);
    const [forgeError, setForgeError] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isThemeManagerOpen, setIsThemeManagerOpen] = useState(false);
    // Fix: Removed apiKeyStatus state and related logic to comply with API key guidelines.

    // Load data from chrome.storage on component mount
    useEffect(() => {
        if (window.chrome && chrome.storage) {
            // Fix: Removed API key from storage retrieval.
            chrome.storage.local.get(
                [THEMES_STORAGE_KEY, ACTIVE_THEME_NAME_STORAGE_KEY],
                (result) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error loading data:', chrome.runtime.lastError);
                        return;
                    }

                    // Load themes
                    const loadedThemes = result[THEMES_STORAGE_KEY];
                    if (Array.isArray(loadedThemes) && loadedThemes.length > 0) {
                        setSavedThemes(loadedThemes);
                        // Determine active theme based on loaded themes
                        const activeName = result[ACTIVE_THEME_NAME_STORAGE_KEY];
                        const foundTheme = activeName ? loadedThemes.find(t => t.name === activeName) : null;
                        if (foundTheme) {
                            setActiveTheme(foundTheme);
                        } else {
                            setActiveTheme(loadedThemes[1] || loadedThemes[0]);
                        }
                    }
                }
            );
        }
    }, []);

    // Save themes to chrome.storage when they change
    useEffect(() => {
        if (window.chrome && chrome.storage && savedThemes !== defaultThemes) {
            chrome.storage.local.set({ [THEMES_STORAGE_KEY]: savedThemes });
        }
    }, [savedThemes]);

    // Save active theme name when it changes
    useEffect(() => {
        if (window.chrome && chrome.storage) {
            chrome.storage.local.set({ [ACTIVE_THEME_NAME_STORAGE_KEY]: activeTheme.name });
        }
    }, [activeTheme]);

    // Fix: Removed handleOpenOptions as API key management UI is no longer needed.
    
    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTheme = savedThemes.find(t => t.name === e.target.value);
        if (selectedTheme) {
            setActiveTheme(selectedTheme);
        }
    };

    const handleForge = async () => {
        if (!(window.chrome && chrome.tabs)) {
            setForgeError("This app must be run as a Chrome extension.");
            return;
        }

        console.log('Forge process started.');
        setIsForging(true);
        setForgeError('');
        setLoadingMessage(`Reading page content...`);

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || !tab.id || !tab.url?.startsWith('http')) {
            setForgeError('Cannot forge this page. Try a standard website (http/https).');
            setIsForging(false);
            return;
        }

        try {
            // Send message to content script to get the page's text content
            console.log('Requesting page content from content script...');
            const response = await chrome.tabs.sendMessage(tab.id, { action: "getTextContent" });
            
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                setForgeError('Could not communicate with the page. Please reload the page and try again.');
                setIsForging(false);
                return;
            }

            const pageContent = response?.textContent;
            if (!pageContent || pageContent.trim().length < 50) {
                console.error('Failed to extract meaningful text from the page.');
                setForgeError('Could not extract meaningful text from the page.');
                setIsForging(false);
                return;
            }
            console.log('Successfully received page content.');
            
            setLoadingMessage(`Designing with "${activeTheme.name}"...`);

            // Get the API key from the background script
            console.log('Requesting API key from background script...');
            const apiKeyResponse = await chrome.runtime.sendMessage({ action: 'getApiKey' });
            if (chrome.runtime.lastError || apiKeyResponse.error) {
                throw new Error(chrome.runtime.lastError?.message || apiKeyResponse.error);
            }
            if (!apiKeyResponse.apiKey) {
                throw new Error('Gemini API key not found. Please set it in the options page.');
            }
            console.log('Successfully received API key.');

            console.log('Calling Gemini service to forge HTML...');
            const forgedHtml = await forgeHtmlFromText(pageContent, activeTheme.prompt, apiKeyResponse.apiKey);
            console.log('Successfully received forged HTML from Gemini service.');
            
            setLoadingMessage('Applying new design...');
            // Send message to content script to replace the page's content
            await chrome.tabs.sendMessage(tab.id, { action: "replaceContent", html: forgedHtml });
            console.log('Successfully sent new design to content script.');

            // Success, close the popup
            window.close();

        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An API error or network issue occurred.';
            setForgeError(errorMessage);
            setIsForging(false);
        }
    };
    
    // Fix: Removed conditional rendering for API key status.
    // The component now directly renders the main forging UI.
    return (
        <div className="app-container">
            <div className="header">
                <h1>Semantic Forge</h1>
                <button onClick={() => setIsThemeManagerOpen(true)} className="button-icon" aria-label="Open theme manager">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label htmlFor="theme-select" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Select Theme</label>
                    <select
                        id="theme-select"
                        value={activeTheme.name}
                        onChange={handleThemeChange}
                    >
                        {savedThemes.map(theme => (
                            <option key={theme.name} value={theme.name}>{theme.name}</option>
                        ))}
                    </select>
                </div>

                <button 
                    onClick={handleForge} 
                    disabled={isForging} 
                    className="button-primary"
                >
                    {isForging && <Spinner isSmall={true} />}
                    <span>{isForging ? loadingMessage : 'Forge this Page'}</span>
                </button>

                {forgeError && (
                    <div role="alert" className="forge-error-box">
                       <p className="error-title">Forge Failed</p>
                       <p className="error-message">{forgeError}</p>
                    </div>
                )}
            </div>

            {isThemeManagerOpen && (
                <ThemeManager
                    themes={savedThemes}
                    setThemes={setSavedThemes}
                    onClose={() => setIsThemeManagerOpen(false)}
                />
            )}
        </div>
    );
};
export default App;