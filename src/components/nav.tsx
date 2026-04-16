"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Nav({ active }: { active?: "dashboard" | "community" | "new" }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="border-b border-[#1E1E24] px-5 py-2.5 bg-[#09090B] shrink-0">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Left: Logo + nav links */}
        <div className="flex items-center gap-5">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="font-semibold text-sm">Parallax</span>
          </a>

          <div className="hidden sm:flex items-center gap-1">
            <a
              href="/app"
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                active === "dashboard" ? "text-zinc-200 bg-[#131316]" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Dashboard
            </a>
            <a
              href="/community"
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                active === "community" ? "text-zinc-200 bg-[#131316]" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Community
            </a>
          </div>
        </div>

        {/* Right: Auth state */}
        <div className="flex items-center gap-3">
          <a
            href="/app/new"
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              active === "new"
                ? "bg-violet-600 text-white"
                : "bg-violet-600/10 text-violet-400 hover:bg-violet-600/20"
            }`}
          >
            + New
          </a>

          {loading ? (
            <div className="w-7 h-7 rounded-full bg-[#131316] animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[#131316] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-[#131316] border border-[#2E2E35] rounded-xl shadow-xl z-50 overflow-hidden animate-scale-in">
                    <div className="px-3 py-2.5 border-b border-[#1E1E24]">
                      <p className="text-xs font-medium text-zinc-200 truncate">{user.email}</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">Signed in</p>
                    </div>
                    <div className="p-1">
                      <a href="/app" className="block px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-[#1C1C21] rounded-lg transition-colors">
                        Dashboard
                      </a>
                      <a href="/community" className="block px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-[#1C1C21] rounded-lg transition-colors">
                        Community
                      </a>
                    </div>
                    <div className="p-1 border-t border-[#1E1E24]">
                      <button
                        onClick={signOut}
                        className="w-full text-left px-3 py-2 text-xs text-red-400/80 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <a
              href="/login"
              className="text-xs text-zinc-500 hover:text-zinc-300 px-2.5 py-1.5 rounded-lg border border-[#2E2E35] hover:bg-[#131316] transition-colors"
            >
              Sign in
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
