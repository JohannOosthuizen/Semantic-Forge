import React from 'react';
import Spinner from './Spinner';

interface ContentViewProps {
    iframeRef: React.RefObject<HTMLIFrameElement>;
    url: string;
    mode: 'live' | 'forged';
    forgedHtml: string | null;
    isLoading: boolean;
    loadingMessage: string;
    error: string;
}

const ContentView: React.FC<ContentViewProps> = ({ iframeRef, url, mode, forgedHtml, isLoading, loadingMessage, error }) => {
    return (
        <main className="flex-1 bg-white dark:bg-gray-800 relative">
            <iframe
                ref={iframeRef}
                src={url}
                className={`w-full h-full border-0 ${mode === 'forged' ? 'opacity-0 pointer-events-none' : ''}`}
                title="Live Web Content"
                sandbox="allow-scripts allow-same-origin"
            />
            {mode === 'forged' && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-900 flex justify-center items-center p-4 overflow-auto">
                    {isLoading && (
                         <div className="text-center">
                            {/* Fix: Added missing 'isSmall' prop to the Spinner component. */}
                            <Spinner isSmall={false} />
                            <p className="mt-4 text-lg">{loadingMessage}</p>
                         </div>
                    )}
                    {error && !isLoading && (
                        <div className="text-center text-red-500">
                           <p><strong>Forge Failed</strong></p>
                           <p>{error}</p>
                        </div>
                    )}
                    {forgedHtml && !isLoading && !error && (
                        <iframe
                            srcDoc={forgedHtml}
                            className="w-full h-full border-2 border-gray-400 dark:border-gray-600 rounded-lg shadow-2xl bg-white"
                            title={`AI-forged version of ${url}`}
                            sandbox="allow-scripts"
                        />
                    )}
                </div>
            )}
        </main>
    );
};

export default ContentView;