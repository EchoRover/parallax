export function buildResearchPrompt(
  script: string,
  audienceDescription: string
): string {
  return `You are a research analyst preparing a brief for a communication review.

The user has written a communication (${script.split(/\s+/).length} words) and wants to understand how it will land with this audience:

TARGET AUDIENCE: ${audienceDescription}

Your task:
1. Research this audience type — who are they, what do they care about, what are current trends/concerns in their world?
2. Research the topic/domain of the communication to understand context.
3. Identify what this audience is likely looking for and what would turn them off.

Write a structured Research Brief with these sections:

## Audience Profile
Who they are, their priorities, their communication preferences.

## Current Context
Recent trends, events, or concerns relevant to this audience and topic. Use real, current information from the web.

## What They're Looking For
Specific things this audience expects to see in communication like this.

## Red Flags
Things that would make this audience lose interest or trust.

## Key Terminology
Important terms or concepts this audience uses or expects.

Be specific and current. Use real data, not generic advice.`;
}

export function buildChunkedAnalysisPrompt(
  persona: { name: string; role: string; systemPrompt: string },
  chunks: string[],
  researchBrief: string
): string {
  const chunksFormatted = chunks
    .map((c, i) => `[CHUNK ${i + 1}]\n${c}\n[/CHUNK ${i + 1}]`)
    .join("\n\n");

  return `${persona.systemPrompt}

IMPORTANT CONTEXT FROM AUDIENCE RESEARCH:
${researchBrief}

---

You are about to read a communication, broken into chunks (paragraphs). Simulate how a real human reads: sequentially, building understanding as you go.

For each chunk:
1. Read it with your persona's perspective and priorities
2. Note your HONEST reaction — what you think, feel, or question at this point
3. Carry forward what you've learned (your "memory") into the next chunk
4. Flag specific quotes that trigger a reaction

After reading ALL chunks, provide your overall assessment.

THE COMMUNICATION (broken into ${chunks.length} chunks):

${chunksFormatted}

---

Return a JSON response with this EXACT structure:
{
  "reactions": [
    {
      "chunkIndex": <0-based index>,
      "chunkText": "<first 10 words of the chunk>...",
      "reaction": "<your honest inner thought reading this chunk, 1-3 sentences, written in first person as the persona>",
      "type": "confusion" | "jargon" | "weak" | "strong" | "objection" | "suggestion" | "neutral",
      "severity": "critical" | "warning" | "note" | "positive",
      "quote": "<exact quote from this chunk that triggered this reaction, 5-40 words>",
      "rewrite": "<concrete rewrite suggestion for the quoted text, or null if it's good>",
      "memoryNote": "<brief note of what you'll remember from this chunk going forward>"
    }
  ],
  "overallScore": <1-10>,
  "overallVerdict": "<one sentence honest verdict as the persona>",
  "topObjections": ["<specific question or objection>"],
  "missingElements": ["<something you expected but didn't find>"]
}

RULES:
- You MUST have at least one reaction per chunk (even if it's neutral/positive)
- Quote EXACTLY from the text
- Write reactions in first person ("I'm thinking...", "This makes me wonder...")
- Be brutally honest — this is your internal monologue, not polite feedback
- If a chunk builds well on previous chunks, say so
- If you're lost or bored at any point, say so immediately
- Return ONLY valid JSON, no markdown fences`;
}

export function generatePersonaPrompt(
  description: string,
  researchBrief: string
): string {
  return `Based on this audience description, create a detailed persona for communication analysis.

AUDIENCE DESCRIPTION: ${description}

RESEARCH CONTEXT:
${researchBrief}

Generate a JSON response with this exact structure:
{
  "name": "A realistic full name",
  "role": "Their specific role/title",
  "icon": "A single relevant emoji",
  "category": "One of: Business, Technical, Career, Education, Media, General",
  "description": "One sentence describing who they are and what they care about",
  "systemPrompt": "A detailed system prompt (200+ words) that: defines who this person is, what they prioritize when reading content, what triggers negative reactions, what impresses them, and instructs them to write reactions as first-person internal monologue. Include specific behavioral details that make this persona distinct from generic readers."
}

Make the persona SPECIFIC and DISTINCT. Not a generic archetype but a real-feeling person with specific opinions and pet peeves.

Return ONLY valid JSON, no markdown fences.`;
}
