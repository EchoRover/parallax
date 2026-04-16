import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Model with Google Search grounding for research
export function getGroundedModel() {
  return genAI.getGenerativeModel(
    {
      model: "gemini-2.5-flash",
      tools: [{ googleSearch: {} } as any],
    },
    { apiVersion: "v1beta" }
  );
}

// Primary model
export function getModel() {
  return genAI.getGenerativeModel(
    { model: "gemini-2.5-flash" },
    { apiVersion: "v1beta" }
  );
}

// Fallback model (different model for when 2.5 flash is overloaded)
export function getFallbackModel() {
  return genAI.getGenerativeModel(
    { model: "gemini-2.5-flash-lite" },
    { apiVersion: "v1beta" }
  );
}

// Helper: try primary, then fallback
export async function generateWithFallback(prompt: string): Promise<string> {
  // Try primary
  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.log("Primary model failed, trying fallback:", (e as Error).message?.substring(0, 60));
  }

  // Try fallback
  const fallback = getFallbackModel();
  const result = await fallback.generateContent(prompt);
  return result.response.text();
}

export { genAI };
