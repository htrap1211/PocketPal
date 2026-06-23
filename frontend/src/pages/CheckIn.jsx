import { useEffect, useState } from "react";
import MoodPicker from "../components/MoodPicker.jsx";
import HeroOrbs from "../components/HeroOrbs.jsx";
import Confetti from "../components/Confetti.jsx";
import { submitCheckin } from "../api.js";
import { MOODS } from "../constants.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOOD_BG = {
  1: "#130c0c", // struggling  — deep crimson-dark
  2: "#12100a", // hard        — deep amber-dark
  3: "#0d0c14", // okay        — indigo-dark (default)
  4: "#0b130d", // good        — deep emerald-dark
  5: "#090e15", // great       — deep sapphire-dark
};

function getTimeContext() {
  const h = new Date().getHours();
  if (h >= 22 || h < 5) return {
    eyebrow: "it's late — but i'm here",
    subtitle: "Can't sleep? A moment of reflection might help.",
  };
  if (h < 9) return {
    eyebrow: "good morning",
    subtitle: "Starting the day with a check-in. Just for you.",
  };
  if (h < 12) return {
    eyebrow: "morning check-in",
    subtitle: "How's your morning going? Thirty seconds — just for you.",
  };
  if (h < 17) return {
    eyebrow: "daily check-in",
    subtitle: "Thirty seconds. Just you. No one's grading this one.",
  };
  if (h < 20) return {
    eyebrow: "good evening",
    subtitle: "How did today go, really? A moment to check in.",
  };
  return {
    eyebrow: "evening check-in",
    subtitle: "Winding down? A few seconds to see how you're really doing.",
  };
}

const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Typewriter({ text, speed = 13 }) {
  const [displayed, setDisplayed] = useState(prefersReduced ? text : "");
  const [cursorOn, setCursorOn] = useState(!prefersReduced);

  useEffect(() => {
    if (prefersReduced) { setDisplayed(text); return; }
    setDisplayed("");
    setCursorOn(true);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setTimeout(() => setCursorOn(false), 1400);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <>
      {displayed}
      {cursorOn && (
        <span
          className="ml-[3px] inline-block w-[2px] bg-paper-white animate-cursor-blink align-middle"
          style={{ height: "0.82em" }}
          aria-hidden="true"
        />
      )}
    </>
  );
}

// Concentric breathing rings — visible in hero while user reads the prompt
function BreathCircle() {
  return (
    <div
      className="pointer-events-none absolute bottom-[80px] right-[32px] hidden select-none flex-col items-center gap-[10px] sm:flex animate-fade-in"
      style={{ animationDelay: "1100ms" }}
      aria-hidden="true"
    >
      <div className="relative h-[72px] w-[72px]">
        <div
          className="absolute inset-0 rounded-full border border-paper-white/[0.07] animate-breath"
        />
        <div
          className="absolute inset-[22%] rounded-full border border-paper-white/[0.1] animate-breath"
          style={{ animationDelay: "0.4s" }}
        />
        <div
          className="absolute inset-[44%] rounded-full border border-paper-white/[0.18] animate-breath"
          style={{ animationDelay: "0.8s" }}
        />
      </div>
      <p className="text-[9px] font-normal uppercase tracking-[0.2em] text-smoke/35 animate-breath">
        breathe
      </p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function CheckIn() {
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const { eyebrow, subtitle } = getTimeContext();
  const heroBg = mood && !result ? MOOD_BG[mood] : "#0d0c14";
  const ghostEmoji = !result && mood
    ? MOODS.find((m) => m.score === mood)?.emoji
    : null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!mood) { setError("pick how you're feeling first"); return; }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await submitCheckin({ mood, note });
      setResult(data.checkin);
      setShowConfetti(true);
      setConfettiKey((k) => k + 1);
      setTimeout(() => setShowConfetti(false), 3800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMood(null);
    setNote("");
    setResult(null);
    setError("");
    setShowConfetti(false);
  }

  return (
    <>
      {showConfetti && <Confetti key={confettiKey} />}

      {/* ── Dark hero ── */}
      {!result ? (
        <section
          className="relative flex min-h-[85svh] flex-col items-start justify-end overflow-hidden px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] pb-[56px] sm:pb-[80px] pt-[68px]"
          style={{
            backgroundColor: heroBg,
            transition: "background-color 800ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <HeroOrbs />

          {/* Ghost emoji watermark — whispers the selected mood */}
          {ghostEmoji && (
            <span
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[clamp(160px,30vw,280px)] leading-none animate-fade-in"
              style={{ opacity: 0.045 }}
              aria-hidden="true"
            >
              {ghostEmoji}
            </span>
          )}

          <div className="relative z-10 max-w-[1440px]">
            <p
              className="mb-[24px] sm:mb-[28px] text-[11px] font-normal uppercase tracking-widest text-smoke animate-slide-up"
              style={{ animationDelay: "80ms" }}
            >
              {eyebrow}
            </p>
            <h1 className="text-[42px] sm:text-[58px] lg:text-[82px] font-light leading-[1.05] text-paper-white">
              <span className="block animate-slide-up" style={{ animationDelay: "200ms" }}>
                how are you,
              </span>
              <span className="block animate-slide-up" style={{ animationDelay: "370ms" }}>
                really?
              </span>
            </h1>
            <p
              className="mt-[24px] sm:mt-[28px] max-w-[360px] text-[15px] sm:text-[16px] font-normal leading-[1.39] text-ash animate-slide-up"
              style={{ animationDelay: "540ms" }}
            >
              {subtitle}
            </p>
          </div>

          <BreathCircle />

          <p
            className="absolute bottom-[32px] right-[20px] hidden animate-fade-in text-[11px] font-normal uppercase tracking-widest text-smoke/50 sm:right-[40px] sm:block"
            style={{ animationDelay: "900ms" }}
          >
            scroll to check in ↓
          </p>
        </section>
      ) : (
        /* ── Result hero — AI types back to you ── */
        <section className="relative flex min-h-[55svh] sm:min-h-[60vh] flex-col items-start justify-end overflow-hidden bg-[#0d0c14] px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] pb-[56px] sm:pb-[80px] pt-[68px] animate-fade-in">
          <HeroOrbs />
          <div className="relative z-10">
            <p
              className="mb-[24px] sm:mb-[28px] text-[11px] font-normal uppercase tracking-widest text-smoke animate-slide-up"
              style={{ animationDelay: "0ms" }}
            >
              here's what I noticed
            </p>
            <p className="max-w-[720px] text-[28px] sm:text-[34px] md:text-[39px] font-light leading-[1.2] text-paper-white">
              <Typewriter text={result.acknowledgment} speed={13} />
            </p>
          </div>
        </section>
      )}

      {/* ── White editorial ── */}
      <section className="bg-paper-white px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[48px] sm:py-[64px] md:py-[80px]">
        <div className="mx-auto max-w-[1440px]">

          {!result && (
            <form onSubmit={handleSubmit} className="max-w-[680px]">
              <div className="mb-[40px] sm:mb-[48px]">
                <p className="mb-[20px] sm:mb-[28px] text-[12px] font-normal uppercase tracking-widest text-ash">
                  today feels like
                </p>
                <MoodPicker value={mood} onChange={setMood} />
              </div>

              <div className="mb-[40px] sm:mb-[48px] border-b border-ash/30 pb-[40px] sm:pb-[48px]">
                <p className="mb-[16px] text-[12px] font-normal uppercase tracking-widest text-ash">
                  want to say more? (optional)
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="what's on your mind today…"
                  className="w-full resize-none bg-transparent text-[16px] sm:text-[18px] font-normal leading-[1.5] text-carbon outline-none placeholder:text-smoke placeholder:transition-colors focus:placeholder:text-smoke/40"
                />
              </div>

              <div className="flex flex-col gap-[20px] sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12px] font-normal text-ash">
                  🔒 your check-ins stay on this device and are never shared
                </p>
                <div className="flex items-center gap-[16px]">
                  <div aria-live="polite" aria-atomic="true">
                    {error && (
                      <p className="text-[12px] font-normal text-ash">{error}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="min-h-[48px] rounded-[75px] bg-[#1e1b2e] px-[28px] py-[14px] text-[12px] font-normal text-paper-white transition-all duration-150 hover:opacity-75 hover:scale-[0.98] active:scale-[0.94] disabled:opacity-30"
                  >
                    {loading ? "reading…" : "check in"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {result && (
            <div className="max-w-[680px] animate-fade-up">
              <div className="mb-[56px] sm:mb-[64px]">
                <p className="mb-[24px] sm:mb-[28px] text-[12px] font-normal uppercase tracking-widest text-ash">
                  try this
                </p>
                <p className="text-[24px] sm:text-[28px] md:text-[30px] font-light leading-[1.3] text-carbon">
                  {result.tip}
                </p>
              </div>

              <div className="flex flex-wrap gap-[12px]">
                <button
                  onClick={reset}
                  className="min-h-[48px] rounded-[75px] bg-[#1e1b2e] px-[28px] py-[14px] text-[12px] font-normal text-paper-white transition-all duration-150 hover:opacity-75 hover:scale-[0.98] active:scale-[0.94]"
                >
                  check in again
                </button>
                <a
                  href="/dashboard"
                  className="flex min-h-[48px] items-center rounded-[75px] border border-ash/40 px-[28px] py-[14px] text-[12px] font-normal text-ash transition-colors hover:border-carbon hover:text-carbon"
                >
                  see my trends →
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
