import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/gemini";
import { generatePersonaPrompt } from "@/lib/personas";

export async function POST(req: NextRequest) {
  try {
    const { description, researchBrief } = await req.json();

    if (!description) {
      return NextResponse.json(
        { error: "Missing persona description" },
        { status: 400 }
      );
    }

    const model = getModel();
    const prompt = generatePersonaPrompt(description, researchBrief || "");

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const persona = JSON.parse(cleaned);

    return NextResponse.json({
      persona: {
        id: `custom-${Date.now()}`,
        isCustom: true,
        ...persona,
      },
    });
  } catch (error) {
    console.error("Persona generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate persona" },
      { status: 500 }
    );
  }
}
