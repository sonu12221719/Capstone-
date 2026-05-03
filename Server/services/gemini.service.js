import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// ✅ Validate API Key
if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ GEMINI_API_KEY is missing in .env");
}

// ✅ Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Use ONLY stable model
// Change this line in gemini.service.js
const MODEL_NAME = "gemini-2.5-flash";

// ✅ Clean response text
const cleanText = (text) => {
  if (!text) return "";

  return text
    .replace(/```[\s\S]*?```/g, (block) =>
      block.replace(/```/g, "").trim()
    )
    .replace(/[*_`>#]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// ✅ Main function
export const askGemini = async (prompt) => {
  try {
    // 🔍 Debug (remove later)
    console.log("Using Gemini model:", MODEL_NAME);

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const result = await model.generateContent(prompt);

    const response = result.response;
    const text = response?.text();

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return cleanText(text);

  } catch (error) {
    console.error("❌ Gemini FULL ERROR:", error);

    // Better error message
    if (error.message?.includes("API key")) {
      throw new Error("❌ Invalid Gemini API Key");
    }

    if (error.message?.includes("404")) {
      throw new Error("❌ Model not found (check model name)");
    }

    if (error.message?.includes("fetch")) {
      throw new Error("❌ Network/API connection issue");
    }

    throw new Error(`Gemini API failed: ${error.message}`);
  }
};

// Add this helper function somewhere in your code and call it once
