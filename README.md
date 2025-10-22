![Logo](https://github.com/JohannOosthuizen/Semantic-Forge/blob/main/assets/logo.jpg)

# Semantic-Forge: AI-Powered Personal Browser

## Overview
Semantic-Forge is an innovative desktop browser built with Electron that transforms the web into a personalized experience. Inspired by the vision of AI as a dynamic renderer rather than just an assistant, it reinterprets web pages in real-time to match your preferred UI grammar. No more relearning every site's "dialect" of buttons, navs, and layouts—Semantic-Forge uses AI to reflow content into familiar designs, letting you truly own your browsing.

This app addresses the "tragedy of the web" described in [this X post](https://x.com/signulll/status/1981065810815668446): Every site forces you to adapt to its UI, but with AI-driven rendering, the browser adapts to you.

## Key Features
- **Custom Styling & Themes**: Apply preset themes (Default, Dark Mode, High Contrast) or AI-generated ones via LLM prompts (e.g., "Futuristic neon theme").
- **LLM Integration for Re-Rendering**: Select page sections, send to a local LLM (defaults to LM Studio), and get flexible re-writes or analyses. Inject results back or export them.
- **Docling Option**: Convert selected HTML to structured Markdown for better LLM input (with JS fallback).
- **Session Persistence**: Saves last URL, bookmarks, cookies, and settings across restarts.
- **Secure Auth Handling**: Opens system browser for OAuth logins.
- **User-Friendly UI**: Modern design with Tailwind CSS, intuitive toolbar, and configurable settings (LLM endpoint, model, API key, etc.).

## Inspiration
Built on the idea from [@signulll's X post](https://x.com/signulll/status/1981065810815668446):
> "imo one of the most unexplored frontiers of browsers is ai as renderer not assistant. what if a webpage wasn’t fixed html but a living semantic object, dynamically reinterpreted in real time by your model of the world?  
> the tragedy of the web is every site teaches you a new dialect of ui. every button, nav, or layout is a micro language you must relearn. the browser should translate, not you.  
> imagine opening any page & it instantly reflows into a familiar design language… e.g. your personal ui grammar. ai doesn’t just help you use the web… it lets you own it."

## Installation & Setup
1. Clone the repo: `git clone https://github.com/JohannOosthuizen/Semantic-Forge.git`
2. Install dependencies: `cd semantic-forge && npm install`
3. Install LM Studio (default LLM): Download from [lmstudio.ai](https://lmstudio.ai/), load a model, start the local server.
4. Optional: For Docling, install Python and `pip install docling`.
5. Run: `npm start`

Configure settings in-app for custom LLM endpoints (e.g., OpenAI-compatible) or prompts.

## Usage
- Enter a URL and navigate like a standard browser.
- Select a theme (preset or AI) to reflow the page.
- Highlight content, "Send to LLM" for AI rendering, then inject or export.
- Add custom prompts in Settings for new AI themes.

## Contributing
Pull requests welcome! Focus on enhancing AI rendering, UI polish, or cross-platform support.

## License
MIT License – Feel free to fork and adapt.

For questions, open an issue or reach out. Let's make the web yours! 🚀
