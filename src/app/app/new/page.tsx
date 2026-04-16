"use client";

import { useState, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { DEFAULT_PERSONAS } from "@/lib/personas";
import { createClient } from "@/utils/supabase/client";
import type { Persona, PersonaAnalysis, ChunkReaction, ResearchData } from "@/lib/types";

const SEV = { critical: "bg-red-500/15 text-red-400", warning: "bg-amber-500/15 text-amber-400", note: "bg-blue-500/15 text-blue-400", positive: "bg-emerald-500/15 text-emerald-400" };
const DOT = { confusion: "bg-red-500", jargon: "bg-amber-500", weak: "bg-orange-500", strong: "bg-emerald-500", objection: "bg-red-400", suggestion: "bg-violet-500", neutral: "bg-zinc-500" };
const LABELS: Record<string, string> = { confusion: "Confused", jargon: "Jargon", weak: "Weak", strong: "Strong", objection: "Pushback", suggestion: "Idea", neutral: "Noted" };
const CAT_BORDER: Record<string, string> = { Business: "border-l-blue-500", Technical: "border-l-emerald-500", Career: "border-l-amber-500", Education: "border-l-violet-500", Media: "border-l-pink-500", General: "border-l-zinc-500" };

const DEMO_SCRIPT = `Every year, billions of dollars are wasted on communications that completely miss their mark. Founders pitch investors with decks full of jargon. Product teams launch features with announcements that confuse customers. Cover letters get rejected in six seconds.

The core problem is perspective blindness. When you write something, you understand every word because you have all the context. But your audience doesn't. They bring their own biases, priorities, and knowledge gaps. You literally cannot read your own writing through someone else's eyes.

Parallax changes this. Paste any communication and describe your audience. Our AI researches your specific audience using live web data, then deploys independent personas that read your text chunk by chunk — like a real human would — sharing their honest inner monologue at every step.

The output isn't generic suggestions. It's a timeline of real reactions: "I'm already lost here", "This doesn't match what I know about the market", "NOW I'm interested." Each reaction links to the exact text that triggered it, with concrete rewrite suggestions.

We're targeting the millions of creators, students, and professionals who will never hire focus groups but deserve to know how their words land before they hit send.`;

type Step = "write" | "audience" | "loading" | "results";

export default function NewAnalysis() {
  const [step, setStep] = useState<Step>("write");
  const [script, setScript] = useState("");
  const [audienceDesc, setAudienceDesc] = useState("");
  const [selectedPersonas, setSelectedPersonas] = useState<Persona[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [allPersonas, setAllPersonas] = useState<Persona[]>(DEFAULT_PERSONAS);
  const [research, setResearch] = useState<ResearchData | null>(null);
  const [analyses, setAnalyses] = useState<PersonaAnalysis[]>([]);
  const [chunks, setChunks] = useState<string[]>([]);
  const [activePersona, setActivePersona] = useState<string | null>(null);
  const [showRewrite, setShowRewrite] = useState<string | null>(null);
  const [showResearch, setShowResearch] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [miniLoading, setMiniLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const words = script.trim().split(/\s+/).filter(Boolean).length;

  const toggle = useCallback((p: Persona) => {
    setSelectedPersonas((prev) =>
      prev.find((s) => s.id === p.id) ? prev.filter((s) => s.id !== p.id)
      : prev.length < 5 ? [...prev, p] : prev
    );
  }, []);

  const createPersona = async () => {
    if (!customInput.trim()) return;
    setMiniLoading(true);
    try {
      const r = await fetch("/api/persona/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: customInput, researchBrief: "" }),
      });
      const d = await r.json();
      if (d.persona) {
        setAllPersonas((p) => [...p, d.persona]);
        setSelectedPersonas((p) => p.length < 5 ? [...p, d.persona] : p);
        setCustomInput("");
      }
    } catch { setError("Failed to create persona"); }
    setMiniLoading(false);
  };

  const runAnalysis = async () => {
    setStep("loading");
    setError(null);
    setLoadingMsg("Researching your audience...");

    try {
      const rr = await fetch("/api/research", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, audienceDescription: audienceDesc }),
      });
      if (!rr.ok) throw new Error("Research failed");
      const rd = await rr.json();
      if (rd.error) throw new Error(rd.error);
      setResearch(rd);

      setLoadingMsg(`Reading through ${selectedPersonas.length} perspectives...`);
      const ar = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          personas: selectedPersonas.map((p) => ({ id: p.id, name: p.name, role: p.role, icon: p.icon, systemPrompt: p.systemPrompt })),
          researchBrief: rd.brief || "",
        }),
      });
      if (!ar.ok) throw new Error("Analysis failed");
      const ad = await ar.json();
      if (ad.error) throw new Error(ad.error);

      setAnalyses(ad.analyses);
      setChunks(ad.chunks || []);
      setActivePersona(ad.analyses[0]?.personaId || null);
      setStep("results");

      // Save if logged in (fire and forget)
      try {
        const sb = createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
          await sb.from("analyses").insert({
            user_id: user.id, title: script.substring(0, 60) + "...", script,
            audience_description: audienceDesc, research: rd, results: ad.analyses,
            chunks: ad.chunks, selected_persona_ids: selectedPersonas.map((p) => p.id),
          });
        }
      } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("audience");
    }
  };

  const cur = analyses.find((a) => a.personaId === activePersona);
  const getReactions = (idx: number) => cur?.reactions?.filter((r) => r.chunkIndex === idx) || [];

  // ============= RENDER =============
  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[#1E1E24] px-5 py-2.5 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/app" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-xs">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Dashboard
            </a>
            <div className="h-4 w-px bg-[#2E2E35]" />
            <span className="text-xs text-zinc-400">New Analysis</span>
          </div>
          {step === "results" && (
            <button onClick={() => setShowResearch(!showResearch)} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              {showResearch ? "Hide" : "Show"} research brief
            </button>
          )}
        </div>
      </nav>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto w-full px-5 mt-3 animate-fade-in">
          <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs text-red-400">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400 text-sm ml-3">&times;</button>
          </div>
        </div>
      )}

      {/* ===== STEP 1: WRITE ===== */}
      {step === "write" && (
        <main className="flex-1 flex items-start justify-center pt-16 px-5 animate-fade-in-up">
          <div className="w-full max-w-xl">
            <div className="mb-8 text-center">
              <h1 className="text-xl font-semibold mb-2">What are you writing?</h1>
              <p className="text-sm text-zinc-500">Paste your communication below. We&apos;ll show you how different people experience it.</p>
            </div>

            <div className="card p-1">
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Paste your pitch, email, cover letter, README, memo..."
                className="w-full h-52 bg-transparent rounded-xl p-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-quaternary)] focus:outline-none resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between px-4 pb-3">
                <button onClick={() => { setScript(DEMO_SCRIPT); setAudienceDesc("Hackathon judges evaluating tech projects"); }} className="text-[11px] text-violet-400/70 hover:text-violet-400 transition-colors">
                  Load example
                </button>
                <span className={`text-[11px] ${words > 5000 ? "text-red-400" : "text-zinc-600"}`}>{words} words</span>
              </div>
            </div>

            <button
              onClick={() => setStep("audience")}
              disabled={words < 10 || words > 5000}
              className="w-full mt-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-[#1C1C21] disabled:text-zinc-600 text-sm font-medium transition-all"
            >
              Continue
            </button>
          </div>
        </main>
      )}

      {/* ===== STEP 2: AUDIENCE + PERSONAS ===== */}
      {step === "audience" && (
        <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-10 animate-fade-in-up">
          {/* Audience input */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-1">Who is reading this?</h2>
            <p className="text-xs text-zinc-500 mb-3">Describe your audience so we can research them before analyzing.</p>
            <div className="recessed p-0.5">
              <input
                type="text"
                value={audienceDesc}
                onChange={(e) => setAudienceDesc(e.target.value)}
                placeholder="e.g., VCs in climate tech, hiring managers at FAANG, first-year students..."
                className="w-full bg-transparent px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-quaternary)] focus:outline-none"
              />
            </div>
          </div>

          {/* Persona selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Choose perspectives <span className="text-zinc-600 font-normal">(up to 5)</span></h3>
              <div className="flex items-center gap-1">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < selectedPersonas.length ? "bg-violet-500" : "bg-[#1C1C21]"}`} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allPersonas.map((p) => {
                const on = selectedPersonas.some((s) => s.id === p.id);
                const dis = !on && selectedPersonas.length >= 5;
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p)}
                    disabled={dis}
                    className={`text-left p-3 rounded-xl border-l-[3px] border transition-all ${
                      on ? `${CAT_BORDER[p.category] || "border-l-zinc-500"} border-violet-500/40 bg-violet-500/5`
                      : dis ? "border-l-[#1C1C21] border-[#1E1E24] opacity-25 cursor-not-allowed"
                      : `${CAT_BORDER[p.category] || "border-l-zinc-700"} border-[#1E1E24] hover:border-[#2E2E35] bg-[#131316]`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{p.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] font-medium">{p.name}</span>
                        {p.isCustom && <span className="ml-1.5 text-[9px] bg-violet-500/20 text-violet-400 px-1 py-0.5 rounded">Custom</span>}
                        <p className="text-[11px] text-zinc-500 truncate">{p.role}</p>
                      </div>
                      {on && <div className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center"><span className="text-[9px] text-white">✓</span></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom persona */}
          <div className="border border-dashed border-[#2E2E35] rounded-xl p-3 mb-8 bg-[#0D0D10]">
            <p className="text-[11px] text-zinc-500 mb-2">✨ Or describe a custom perspective</p>
            <div className="flex gap-2">
              <input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder='"A skeptical CTO who hates buzzwords and wants hard numbers"'
                className="flex-1 bg-[#131316] border border-[#1E1E24] rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/30"
                onKeyDown={(e) => e.key === "Enter" && createPersona()}
              />
              <button onClick={createPersona} disabled={!customInput.trim() || miniLoading} className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-[#1C1C21] rounded-lg text-xs font-medium transition-colors">
                {miniLoading ? "..." : "Create"}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={() => setStep("write")} className="px-4 py-2.5 rounded-xl border border-[#2E2E35] hover:bg-[#131316] text-sm transition-colors">
              ← Back
            </button>
            <button
              onClick={runAnalysis}
              disabled={selectedPersonas.length === 0 || !audienceDesc.trim()}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-[#1C1C21] disabled:text-zinc-600 text-sm font-medium transition-all"
            >
              {selectedPersonas.length === 0 ? "Select at least 1 perspective" : !audienceDesc.trim() ? "Describe your audience first" : `Analyze →`}
            </button>
          </div>
        </main>
      )}

      {/* ===== LOADING ===== */}
      {step === "loading" && (
        <main className="flex-1 flex items-center justify-center animate-fade-in">
          <div className="text-center px-5">
            <div className="flex justify-center gap-3 mb-6">
              {selectedPersonas.map((p, i) => (
                <div key={p.id} className="w-10 h-10 rounded-xl bg-[#131316] border border-[#1E1E24] flex items-center justify-center text-lg animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  {p.icon}
                </div>
              ))}
            </div>
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-zinc-300">{loadingMsg}</p>
            <p className="text-[11px] text-zinc-600 mt-1.5">This takes 15-30 seconds</p>
          </div>
        </main>
      )}

      {/* ===== RESULTS ===== */}
      {step === "results" && analyses.length > 0 && (
        <main className="flex-1 flex flex-col animate-fade-in">
          {/* Research brief (collapsible) */}
          {showResearch && research && (
            <div className="border-b border-[#1E1E24] bg-[#0D0D10] overflow-y-auto max-h-56 px-6 py-4">
              <div className="max-w-3xl mx-auto prose-brief text-xs">
                <ReactMarkdown>{research.brief}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Persona tabs */}
          <div className="border-b border-[#1E1E24] px-5 shrink-0 bg-[#0D0D10]">
            <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto py-2">
              {analyses.map((a) => (
                <button
                  key={a.personaId}
                  onClick={() => { setActivePersona(a.personaId); setShowRewrite(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activePersona === a.personaId
                      ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/25"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-[#131316]"
                  }`}
                >
                  <span>{a.personaIcon}</span>
                  <span className="hidden sm:inline">{a.personaName}</span>
                  <span className={`font-bold ${a.overallScore >= 7 ? "text-emerald-400" : a.overallScore >= 4 ? "text-amber-400" : "text-red-400"}`}>
                    {a.error ? "!" : a.overallScore}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Score + verdict */}
          {cur && !cur.error && (
            <div className="border-b border-[#1E1E24] px-5 py-3 bg-[#09090B] shrink-0">
              <div className="max-w-5xl mx-auto flex items-center gap-4">
                <div className={`text-2xl font-bold tabular-nums ${cur.overallScore >= 7 ? "text-emerald-400" : cur.overallScore >= 4 ? "text-amber-400" : "text-red-400"}`}>
                  {cur.overallScore}<span className="text-xs text-zinc-600 font-normal">/10</span>
                </div>
                <div className="h-6 w-px bg-[#2E2E35]" />
                <p className="text-xs text-zinc-400 italic leading-relaxed">&ldquo;{cur.overallVerdict}&rdquo;</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-5 py-8">
              {chunks.map((chunk, ci) => {
                const reactions = getReactions(ci);
                return (
                  <div key={ci} className="mb-8 animate-fade-in" style={{ animationDelay: `${ci * 40}ms` }}>
                    {/* Chunk header */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[#131316] border border-[#2E2E35] flex items-center justify-center text-[10px] text-zinc-500 font-mono shrink-0">{ci + 1}</div>
                      <div className="flex-1 h-px bg-[#1E1E24]" />
                      {reactions.length > 0 && (
                        <div className="flex gap-0.5">
                          {reactions.map((r, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${DOT[r.type as keyof typeof DOT] || "bg-zinc-600"}`} />)}
                        </div>
                      )}
                    </div>

                    {/* Chunk text */}
                    <div className="bg-[#131316] border border-[#1E1E24] rounded-xl p-4 mb-2">
                      <p className="text-[13px] text-zinc-300 leading-[1.7] whitespace-pre-wrap">{chunk}</p>
                    </div>

                    {/* Reactions */}
                    {reactions.map((r, ri) => {
                      const key = `${ci}-${ri}`;
                      return (
                        <div key={ri} className="ml-3 flex gap-3 mb-1.5 animate-slide-in" style={{ animationDelay: `${ri * 60}ms` }}>
                          {/* Dot + line */}
                          <div className="flex flex-col items-center pt-2.5 shrink-0">
                            <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-[#09090B] ${DOT[r.type as keyof typeof DOT] || "bg-zinc-600"}`} />
                            <div className="w-px flex-1 bg-[#1E1E24] mt-1" />
                          </div>

                          {/* Card */}
                          <div className="flex-1 bg-[#0D0D10] border border-[#1E1E24] rounded-xl p-3 hover:border-[#2E2E35] transition-colors">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-xs">{cur?.personaIcon}</span>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${SEV[r.severity as keyof typeof SEV] || ""}`}>{r.severity}</span>
                              <span className="text-[10px] text-zinc-600">{LABELS[r.type] || r.type}</span>
                            </div>

                            {/* Inner thought */}
                            <p className="text-[13px] text-zinc-200 leading-relaxed mb-1.5">{r.reaction}</p>

                            {/* Quote */}
                            <p className="text-[11px] text-zinc-500 italic border-l-2 border-[#2E2E35] pl-2 mb-1.5">&ldquo;{r.quote}&rdquo;</p>

                            {/* Rewrite */}
                            {r.rewrite && (
                              <>
                                <button onClick={() => setShowRewrite(showRewrite === key ? null : key)} className="text-[11px] text-violet-400/80 hover:text-violet-400 font-medium">
                                  {showRewrite === key ? "Hide rewrite" : "See rewrite →"}
                                </button>
                                {showRewrite === key && (
                                  <div className="mt-1.5 p-2.5 bg-violet-500/5 border border-violet-500/15 rounded-lg animate-scale-in">
                                    <p className="text-[12px] text-violet-300/90 leading-relaxed">{r.rewrite}</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Bottom: Objections + Missing */}
              {cur && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {cur.topObjections?.length > 0 && (
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                      <h4 className="text-[10px] font-medium text-red-400 uppercase tracking-widest mb-2">Questions & Pushback</h4>
                      {cur.topObjections.map((o, i) => (
                        <p key={i} className="text-[12px] text-zinc-300 mb-1.5 pl-2.5 border-l border-red-500/25">{o}</p>
                      ))}
                    </div>
                  )}
                  {cur.missingElements?.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                      <h4 className="text-[10px] font-medium text-amber-400 uppercase tracking-widest mb-2">Expected But Missing</h4>
                      {cur.missingElements.map((m, i) => (
                        <p key={i} className="text-[12px] text-zinc-300 mb-1.5 pl-2.5 border-l border-amber-500/25">{m}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-[#1E1E24] px-5 py-2.5 flex items-center justify-between bg-[#0D0D10] shrink-0">
            <a href="/app/new" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">← New analysis</a>
            <span className="text-[10px] text-zinc-600">
              {analyses.reduce((s, a) => s + (a.reactions?.length || 0), 0)} reactions · {analyses.length} perspectives
            </span>
          </div>
        </main>
      )}
    </div>
  );
}
