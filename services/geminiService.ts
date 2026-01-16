import { GoogleGenAI, Type } from "@google/genai";
import { Advice, AdviceMood } from "../types";

const extractJSON = (text: string) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : text;
};

export const generateAdvice = async (historyTexts: string[] = []): Promise<Advice> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const moods = Object.values(AdviceMood);
  const randomMood = moods[Math.floor(Math.random() * moods.length)];
  
  // Dynamic entropy string to prevent the model from getting stuck in patterns
  const entropy = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Task: Generate a single, unique piece of ${randomMood.toLowerCase()} advice.
Rules:
1. Length: 5-20 words.
2. Mood context: ${randomMood}.
3. ENTROPY_KEY: ${entropy} (Use this to ensure high variance).
4. FORBIDDEN_LIST: ${historyTexts.slice(0, 15).join(' | ')}.
5. IMPORTANT: Do not use common idioms. Be weird, specific, and totally new.
6. Return ONLY JSON.`,
    config: {
      temperature: 1.0,
      topP: 0.95,
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
