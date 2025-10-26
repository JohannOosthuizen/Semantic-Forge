import React from 'react';
import ReactDOM from 'react-dom/client';

const Options = () => {
    return React.createElement(
        'div',
        { className: 'options-container' },
        React.createElement(
            'header',
            { className: 'options-header' },
            React.createElement('h1', null, 'Semantic Forge Options'),
            React.createElement('p', null, 'Configure your AI-powered browser extension.')
        ),
        React.createElement(
            'main',
            { className: 'options-main' },
            React.createElement('h2', null, 'Configuration'),
            React.createElement('p', null, 'There are currently no configurable options. Theme management is available in the extension popup.')
        )
    );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
    React.createElement(
        React.StrictMode,
        null,
        React.createElement(Options, null)
    )
);
