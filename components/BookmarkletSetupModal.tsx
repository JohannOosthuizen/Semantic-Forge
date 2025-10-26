import React, { useMemo } from 'react';

interface BookmarkletSetupModalProps {
    onClose: () => void;
}

const BookmarkletSetupModal: React.FC<BookmarkletSetupModalProps> = ({ onClose }) => {
    
    const bookmarkletCode = useMemo(() => {
        const code = `
            const content = document.body.innerText;
            const encodedContent = btoa(content);
            const sourceUrl = window.location.href;
            const targetUrl = '${window.location.origin}${window.location.pathname}';
            const forgeUrl = new URL(targetUrl);
            forgeUrl.searchParams.append('content', encodedContent);
            forgeUrl.searchParams.append('sourceUrl', sourceUrl);
            window.location.href = forgeUrl.href;
        `;
        // Minify the code for the href attribute
        const minifiedCode = code.replace(/\s+/g, ' ').trim();
        return `javascript:(function(){${minifiedCode}})()`;
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 m-4 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-4">One-Time Bookmarklet Setup</h2>
                <div className="text-gray-600 dark:text-gray-300 mb-6 space-y-4">
                    <p>
                        To automatically forge any website, you need our special bookmarklet. It's a browser bookmark that contains a small script to securely grab the text from a page.
                    </p>
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-lg">
                        <h3 className="font-bold text-lg mb-2 text-indigo-800 dark:text-indigo-200">How to Install (15 seconds):</h3>
                        <ol className="list-decimal list-inside space-y-1">
                           <li>Make sure your browser's bookmarks bar is visible.</li>
                           <li>Drag the button below up to your bookmarks bar.</li>
                        </ol>
                    </div>
                     <div className="text-center my-6">
                        <a 
                          href={bookmarkletCode} 
                          className="inline-block bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg cursor-move shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
                          onClick={(e) => e.preventDefault()} // Prevent click action, only drag is intended
                        >
                          Textual Forge
                        </a>
                    </div>
                     <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg">
                        <h3 className="font-bold text-lg mb-2 text-green-800 dark:text-green-200">How to Use:</h3>
                         <ol className="list-decimal list-inside space-y-1">
                           <li>Navigate to any website you want to redesign.</li>
                           <li>Click the "Textual Forge" bookmark you just saved.</li>
                           <li>You'll be brought back here, and the forge will begin automatically!</li>
                        </ol>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="p-2 px-4 bg-gray-200 dark:bg-gray-600 rounded font-semibold hover:bg-gray-300 dark:hover:bg-gray-500">
                        Got It
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookmarkletSetupModal;