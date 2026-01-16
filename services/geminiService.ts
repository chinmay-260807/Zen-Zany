
import { GoogleGenAI, Type } from "@google/genai";
import { Advice, AdviceMood } from "../types";

export const generateAdvice = async (): Promise<Advice> => {
  // Always initialize GoogleGenAI exactly as per instructions
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const moods = Object.values(AdviceMood);
  const randomMood = moods[Math.floor(Math.random() * moods.length)];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Give me a single piece of ${randomMood.toLowerCase()} advice. 
               Keep it between 5 and 20 words. 
               If it is 'ABSURD', make it surreal. 
               If it is 'INSPIRATIONAL', make it profound but brief.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: 'The advice message.',
          },
          mood: {
            type: Type.STRING,
            enum: Object.values(AdviceMood),
            description: 'The mood of the advice.',
          }
        },
        required: ["text", "mood"]
      },
    },
  });

  try {
    const data = JSON.parse(response.text.trim());
    return data as Advice;
  } catch (err) {
    console.error("Failed to parse AI response, falling back.", err);
    throw err;
  }
};

export const getAdviceBackstory = async (adviceText: string, mood: AdviceMood): Promise<string> => {
  // Always initialize GoogleGenAI exactly as per instructions
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide a brief, creative, and potentially humorous backstory or "why" for this piece of advice: "${adviceText}". 
               The tone should match the mood: ${mood}. 
               Keep the explanation under 40 words.`,
  });

  return response.text || "The universe refused to explain itself this time.";
};
