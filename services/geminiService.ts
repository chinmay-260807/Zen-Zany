import { GoogleGenAI, Type } from "@google/genai";
import { Advice, AdviceMood } from "../types";

const extractJSON = (text: string) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : text;
};

export const generateAdvice = async (): Promise<Advice> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const moods = Object.values(AdviceMood);
  const randomMood = moods[Math.floor(Math.random() * moods.length)];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Give me a single piece of ${randomMood.toLowerCase()} advice. 
               Keep it between 5 and 20 words. 
               If it is 'ABSURD', make it surreal. 
               If it is 'INSPIRATIONAL', make it profound but brief. 
               Return strictly JSON format.`,
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
    const rawText = response.text || "";
    const cleanJson = extractJSON(rawText.trim());
    const data = JSON.parse(cleanJson);
    return {
      ...data,
      id: Math.random().toString(16).slice(2, 8).toUpperCase()
    } as Advice;
  } catch (err) {
    console.error("Failed to parse AI response:", err);
    throw new Error("PARSING_ERROR");
  }
};

export const getAdviceBackstory = async (adviceText: string, mood: AdviceMood): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a brief, creative backstory or "why" for this advice: "${adviceText}". 
                 Match the tone: ${mood}. Keep it under 30 words.`,
    });

    return response.text?.trim() || "The universe is currently keeping its secrets.";
  } catch (err) {
    console.error("Backstory error:", err);
    throw err;
  }
};