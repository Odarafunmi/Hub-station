# Hub Station — Uneek's private hub

One calm surface for notes, voice, tasks and content. **Cool where you think, warm where you act.**

Live PWA · Next.js 14 · Tailwind · Supabase-ready (mocked with localStorage for demo)

---

## What it does (all 5 phases)

### 1 · Notes (core)
- Capture in <10s: type + **record** (MediaRecorder) with elapsed time, pause, upload on stop
- Transcription mock (server route `/api/transcribe` — API keys never reach browser), editable, audio kept
- Threaded history: new entries **append**, not merge; Africa/Lagos timestamps + edited_at
- Grouped by day, search, filters (tag / type / has audio), pin / archive / 30-day trash, code blocks

### 2 · Repurpose
- One-click **Turn into**: LinkedIn post, blog post, carousel outline
- Server assembles: system prompt + voice profile + slot + note → Claude (mocked but via `/api/generate`)
- Drafts linked to source note, editable, status `draft / ready / posted`

### 3 · LinkedIn engine
- **Layer 1** Voice profile interview (who, specialties, psychology course, audience, goals) + 5–10 style samples → style guide
- **Layer 2** Year calendar (365 slots theme/angle/postType) — lock/reorder/edit per slot; generates themes, not posts
- **Layer 3** Post for today + batch 7/30, from note overrides slot; human-touch rules, invented-fact flag, 2 variants

### 4 · Instagram strategy
- Services + goals + pillars (Showcase / Process / Education / Client / Personality)
- 12-month plan: monthly focus, weekly rhythm, pillar mix, formats (single/carousel/reel)
- Weekly idea batches + slide-by-slide carousel outlines + hashtag bank

### 5 · Private (PIN-locked)
- Login + separate PIN, re-lock after 5 min inactivity, hidden from search & AI inputs, RLS-ready
- Relationship profile (only what you enter), generator (occasion/tone/length/lang mix) → 2 variants, favourites, sent history, date reminders

### 6 · To-do + reminders (Phase 1b)
- Quick add, voice add, Today/Upcoming/Overdue/Done, due + reminder times (Africa/Lagos → UTC), repeat, link note ↔ task
- Snooze (10m/1h/tomorrow), daily summary mock, service worker + push subscription model

### Blog & Vault
- Rich-text editor (title/slug/cover/excerpt/category/tags/status), publish → `posts` table portfolio reads, unpublish
- Snippets (searchable by title/lang/tags), Ideas board (cards → convert to note)

---

## Design system

- **Color** 74% neutral / 16% Tide `#4A8FA8` / 10% Amber `#E8A10C` — amber only for recording, reminders, Today (max 2 warm elements per view). Text meets 4.5:1.
- **Type** Bricolage Grotesque (display 600–700), Figtree (body 400/600), JetBrains Mono (utility 12–13px, 0.08em tracking)
- **Space** 4px base, radii `12 / 20 / 28 / pill`, elevation 0–3
- **Motion** hover lift 2px 160ms, press scale 0.97 90ms, focus 2px Tide ring + halo, enter fade+8px 260ms stagger 40ms, complete check 420ms, recording 7-bar pulse 900ms
- **3D** CSS transforms first (no WebGL lib), perspective 900–1000px, idle ≤12°/s, tilt ≤8°, 60fps budget, respects `prefers-reduced-motion`
- **Layout** <620 bottom bar + amber capture button, 620–1023 icon rail, ≥1024 sidebar 220px + 720ch reading column

---

## Tech

| Layer | Choice |
|---|---|
| Front | Next.js App Router, React, Tailwind, framer-motion, lucide-react |
| Server logic | Route handlers (`/api/*`, Node runtime) — AI & transcription keys stay server-side |
| DB | Supabase Postgres + RLS (`user_id = auth.uid()`), Storage private `audio` bucket |
| Auth | Supabase Auth (single user) + PIN for Private |
| AI | Claude API (prompt = system + profile + task + source) |
| Transcription | Whisper/Deepgram/AssemblyAI (test with Nigerian-accented speech) |
| Hosting | Vercel → GitHub |

Data model (simplified): `notes`, `note_entries`, `drafts`, `voice_profile`, `content_calendar`, `instagram_plan`, `private_profile`, `private_messages`, `posts`, `snippets`, `ideas`, `todos`, `push_subscriptions`, `reminder_log`.

---

## Run

```bash
npm install
npm run dev      # http://localhost:3000 → /notes
npm run build
```

PWA: add to home screen, grant Notifications once (`push_subscriptions`). Scheduler (Supabase pg_cron → Edge Function every minute) sends Web Push; fallback email; `reminder_log` stores attempts. iOS needs install to home screen (16.4+).

## Demo data

Seeded: 3 notes (one with voice), 3 todos, voice profile, 1 published post, 1 snippet, 2 ideas, 1 private message. PIN `1234`. All persisted to `localStorage:hub-station-v1` (swap to Supabase by replacing `lib/store` calls).

---

Style guide v1.0 · Cool for thinking, warm for acting.
