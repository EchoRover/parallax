"use client";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-800/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="font-semibold text-base">Parallax</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">Sign in</a>
            <a href="/app" className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-medium transition-colors">
              Try it free →
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 mb-6">
          AI-powered communication pre-flight
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-6">
          See your words through<br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            their eyes
          </span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
          You can&apos;t read your own writing from someone else&apos;s perspective. Parallax simulates how different audiences actually experience your communication — line by line, with honest reactions.
        </p>

        <div className="flex items-center justify-center gap-3 mb-16">
          <a href="/app" className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-medium transition-colors">
            Start analyzing →
          </a>
          <a href="/community" className="border border-zinc-800 hover:bg-zinc-900 px-6 py-3 rounded-xl font-medium transition-colors text-zinc-300">
            Browse personas
          </a>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm font-bold mb-3">1</div>
            <h3 className="font-medium text-sm mb-1">Paste your communication</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">Pitch, email, cover letter, README, memo — anything where words matter.</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm font-bold mb-3">2</div>
            <h3 className="font-medium text-sm mb-1">Choose perspectives</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">Select from pre-built personas or describe your own audience. AI researches them live.</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm font-bold mb-3">3</div>
            <h3 className="font-medium text-sm mb-1">Read their honest reactions</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">Each persona reads your text chunk by chunk, sharing their real-time inner monologue.</p>
          </div>
        </div>

        {/* What makes it different */}
        <div className="mt-16 text-left">
          <h2 className="text-xl font-bold text-center mb-8">Not another grammar checker</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: "Live audience research", desc: "AI searches the web to understand who your audience actually is, right now." },
              { title: "Chunk-by-chunk reading", desc: "Personas read sequentially like real humans — building context, forming opinions as they go." },
              { title: "Honest inner monologue", desc: "Not polite suggestions. Raw reactions: 'I'm lost here', 'This doesn't convince me', 'Now I'm interested'." },
              { title: "Concrete rewrites", desc: "Every flagged section comes with a specific alternative. Not 'make this clearer' but the actual rewrite." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 p-4 rounded-xl border border-zinc-800/50">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <div>
                  <h3 className="text-sm font-medium mb-0.5">{item.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 px-6 py-6 text-center">
        <p className="text-xs text-zinc-600">
          Built for Tech Builders 2026. Free and open source.
        </p>
      </footer>
    </div>
  );
}
