"use client";

import { useState, useEffect } from "react";
import { DEFAULT_PERSONAS } from "@/lib/personas";
import { createClient } from "@/utils/supabase/client";
import Nav from "@/components/nav";

const CAT_COLORS: Record<string, string> = {
  Business: "bg-blue-500/10 text-blue-400",
  Technical: "bg-emerald-500/10 text-emerald-400",
  Career: "bg-amber-500/10 text-amber-400",
  Education: "bg-violet-500/10 text-violet-400",
  Media: "bg-pink-500/10 text-pink-400",
  General: "bg-zinc-500/10 text-zinc-400",
};

interface CommunityPersona {
  id: string;
  name: string;
  role: string;
  icon: string;
  category: string;
  description: string;
  system_prompt: string;
  author_name: string;
  upvotes: number;
  created_at: string;
}

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [communityPersonas, setCommunityPersonas] = useState<CommunityPersona[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Business", "Technical", "Career", "Education", "Media", "General"];

  // Load community personas from Supabase
  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("community_personas")
          .select("*")
          .order("upvotes", { ascending: false });
        if (data) setCommunityPersonas(data);
      } catch {}
    };
    load();
  }, []);

  // Merge default + community personas for display
  const allPersonas = [
    ...DEFAULT_PERSONAS.map((p) => ({
      id: p.id, name: p.name, role: p.role, icon: p.icon, category: p.category,
      description: p.description, system_prompt: p.systemPrompt,
      author_name: "Parallax Team", upvotes: 0, created_at: "", isDefault: true,
    })),
    ...communityPersonas.map((p) => ({ ...p, isDefault: false })),
  ];

  const filtered = allPersonas.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.role.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#09090B]">
      <Nav active="community" />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Persona Community</h1>
          <p className="text-sm text-zinc-500 max-w-lg">
            Detailed AI personas crafted by real people. Each persona is a deep character profile — their knowledge, biases, reading habits, and what triggers their reactions.
            Use them in your analyses or share your own.
          </p>
        </div>

        {/* Search */}
        <div className="mb-5">
          <div className="bg-[#131316] border border-[#1E1E24] rounded-xl p-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search personas..."
              className="w-full bg-transparent px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/25"
                  : "text-zinc-500 hover:text-zinc-300 bg-[#131316] hover:bg-[#1C1C21]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Persona grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((p, i) => {
            const isExpanded = expandedId === p.id;
            return (
              <div
                key={p.id}
                className="bg-[#131316] border border-[#1E1E24] rounded-xl overflow-hidden hover:border-[#2E2E35] transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Card header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1C1C21] flex items-center justify-center text-xl shrink-0">{p.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium truncate">{p.name}</h3>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${CAT_COLORS[p.category] || CAT_COLORS.General}`}>
                          {p.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{p.role}</p>
                      <p className="text-[11px] text-zinc-600 mt-1.5 leading-relaxed">{p.description}</p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1E1E24]">
                    <span className="text-[10px] text-zinc-600">
                      by {p.author_name}
                      {(p as any).isDefault && <span className="ml-1 text-violet-500/60">&#9679; Official</span>}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {isExpanded ? "Hide prompt" : "View prompt"}
                      </button>
                      <a
                        href="/app/new"
                        className="text-[10px] text-violet-400 hover:text-violet-300 font-medium transition-colors"
                      >
                        Use &#8594;
                      </a>
                    </div>
                  </div>
                </div>

                {/* Expanded prompt */}
                {isExpanded && (
                  <div className="border-t border-[#1E1E24] bg-[#0D0D10] p-4 animate-scale-in">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">System Prompt</p>
                    <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{p.system_prompt}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-zinc-600">No personas match your search.</p>
          </div>
        )}

        {/* Share CTA */}
        <div className="mt-10 p-6 rounded-2xl border border-dashed border-[#2E2E35] text-center bg-[#0D0D10]">
          <h3 className="text-sm font-medium mb-1">Share your expertise</h3>
          <p className="text-xs text-zinc-500 mb-4 max-w-md mx-auto">
            Write a detailed persona prompt — describe the character&apos;s knowledge, biases, reading habits, and what makes them tick. The best personas are 500-1000+ words of specific behavioral detail.
          </p>
          <a href="/app/new" className="inline-block text-xs bg-violet-600 hover:bg-violet-500 px-5 py-2 rounded-lg text-white font-medium transition-colors">
            Create &amp; Share a Persona
          </a>
        </div>
      </main>
    </div>
  );
}
