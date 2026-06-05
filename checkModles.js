import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyAIrSOY21fhpI8yFwkS05s6ZshXA9Wfe84"
});

const listModels = async () => {
  try {

    const res = await ai.models.list();

    console.log("\nRAW RESPONSE:\n", res);

    // 🔥 SAFE EXTRACTION
    const models = res.models || res || [];

    if (!Array.isArray(models)) {
      console.log("Unexpected format:", models);
      return;
    }

    console.log("\n🔥 USABLE MODELS:\n");

    models
      .filter(m =>
        m.supportedGenerationMethods?.includes("generateContent")
      )
      .forEach(m => console.log(m.name));

  } catch (err) {
    console.error("❌ Error:", err);
  }
};

listModels();