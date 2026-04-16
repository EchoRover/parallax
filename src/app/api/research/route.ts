import { NextRequest, NextResponse } from "next/server";
import { getGroundedModel, generateWithFallback } from "@/lib/gemini";
import { buildResearchPrompt } from "@/lib/prompts";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { script, audienceDescription } = await req.json();

    if (!script || !audienceDescription) {
      return NextResponse.json(
        { error: "Missing script or audience description" },
        { status: 400 }
      );
    }

    const prompt = buildResearchPrompt(script, audienceDescription);
    let text = "";
    let searchQueries: string[] = [];
    let groundingChunks: { url: string; title: string }[] = [];

    // Try grounded model first
    try {
      const groundedModel = getGroundedModel();
      const result = await groundedModel.generateContent(prompt);
      text = result.response.text();

      const meta = result.response.candidates?.[0]?.groundingMetadata;
      searchQueries = meta?.webSearchQueries || [];
      groundingChunks =
        meta?.groundingChunks?.map(
          (chunk: { web?: { uri?: string; title?: string } }) => ({
            url: chunk.web?.uri || "",
            title: chunk.web?.title || "",
          })
        ) || [];
    } catch {
      // Fall back to non-grounded (tries primary then fallback model)
      console.log("Grounding unavailable, using fallback chain");
      text = await generateWithFallback(prompt);
    }

    return NextResponse.json({
      brief: text,
      sources: groundingChunks,
      searchQueries,
    });
  } catch (error) {
    console.error("Research API error:", error);
    return NextResponse.json(
      { error: "Research is temporarily unavailable. Please try again in a moment." },
      { status: 503 }
    );
  }
}
