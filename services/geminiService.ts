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
    contents: `Task: Generate a single piece of ${randomMood.toLowerCase()} advice.
Rules:
1. Length: 5-20 words.
2. If mood is ABSURD, make it surreal/funny.
3. If mood is INSPIRATIONAL, make it profound.
4. Return ONLY JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          mood: { type: Type.STRING, enum: Object.values(AdviceMood) }
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
      id: Math.random().toString(36).substring(2, 8).toUpperCase()
    } as Advice;
  } catch (err) {
    console.error("Gemini Parse Error:", err);
    throw new Error("DATA_CORRUPTION");
  }
};

export const getAdviceBackstory = async (adviceText: string, mood: AdviceMood): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: Someone just received this advice: "${adviceText}". 
Mood: ${mood}.
Task: Write a 1-sentence backstory (under 20 words) explaining why this advice exists or what triggered it.`,
    });

    const text = response.text?.trim();
    if (!text) throw new Error("Empty response");
    return text;
  } catch (err) {
    console.error("Backstory API Error:", err);
    throw err;
  }
};