import { GoogleGenAI } from "@google/genai";

/**
 * Takes raw text content and a theme prompt to generate a self-contained HTML page.
 */
export const forgeHtmlFromText = async (content: string, themePrompt: string, apiKey: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("API key is missing. Please set it in the extension's options.");
    }
    // Initialize the Gemini client with the provided API key.
    const ai = new GoogleGenAI({ apiKey });
    
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

    console.log('Making request to Gemini API...');
    const geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    console.log('Received response from Gemini API.');

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