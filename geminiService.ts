import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Singleton instance logic could go here, but for now we export a helper
export const createGenAIClient = () => {
  if (!apiKey) {
    console.warn("API_KEY is missing. Gemini features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateGreeting = async (): Promise<string> => {
    const ai = createGenAIClient();
    if (!ai) return "Happy Holidays from Arix!";
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Write a very short, elegant, luxury-brand style Christmas greeting (max 10 words).',
        });
        return response.text.trim();
    } catch (e) {
        console.error("GenAI Error", e);
        return "Season's Greetings.";
    }
}
