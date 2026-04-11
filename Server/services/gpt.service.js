import openai from "../config/openai.js";

export const askGPT = async (prompt) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a preventive healthcare AI assistant." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content;
};