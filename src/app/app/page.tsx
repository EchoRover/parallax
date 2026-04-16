"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Nav from "@/components/nav";

interface Session {
  id: string;
  title: string;
  audience_description: string;
  created_at: string;
  results: any[];
}

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("analyses")
          .select("id, title, audience_description, created_at, results")
          .order("created_at", { ascending: false })
          .limit(10);
        setSessions(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const avgScore = (results: any[]) => {
    if (!results?.length) return null;
    const scores = results.filter((r: any) => r.overallScore > 0).map((r: any) => r.overallScore);
    return scores.length ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1) : null;
  };

  return (
    <div className="min-h-screen bg-[#09090B]">
      <Nav active="dashboard" />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold mb-2">
            {user ? `Welcome back` : `Welcome to Parallax`}
          </h1>
          <p className="text-sm text-zinc-500 max-w-lg">
            Test how your communication lands with different audiences before you send it.
          </p>
        </div>

        {/* New Analysis CTA */}
        <a
          href="/app/new"
          className="block mb-10 p-6 rounded-2xl border border-dashed border-[#2E2E35] hover:border-violet-500/30 bg-[#131316] hover:bg-[#131316]/80 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 group-hover:bg-violet-500/20 flex items-center justify-center transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <h2 className="font-medium text-base group-hover:text-violet-300 transition-colors">New Analysis</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Paste a pitch, email, cover letter, README — anything where words matter</p>
            </div>
            <svg className="ml-auto text-zinc-600 group-hover:text-violet-400 transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </a>

        {/* Past Sessions */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl skeleton" />
            ))}
          </div>
        ) : sessions.length > 0 ? (
          <div>
            <h2 className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-3">Recent Analyses</h2>
            <div className="space-y-2">
              {sessions.map((s, i) => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl bg-[#131316] border border-[#1E1E24] hover:border-[#2E2E35] transition-all animate-fade-in-up cursor-pointer"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate pr-4">{s.title || "Untitled"}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-zinc-600">
                          {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-xs text-zinc-600 truncate">{s.audience_description}</span>
                      </div>
                    </div>
                    {avgScore(s.results) && (
                      <div className={`text-lg font-bold tabular-nums ${
                        Number(avgScore(s.results)) >= 7 ? "text-emerald-400" :
                        Number(avgScore(s.results)) >= 4 ? "text-amber-400" : "text-red-400"
                      }`}>
                        {avgScore(s.results)}<span className="text-xs text-zinc-600 font-normal">/10</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !user ? (
          <div className="text-center py-16 bg-[#131316] border border-[#1E1E24] rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-[#1C1C21] flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <p className="text-sm text-zinc-400 mb-1">Sign in to save your analyses</p>
            <p className="text-xs text-zinc-600 mb-4">Your past sessions and results will appear here</p>
            <a href="/login" className="inline-block text-xs bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg text-white font-medium transition-colors">
              Sign in
            </a>
          </div>
        ) : (
          <div className="text-center py-16 bg-[#131316] border border-[#1E1E24] rounded-2xl">
            <p className="text-sm text-zinc-500">No analyses yet. Start your first one above.</p>
          </div>
        )}
      </main>
    </div>
  );
}
