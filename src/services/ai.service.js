import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export const categorizeExpense = async (concept) => {
  const prompt = `You are a strict financial categorizer. Categorize this expense concept: "${concept}". You must return ONLY one exact string from this array: ['Housing', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Debt', 'Misc']. Do not return any other characters.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const category = response.text.trim();
    // Validate strict category output
    const valid = ['Housing', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Debt', 'Misc'];
    if (!valid.includes(category)) return 'Misc';
    
    return category;
  } catch (error) {
    console.error("AI Categorization Error:", error);
    return 'Misc';
  }
};

export const generateFinancialStrategy = async (userData) => {
  const prompt = `You are an expert Mexican market Financial Advisor. Analyze the following user profile and expenses:
${JSON.stringify(userData, null, 2)}

Return a structured JSON object exactly matching this format. ONLY output the raw JSON so it can be parsed.
{
  "debt_priority": ["Highest interest debt name", "Secondary debt"],
  "emergency_target_mxn": 50000,
  "allocation": {
    "cetes": 50,
    "udibonos": 20,
    "liquidity": 30
  }
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let jsonString = response.text.trim();
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
    }
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Strategy Error:", error);
    return null;
  }
};
