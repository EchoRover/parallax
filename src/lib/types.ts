// --- Core Types ---

export interface Persona {
  id: string;
  name: string;
  role: string;
  icon: string;
  category: string;
  description: string;
  systemPrompt: string;
  isCustom?: boolean;
  authorName?: string;
}

export interface ChunkReaction {
  chunkIndex: number;
  chunkText: string;
  reaction: string;
  type: "confusion" | "jargon" | "weak" | "strong" | "objection" | "suggestion" | "neutral";
  severity: "critical" | "warning" | "note" | "positive";
  quote: string;
  rewrite: string | null;
  memoryNote: string; // what the persona carries forward
}

export interface PersonaAnalysis {
  personaId: string;
  personaName: string;
  personaRole: string;
  personaIcon: string;
  overallScore: number;
  overallVerdict: string;
  reactions: ChunkReaction[];
  topObjections: string[];
  missingElements: string[];
  error?: boolean;
}

export interface ResearchData {
  brief: string;
  sources: { url: string; title: string }[];
  searchQueries: string[];
}

export interface Analysis {
  id?: string;
  userId?: string;
  script: string;
  audienceDescription: string;
  research: ResearchData | null;
  results: PersonaAnalysis[];
  selectedPersonaIds: string[];
  createdAt?: string;
  title?: string;
}

// Severity + type display config
export const severityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  note: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  positive: "bg-green-500/20 text-green-400 border-green-500/30",
};

export const typeConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  confusion: { label: "Confused", color: "text-red-400", dotColor: "bg-red-500" },
  jargon: { label: "Jargon", color: "text-yellow-400", dotColor: "bg-yellow-500" },
  weak: { label: "Weak Point", color: "text-orange-400", dotColor: "bg-orange-500" },
  strong: { label: "Strong", color: "text-green-400", dotColor: "bg-green-500" },
  objection: { label: "Objection", color: "text-red-300", dotColor: "bg-red-400" },
  suggestion: { label: "Suggestion", color: "text-indigo-400", dotColor: "bg-indigo-500" },
  neutral: { label: "Noted", color: "text-zinc-400", dotColor: "bg-zinc-500" },
};

export const categoryColors: Record<string, string> = {
  Business: "border-blue-500/30",
  Technical: "border-emerald-500/30",
  Career: "border-orange-500/30",
  Education: "border-purple-500/30",
  Media: "border-pink-500/30",
  General: "border-zinc-500/30",
};
