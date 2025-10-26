<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Semantic-Forge: AI-Powered Browser

An innovative browser experience that uses AI to transform the web into a personalized experience. It reinterprets web pages in real-time to match your preferred UI, styles, and themes.

## Features

*   **AI-Powered Theming:** Semantic-Forge doesn't just change colors and fonts; it uses the Google Gemini API to completely reinterpret and rewrite the HTML of web pages based on your chosen theme.
*   **Creative Default Themes:** Get started with a variety of built-in themes, including:
    *   **Blueprint:** Renders the page as a technical architectural blueprint.
    *   **Claymorphism:** A soft, 3D, clay-like aesthetic.
    *   **Memphis Design:** A vibrant, playful 1980s theme.
    *   **Shakespeare:** Rewrites the page's content in the style of a 16th-century playwright.
    *   ...and many more!
*   **Custom Themes:** Create and save your own themes by writing your own prompts for the AI.
*   **Personalized Browsing:** Customize the web to your liking with personalized themes and UI.
*   **Seamless Integration:** Runs as a browser extension, integrating directly with your browsing experience.

## Run Locally

**Prerequisites:** Node.js

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/semantic-forge.git
    cd semantic-forge
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up your environment:**
    Create a `.env.local` file in the root of the project and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_gemini_api_key
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  **Load the extension in your browser:**
    *   Open your browser's extension management page (e.g., `chrome://extensions`).
    *   Enable "Developer mode".
    *   Click "Load unpacked" and select the `dist` directory in the project folder.

## Technologies Used

*   **Frontend:** React, TypeScript
*   **Build Tool:** Vite
*   **AI:** Google Gemini API
*   **Browser Extension:** Manifest V3

## File Structure

*   `src/`: Contains the main source code for the extension.
    *   `App.tsx`: The main React component for the popup UI.
    *   `content.js`: Content script that runs on web pages.
    *   `services/geminiService.ts`: Service for interacting with the Google Gemini API.
*   `public/`: Contains the static assets for the extension.
    *   `manifest.json`: The extension's manifest file.
    *   `index.html`: The HTML file for the popup.
*   `vite.config.ts`: Vite configuration file.
*   `package.json`: Project dependencies and scripts.