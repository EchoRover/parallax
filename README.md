# Parallax

> See your words through their eyes.

[![Stack](https://img.shields.io/badge/Stack-Next.js%20%2B%20Gemini%20%2B%20Supabase-7C3AED?style=for-the-badge)](#architecture)
[![Personas](https://img.shields.io/badge/Personas-6%20Default%20%2B%20Custom-A78BFA?style=for-the-badge)](#personas)

AI-powered communication pre-flight. Paste any communication, select your audience, and independent AI personas read your text chunk by chunk — sharing honest reactions, objections, and rewrite suggestions before you hit send.

**Evan Johan Tobias** | IIT Delhi — Abu Dhabi | Tech Builders 2026

---

## The Problem

You can't read your own writing through someone else's eyes. Every founder, student, and professional has sent a pitch, email, or cover letter that made perfect sense to them — but confused their audience.

Current solutions either coach your **delivery** (Yoodli, Orai — how you speak, not what you say) or test **marketing copy** with expensive human panels (Wynter — $800/mo, 48-hour turnaround). Nothing lets you instantly see how different audiences react to the **content itself**.

## What Parallax Does

1. **Paste** any communication — pitch, email, cover letter, README, memo
2. **Describe** your audience — the AI researches them using live web search
3. **Select personas** — independent AI agents each read your text chunk by chunk
4. **Read reactions** — a timeline of honest, first-person feedback with severity ratings and concrete rewrites

---

## Architecture

```
User -> Next.js App Router (Vercel)
          |-- /api/research  -> Gemini 2.5 Flash + Google Search Grounding
          |-- /api/analyze   -> Parallel persona execution (Promise.all)
          '-- /api/persona   -> Custom persona generation
                                     |
                               Supabase (Auth + PostgreSQL)
                                     |
                               Analysis history + Community personas
```

### Key Design Decisions

- **Chunk-based reading with memory.** Text is split into paragraphs. Each persona reads sequentially, carrying forward impressions — first impressions color everything after.
- **Parallel independent execution.** Each persona runs as a separate API call via `Promise.all()`. No cross-contamination between perspectives.
- **Grounded research.** Gemini searches the live web before analysis so feedback reflects current audience priorities, not just training data.
- **Fallback chain.** Grounded model -> standard model -> lite model. Degrades gracefully, never crashes.
- **Deep persona prompts.** 500+ words each — reading patterns, biases, pet peeves, memory behavior. Not just role labels.

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS 4 |
| AI | Gemini 2.5 Flash + Google Search Grounding |
| Auth + DB | Supabase (PostgreSQL, RLS) |
| Hosting | Vercel |

---

## Personas

Six deeply crafted defaults (500+ word system prompts each):

| Persona | Role | Distinct Behavior |
|---------|------|-------------------|
| Sarah Chen | Skeptical VC | Eyes jump to numbers first. "Revolutionary" = instant skepticism. |
| Alex Rivera | Product Designer | Evaluates structure before content. >30 word sentences = resentment. |
| Marcus Obi | Principal Engineer | "AI-powered" without specs = hand-waving. Precision over persuasion. |
| Priya Sharma | Tech Recruiter | 6-second scan pattern. No quantified impact = skip. |
| Jordan Lee | College Freshman | Reads every word. Confusion compounds on shaky foundation. |
| Kate Morrison | Tech Journalist | First paragraph sets everything. "Revolutionary" = mass email. |

Users can also create **custom personas** from a text description.

---

## Running Locally

```bash
git clone https://github.com/EchoRover/parallax.git
cd parallax
npm install
```

Create `.env.local`:
```
GEMINI_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

```bash
npm run dev
```

---

## License

MIT
