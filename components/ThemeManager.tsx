import React, { useState } from 'react';
import { BrowserTheme } from '../types';

interface ThemeManagerProps {
    themes: BrowserTheme[];
    setThemes: React.Dispatch<React.SetStateAction<BrowserTheme[]>>;
    onClose: () => void;
}

// Basic inline styles for elements since this is a complex component
const styles: { [key: string]: React.CSSProperties } = {
    title: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' },
    grid: { display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' },
    card: { display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem' },
    cardTitle: { fontWeight: '600', fontSize: '1.125rem', margin: 0 },
    input: { padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', width: '100%', boxSizing: 'border-box' },
    textarea: { padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', width: '100%', height: '8rem', boxSizing: 'border-box', fontFamily: 'inherit' },
    button: { padding: '0.5rem', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-text)', borderRadius: '0.25rem', fontWeight: '600' },
    buttonClose: { padding: '0.5rem 1rem', backgroundColor: 'var(--color-bg-offset)', border: '1px solid var(--color-border)', borderRadius: '0.25rem', fontWeight: '600' },
    footer: { marginTop: '1.5rem', textAlign: 'right' },
    themeList: { display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', maxHeight: '20rem', paddingRight: '0.5rem' },
    themeItem: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--color-bg)', borderRadius: '0.5rem' },
    deleteButton: { color: 'var(--color-danger)', marginLeft: '1rem', padding: '0.25rem', fontSize: '1.25rem' }
};

const ThemeManager: React.FC<ThemeManagerProps> = ({ themes, setThemes, onClose }) => {
    const [newThemeName, setNewThemeName] = useState('');
    const [newThemePrompt, setNewThemePrompt] = useState('');
    
    const handleAddTheme = () => {
        if (!newThemeName || !newThemePrompt) {
            alert("Please provide both a name and a prompt for the new theme.");
            return;
        }
        const newTheme: BrowserTheme = { name: newThemeName, prompt: newThemePrompt };
        setThemes(prev => [...prev, newTheme]);
        setNewThemeName('');
        setNewThemePrompt('');
    };
    
    const handleDeleteTheme = (themeName: string) => {
        if (themes.length <= 2) {
            alert("Cannot delete default themes.");
            return;
        }
        setThemes(prev => prev.filter(theme => theme.name !== themeName));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2 style={styles.title}>Theme Manager</h2>
                
                <div style={{...styles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
                    {/* Add new theme form */}
                    <div style={styles.card}>
                         <h3 style={styles.cardTitle}>Add New Theme</h3>
                         <input
                            type="text"
                            placeholder="Theme Name (e.g., 'Gothic Oil Painting')"
                            value={newThemeName}
                            onChange={(e) => setNewThemeName(e.target.value)}
                            style={styles.input}
                         />
                         <textarea
                            placeholder="Theme Prompt (e.g., 'A dark, moody redesign...')"
                            value={newThemePrompt}
                            onChange={(e) => setNewThemePrompt(e.target.value)}
                            style={styles.textarea}
                         />
                         <button onClick={handleAddTheme} style={styles.button}>
                            Add Theme
                         </button>
                    </div>

                    {/* Existing themes list */}
                    <div className="flex flex-col">
                        <h3 style={{...styles.cardTitle, marginBottom: '1rem'}}>Saved Themes</h3>
                        <div style={styles.themeList}>
                             {themes.map(theme => (
                                 <div key={theme.name} style={styles.themeItem}>
                                    <div style={{ overflow: 'hidden' }}>
                                        <p style={{ fontWeight: 600, margin: 0 }}>{theme.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{theme.prompt}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteTheme(theme.name)}
                                        style={styles.deleteButton}
                                        disabled={themes.length <= 2}
                                        title={themes.length <= 2 ? 'Cannot delete default themes' : 'Delete theme'}
                                    >
                                       &#x1F5D1;
                                    </button>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>

                <div style={styles.footer}>
                    <button onClick={onClose} style={styles.buttonClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeManager;