import { GoogleGenAI } from "@google/genai";

/**
 * Takes raw text content and a theme prompt to generate a self-contained HTML page.
 */
export const forgeHtmlFromText = async (content, themePrompt) => {
    // Fix: Adhere to API key guidelines by initializing the Gemini client
    // directly with the API key from environment variables, removing local storage logic.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
        You are a world-class AI web designer. Your task is to create a visually stunning, single-page website as a single, self-contained HTML file based on the provided text content and a creative theme.

        - The design must be inspired by the "Creative Theme" provided below.
        - The content of the new page MUST be structured and laid out based on the "Page Content" provided. Do not make up new content.
        - The entire output must be a single HTML document. All CSS must be inside a \`<style>\` tag. Do not use external files.
        - The design must be responsive.

        **Creative Theme:** "${themePrompt}"

        **Page Content:**
        ---
        ${content}
        ---

        Generate the complete HTML code now. Your response should be ONLY the raw HTML code, starting with <!DOCTYPE html>.
    `;

    const geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });

    let htmlContent = geminiResponse.text;
    // Clean up potential markdown code blocks
    if (htmlContent.startsWith('```html')) {
        htmlContent = htmlContent.substring(7);
    }
    if (htmlContent.endsWith('```')) {
        htmlContent = htmlContent.slice(0, -3);
    }

    return htmlContent.trim();
};
