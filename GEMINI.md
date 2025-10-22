# Semantic-Forge Documentation

**Project Name:** Semantic-Forge

**Core Functionality:** An Electron-based desktop web browser with advanced features for interacting with web content through Large Language Models (LLMs).

**Key Features:**

1.  **Custom Theming:**
    *   Users can apply several preset CSS themes (e.g., Dark, Solarized, Nord) to any webpage browsed.
    *   **AI-Powered Themes:** Users can define custom prompts (e.g., "Futuristic neon theme") which are sent to a configured LLM to generate unique CSS stylesheets on the fly.

2.  **LLM Content Interaction:**
    *   Users can select any portion of a webpage and send it to an LLM for analysis, summarization, or rewriting.
    *   The selected HTML is converted to Markdown before being sent to the model. The user can choose between a standard library (`turndown`) or a more advanced Python-based library (`docling`) for this conversion.
    *   The LLM's response is displayed in a dedicated sidebar.

3.  **Content Injection and Export:**
    *   Users can directly inject the LLM's rewritten text back into the webpage, replacing the original selection.
    *   The LLM response can be exported as a Markdown file.

4.  **Configurability:**
    *   A settings modal allows users to configure the connection to their LLM, including the API endpoint, model name, and API key. This is designed to work with local LLM servers like LM Studio.
    *   Users can manage their custom prompts for AI theme generation.

5.  **Persistent State:**
    *   The application remembers the last visited URL and user settings between sessions using `electron-store`.

**Technical Architecture:**

*   **Framework:** [Electron](https://www.electronjs.org/)
*   **Frontend:**
    *   HTML, CSS (Tailwind CSS), JavaScript
    *   The UI is a single-page application defined in `index.html`.
    *   All frontend logic is handled by `renderer.js`.
*   **Backend (Main Process):**
    *   Node.js environment managed by Electron (`main.js`).
    *   Handles window creation, application lifecycle, and native OS integrations (like save dialogs).
    *   Manages persistent storage via `electron-store`.
*   **Inter-Process Communication (IPC):**
    *   A `preload.js` script securely exposes Node.js and Electron APIs (`ipcRenderer`) to the sandboxed renderer process using `contextBridge`. This is the modern, secure way to do IPC in Electron.
*   **Key Dependencies:**
    *   `electron`: Core application framework.
    *   `electron-store`: For persistent data storage.
    *   `axios`: For making HTTP requests to the LLM API.
    *   `openai`: A client library for interacting with OpenAI-compatible APIs.
    *   `turndown`: For converting HTML to Markdown.
    *   `python-shell`: To execute a Python script for advanced Markdown conversion.
    *   `docling` (Python library): An external dependency assumed to be installed in the user's Python environment for high-quality HTML-to-Markdown conversion.

**File Breakdown:**

*   `index.html`: Defines the entire UI structure of the browser, including the toolbar, webview, sidebar, and settings modal.
*   `main.js`: The entry point for the Electron application. Manages the main process, window creation, and native OS interactions.
*   `preload.js`: Securely bridges the main process and the renderer process, exposing necessary APIs.
*   `renderer.js`: Contains all the client-side logic for UI interactions, navigation, theming, and communicating with the LLM.
*   `package.json`: Defines project metadata and dependencies.
