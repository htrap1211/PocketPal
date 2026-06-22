# PocketPal 💛

A 30-second daily mental-health check-in for teens. Pick a mood, optionally jot a
note, and an AI (ASI-1) reads what you shared, responds with something supportive
and specific, and tracks your mood trends over time.

**PocketPal is a wellness/journaling tool — not a diagnostic or crisis tool.**

## Stack

- **Frontend:** React (Vite) + Tailwind CSS v4 + Recharts
- **Backend:** Node.js + Express, single route that calls the **ASI-1** API
  (`asi1-mini`, OpenAI-compatible) to analyze the check-in
- **Storage:** local JSON file (`backend/data/checkins.json`) — single demo user,
  no login
- **API key:** lives only in `backend/.env`, never exposed to the browser

## Run it

Two terminals.

**Backend** (port 8787):
```bash
cd backend
npm install
npm run dev      # or: npm start
```

**Frontend** (port 5173, proxies /api -> backend):
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Config

`backend/.env` (copy from `.env.example`):
```
ASI1_API_KEY=...        # your ASI-1 key — keep secret
ASI1_BASE_URL=https://api.asi1.ai/v1
ASI1_MODEL=asi1-mini
PORT=8787
```

> ⚠️ The key used during setup was pasted in plaintext — rotate it before any
> public demo or commit.

## Features

1. **Check-in flow** — emoji 1-5 mood + optional free-text note.
2. **AI analysis** — backend sends mood + note to ASI-1, which (a) acknowledges
   what you shared, (b) gives one short specific tip/prompt, (c) returns a
   sentiment label (`stressed` / `low` / `okay` / `good` / `great`).
3. **Storage** — every check-in saved with date, mood, sentiment, note.
4. **Dashboard** — line chart of mood over the last 14 days + list of past
   check-ins.
5. **Soft escalation** — if 3+ check-ins in the last 7 days are `stressed`/`low`,
   a gentle, non-alarming banner suggests talking to a trusted adult.
6. **Crisis footer** — always-visible 988 helpline note, separate from AI logic.

## Guardrails

- The AI never diagnoses conditions or gives medical advice (enforced in the
  system prompt + sentiment is constrained to a fixed set).
- If ASI-1 is unreachable, the backend returns a calm local fallback so the demo
  never hard-fails.
- The crisis helpline footer is hard-coded, independent of any AI output.
