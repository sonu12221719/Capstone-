import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ GEMINI_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiVersion: "v1",
});

// Try models in order of preference; falls back on each 404/429
const MODEL_CANDIDATES = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
  "gemini-pro",
];

const cleanText = (text) =>
  text
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, "").trim())
    .replace(/[*_`>#]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const askGemini = async (prompt) => {
  let lastError;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response?.text();
      if (!text) throw new Error("Empty response from Gemini");
      return cleanText(text);
    } catch (error) {
      const status = error?.status ?? error?.errorDetails?.status;
      // Only retry on 404 (model not found) or 429 (quota exceeded)
      if (error.message?.includes("404") || error.message?.includes("429") ||
          error.message?.includes("not found") || error.message?.includes("quota")) {
        console.warn(`Model "${modelName}" unavailable: ${error.message.slice(0, 80)}`);
        lastError = error;
        continue;
      }
      // Any other error — surface immediately
      console.error("Gemini Error:", error.message);
      throw new Error(`Gemini API failed: ${error.message}`);
    }
  }

  console.error("All Gemini models exhausted:", lastError?.message);
  throw new Error("Gemini API unavailable — all models returned quota/not-found errors.");
};
