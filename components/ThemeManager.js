import React, { useState } from 'react';

const styles = {
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
    deleteButton: { color: 'var(--color-danger)', marginLeft: '1rem', padding: '0.25rem', fontSize: '1.25rem', border: 'none', background: 'none', cursor: 'pointer' }
};

const ThemeManager = ({ themes, setThemes, onClose }) => {
    const [newThemeName, setNewThemeName] = useState('');
    const [newThemePrompt, setNewThemePrompt] = useState('');
    
    const handleAddTheme = () => {
        if (!newThemeName || !newThemePrompt) {
            alert("Please provide both a name and a prompt for the new theme.");
            return;
        }
        const newTheme = { name: newThemeName, prompt: newThemePrompt };
        setThemes(prev => [...prev, newTheme]);
        setNewThemeName('');
        setNewThemePrompt('');
    };
    
    const handleDeleteTheme = (themeName) => {
        if (themes.length <= 2) {
            alert("Cannot delete default themes.");
            return;
        }
        setThemes(prev => prev.filter(theme => theme.name !== themeName));
    };

    const themeListItems = themes.map(theme => 
        React.createElement('div', { key: theme.name, style: styles.themeItem },
            React.createElement('div', { style: { overflow: 'hidden' } },
                React.createElement('p', { style: { fontWeight: 600, margin: 0 } }, theme.name),
                React.createElement('p', { style: { fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 } }, theme.prompt)
            ),
            React.createElement('button', {
                onClick: () => handleDeleteTheme(theme.name),
                style: styles.deleteButton,
                disabled: themes.length <= 2,
                title: themes.length <= 2 ? 'Cannot delete default themes' : 'Delete theme'
            }, '🗑️')
        )
    );

    return React.createElement('div', { className: "modal-overlay", onClick: onClose },
        React.createElement('div', { className: "modal-content", onClick: e => e.stopPropagation() },
            React.createElement('h2', { style: styles.title }, "Theme Manager"),
            React.createElement('div', { style: {...styles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'} },
                React.createElement('div', { style: styles.card },
                    React.createElement('h3', { style: styles.cardTitle }, "Add New Theme"),
                    React.createElement('input', {
                        type: "text",
                        placeholder: "Theme Name (e.g., 'Gothic Oil Painting')",
                        value: newThemeName,
                        onChange: (e) => setNewThemeName(e.target.value),
                        style: styles.input
                    }),
                    React.createElement('textarea', {
                        placeholder: "Theme Prompt (e.g., 'A dark, moody redesign...')",
                        value: newThemePrompt,
                        onChange: (e) => setNewThemePrompt(e.target.value),
                        style: styles.textarea
                    }),
                    React.createElement('button', { onClick: handleAddTheme, style: styles.button }, "Add Theme")
                ),
                React.createElement('div', { style: { display: 'flex', flexDirection: 'column' } },
                    React.createElement('h3', { style: {...styles.cardTitle, marginBottom: '1rem'} }, "Saved Themes"),
                    React.createElement('div', { style: styles.themeList }, ...themeListItems)
                )
            ),
            React.createElement('div', { style: styles.footer },
                React.createElement('button', { onClick: onClose, style: styles.buttonClose }, "Close")
            )
        )
    );
};

export default ThemeManager;
