import React, { useState } from 'react';
import { BrowserTheme } from '../types';
import ThemeManager from './ThemeManager';

interface BrowserChromeProps {
    url: string;
    onNavigate: (url: string) => void;
    onBack: () => void;
    onForward: () => void;
    onReload: () => void;
    canGoBack: boolean;
    canGoForward: boolean;
    onForge: () => void;
    isForging: boolean;
    themes: BrowserTheme[];
    setThemes: React.Dispatch<React.SetStateAction<BrowserTheme[]>>;
    activeTheme: BrowserTheme;
    setActiveTheme: (theme: BrowserTheme) => void;
}

const BrowserChrome: React.FC<BrowserChromeProps> = ({
    url, onNavigate, onBack, onForward, onReload, canGoBack, canGoForward,
    onForge, isForging, themes, setThemes, activeTheme, setActiveTheme
}) => {
    const [inputValue, setInputValue] = useState(url);
    const [isThemeManagerOpen, setIsThemeManagerOpen] = useState(false);

    React.useEffect(() => {
        setInputValue(url);
    }, [url]);

    const handleNavigate = () => {
        let finalUrl = inputValue;
        if (!inputValue.startsWith('http://') && !inputValue.startsWith('https://')) {
            finalUrl = 'https://' + inputValue;
        }
        onNavigate(finalUrl);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleNavigate();
        }
    };
    
    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTheme = themes.find(t => t.name === e.target.value);
        if (selectedTheme) {
            setActiveTheme(selectedTheme);
        }
    }

    return (
        <>
            <header className="bg-gray-100 dark:bg-gray-800 p-2 flex items-center gap-2 border-b border-gray-300 dark:border-gray-700 shadow-sm z-10">
                <div className="flex items-center gap-1">
                    <button onClick={onBack} disabled={!canGoBack} className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-30">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" /></svg>
                    </button>
                    <button onClick={onForward} disabled={!canGoForward} className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-30">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
                    </button>
                    <button onClick={onReload} className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4a8 8 0 0113.89 4.25M20 20a8 8 0 01-13.89-4.25" /></svg>
                    </button>
                </div>

                <div className="flex-1 relative">
                    <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://example.com"
                    />
                </div>
                
                <div className="flex items-center gap-2">
                     <select
                        value={activeTheme.name}
                        onChange={handleThemeChange}
                        className="bg-gray-200 dark:bg-gray-700 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                         {themes.map(theme => (
                            <option key={theme.name} value={theme.name}>{theme.name}</option>
                         ))}
                      </select>
                      <button onClick={() => setIsThemeManagerOpen(true)} className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </button>
                    <button onClick={onForge} disabled={isForging} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait transition-colors whitespace-nowrap">
                       {isForging ? 'Forging HTML...' : 'Textual Forge'}
                    </button>
                </div>
            </header>
            {isThemeManagerOpen && (
                <ThemeManager
                    themes={themes}
                    setThemes={setThemes}
                    onClose={() => setIsThemeManagerOpen(false)}
                />
            )}
        </>
    );
};

export default BrowserChrome;