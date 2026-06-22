# PocketPal 💛

A 30-second daily mental-health check-in for teens. Pick a mood, optionally jot a
note, and an AI (ASI-1) responds with something supportive and specific — then
tracks your patterns over time.

**PocketPal is a wellness/journaling tool — not a diagnostic or crisis tool.**

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React (Vite) + Tailwind CSS v4 + Recharts |
| Backend | Node.js + Express |
| AI | ASI-1 (`asi1-mini`, OpenAI-compatible API) |
| Storage | Local JSON file (`backend/data/checkins.json`) |

API key lives only in `backend/.env` — never exposed to the browser.

---

## Run it

Two terminals.

**Backend** (port 8787):
```bash
cd backend
npm install
npm run dev
```

**Frontend** (port 5173 — proxies `/api` → backend):
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## Config

`backend/.env` (copy from `.env.example`):
```
ASI1_API_KEY=...
ASI1_BASE_URL=https://api.asi1.ai/v1
ASI1_MODEL=asi1-mini
PORT=8787
```

---

## Features

### Core check-in
- Emoji 1–5 mood picker + optional free-text note
- ASI-1 reads your entry and returns an acknowledgment, one grounding tip, and a sentiment label (`stressed` / `low` / `okay` / `good` / `great`)
- Everything saved locally — no accounts, no cloud sync

### Dashboard
- Line chart of mood over the last 14 days
- Full past check-in history with sentiment tags
- Current check-in streak (shown when ≥ 2 days)

### Weekly AI insight
- After 7+ check-ins, ASI-1 surfaces a pattern sentence specific to your entries
- Trend direction: ↑ up / ↓ down / → stable

### Personal Insights Engine
- **AI memory** — last 7 check-ins' theme categories injected into every new prompt so responses get progressively more specific to you
- **Wellness profile** — pill tags for what lifts your mood vs. what tends to weigh on you
- **Monthly wrapped** — count-up stats (check-ins, avg mood, longest streak, top theme) + AI monthly reflection
- **Theme correlations** — 7 categories (school, friends, family, sports, sleep, health, hobbies) with mention counts and average mood per theme

### Location-aware crisis support
- Auto-requests GPS on load → reverse geocodes via BigDataCloud → shows the correct crisis helpline for your country
- Falls back to browser locale, then worldwide (befrienders.org)
- Crisis number is a tappable `tel:` link on mobile

### Soft escalation
- If 3+ check-ins in 7 days are `stressed`/`low`, a warm banner suggests talking to a trusted adult
- Pure backend logic — AI never triggers or influences this

### Accessibility
- A+ large-text toggle (persisted to localStorage)
- Full mobile nav with hamburger overlay
- `aria-live` on form errors, `role="img"` on chart, `fieldset`/`legend` on mood picker
- `prefers-reduced-motion` respected — all animations disabled when set

---

## Animations

| Animation | Where |
|-----------|-------|
| Time-aware greeting | Hero eyebrow + subtitle adapt to morning / afternoon / evening / late-night |
| Hero text stagger | Eyebrow → h1 line 1 → h1 line 2 → subtitle cascade (80 → 370 → 540ms) |
| Floating ambient orbs | Translucent circles drift in all dark hero sections |
| Typewriter | AI acknowledgment types in character-by-character with blinking cursor |
| Scroll-reveal | Dashboard check-ins + Insights theme rows fade-up via IntersectionObserver |
| Mood picker | Hover scale (1.04×), selected state scale + ring |
| Count-up | Monthly wrapped stats animate from 0 on render |

---

## Design

Monopo Saigon typographic system adapted for teen wellness:
- Dark hero sections (`#0d0c14`) alternating with white editorial sections (`#ffffff`)
- Inter 300/400/600, pill buttons (`border-radius: 75px`), zero shadows/gradients
- Warm amber (`#c4854a`) reserved for escalation accent only

---

## Guardrails

- AI never diagnoses conditions, infers mental illness, or gives medical advice (enforced in system prompt)
- Sentiment constrained to a fixed label set — no freeform risk inference
- Theme memory passes category labels only — raw journal text never leaves the backend
- Crisis footer is hard-coded, independent of AI output
- If ASI-1 is unreachable, backend returns a calm local fallback — demo never hard-fails
