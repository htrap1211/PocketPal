import { useEffect, useState } from "react";
import MoodPicker from "../components/MoodPicker.jsx";
import Confetti from "../components/Confetti.jsx";
import { submitCheckin } from "../api.js";
import { MOODS } from "../constants.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

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
          className="ml-[3px] inline-block w-[2px] bg-[#26313b] animate-cursor-blink align-middle"
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
  const selectedMood = MOODS.find((m) => m.score === mood);

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

      {!result ? (
        <section
          className="neo-section relative flex min-h-[100dvh] items-center overflow-hidden pt-[96px]"
        >
          <div className="neo-container grid items-center gap-[36px] lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative z-10">
              <p
                className="neo-label mb-[18px] uppercase animate-slide-up"
                style={{ animationDelay: "80ms" }}
              >
                {eyebrow}
              </p>
              <h1 className="max-w-[620px] text-[clamp(2.5rem,5vw,4.6rem)] font-bold leading-[1.02] text-[#26313b]">
                <span className="block animate-slide-up" style={{ animationDelay: "200ms" }}>
                  how are you,
                </span>
                <span className="block animate-slide-up" style={{ animationDelay: "370ms" }}>
                  really?
                </span>
              </h1>
              <p
                className="mt-[24px] max-w-[440px] text-[16px] font-normal leading-[1.6] text-[#6f7f8c] animate-slide-up"
                style={{ animationDelay: "540ms" }}
              >
                {subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="neo-card-warm relative z-10 p-[22px] sm:p-[32px]">
              <div className="mb-[28px] flex items-start justify-between gap-[20px]">
                <div>
                  <p className="neo-label mb-[8px] uppercase">today feels like</p>
                  <p className="text-[15px] leading-[1.6] text-[#6f7f8c]">
                    Pick the closest signal. No grades here.
                  </p>
                </div>
                <div className="neo-inset flex h-[70px] w-[70px] items-center justify-center text-[28px] font-bold text-[#6f96b8]">
                  {selectedMood?.score || "?"}
                </div>
              </div>

              <MoodPicker value={mood} onChange={setMood} />

              <div className="neo-inset mt-[26px] p-[18px]">
                <label className="neo-label mb-[10px] block uppercase" htmlFor="checkin-note">
                  want to say more? optional
                </label>
                <textarea
                  id="checkin-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={5}
                  placeholder="what's on your mind today..."
                  className="neo-focus w-full resize-none bg-transparent text-[16px] font-normal leading-[1.6] text-[#26313b] outline-none placeholder:text-[#6f7f8c]/55"
                />
              </div>

              <div className="mt-[24px] flex flex-col gap-[16px] sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12px] font-normal leading-[1.5] text-[#6f7f8c]">
                  Your check-ins stay local to this demo.
                </p>
                <div className="flex items-center gap-[14px]">
                  <div aria-live="polite" aria-atomic="true">
                    {error && (
                      <p className="text-[12px] font-normal text-[#9a5b5b]">{error}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="neo-button min-h-[48px] px-[24px] py-[13px] text-[13px] font-semibold disabled:opacity-45"
                  >
                    {loading ? "reading..." : "check in"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      ) : (
        <section className="neo-section relative flex min-h-[58dvh] items-end overflow-hidden pt-[96px] animate-fade-in">
          <div className="neo-container">
          <div className="neo-card-warm max-w-[820px] p-[28px] sm:p-[40px]">
            <p
              className="neo-label mb-[20px] uppercase animate-slide-up"
              style={{ animationDelay: "0ms" }}
            >
              here's what I noticed
            </p>
            <p className="max-w-[720px] text-[28px] sm:text-[34px] md:text-[39px] font-bold leading-[1.2] text-[#26313b]">
              <Typewriter text={result.acknowledgment} speed={13} />
            </p>
          </div>
          </div>
        </section>
      )}

      <section className="neo-section pt-0">
        <div className="neo-container">

          {result && (
            <div className="neo-card max-w-[760px] p-[28px] sm:p-[36px] animate-fade-up">
              <div className="mb-[56px] sm:mb-[64px]">
                <p className="neo-label mb-[20px] uppercase">
                  try this
                </p>
                <p className="text-[24px] sm:text-[28px] md:text-[30px] font-bold leading-[1.3] text-[#26313b]">
                  {result.tip}
                </p>
              </div>

              <div className="flex flex-wrap gap-[12px]">
                <button
                  onClick={reset}
                  className="neo-button min-h-[48px] px-[24px] py-[13px] text-[13px] font-semibold"
                >
                  check in again
                </button>
                <a
                  href="/dashboard"
                  className="neo-button-secondary flex min-h-[48px] items-center px-[24px] py-[13px] text-[13px] font-semibold"
                >
                  see my trends
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
