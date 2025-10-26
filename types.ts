export interface BrowserTheme {
    name: string;
    prompt: string;
}

// Fix: Consolidate TypeScript definitions for the Chrome Extension API into a single global declaration
// to resolve type conflicts across files.
declare global {
    namespace chrome {
        namespace runtime {
            const lastError: { message?: string } | undefined;
            function openOptionsPage(): void;
        }
        namespace storage {
            interface StorageArea {
                get(keys: string | string[] | { [key: string]: any } | null, callback: (items: { [key: string]: any }) => void): void;
                set(items: { [key: string]: any }, callback?: () => void): void;
            }
            const local: StorageArea;
        }
        namespace tabs {
            interface Tab {
                id?: number;
                url?: string;
            }
            function query(queryInfo: { active?: boolean, currentWindow?: boolean }): Promise<Tab[]>;
            function sendMessage(tabId: number, message: any): Promise<any>;
        }
    }

    interface Window {
        chrome: typeof chrome;
    }
}
