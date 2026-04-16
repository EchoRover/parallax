import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini";
import { buildChunkedAnalysisPrompt } from "@/lib/prompts";

export const maxDuration = 60;

interface PersonaInput {
  id: string;
  name: string;
  role: string;
  icon: string;
  systemPrompt: string;
}

function splitIntoChunks(text: string): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length < 3) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let current = "";
    for (const s of sentences) {
      if ((current + " " + s).split(/\s+/).length > 80) {
        if (current) chunks.push(current.trim());
        current = s;
      } else {
        current = current ? current + " " + s : s;
      }
    }
    if (current) chunks.push(current.trim());
    return chunks.length > 0 ? chunks : paragraphs;
  }

  return paragraphs;
}

export async function POST(req: NextRequest) {
  try {
    const { script, personas, researchBrief } = (await req.json()) as {
      script: string;
      personas: PersonaInput[];
      researchBrief: string;
    };

    if (!script || !personas || personas.length === 0) {
      return NextResponse.json(
        { error: "Missing script or personas" },
        { status: 400 }
      );
    }

    const chunks = splitIntoChunks(script);

    // Run all persona analyses in parallel with fallback
    const analyses = await Promise.all(
      personas.map(async (persona) => {
        const prompt = buildChunkedAnalysisPrompt(
          persona,
          chunks,
          researchBrief || ""
        );

        try {
          const text = await generateWithFallback(prompt);

          const cleaned = text
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

          const analysis = JSON.parse(cleaned);

          return {
            personaId: persona.id,
            personaName: persona.name,
            personaRole: persona.role,
            personaIcon: persona.icon,
            ...analysis,
          };
        } catch (parseError) {
          console.error(`Error for ${persona.name}:`, parseError);
          return {
            personaId: persona.id,
            personaName: persona.name,
            personaRole: persona.role,
            personaIcon: persona.icon,
            overallScore: 0,
            overallVerdict: "Analysis failed — please retry.",
            reactions: [],
            topObjections: [],
            missingElements: [],
            error: true,
          };
        }
      })
    );

    return NextResponse.json({ analyses, chunks });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "Analysis temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}
