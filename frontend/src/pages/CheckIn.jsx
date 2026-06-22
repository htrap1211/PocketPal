import { useState } from "react";
import MoodPicker from "../components/MoodPicker.jsx";
import { submitCheckin } from "../api.js";

export default function CheckIn() {
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!mood) { setError("pick how you're feeling first"); return; }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await submitCheckin({ mood, note });
      setResult(data.checkin);
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
  }

  return (
    <>
      {/* ── Dark immersive hero ── */}
      {!result ? (
        <section className="relative flex min-h-screen flex-col items-start justify-end bg-ink-black px-[40px] pb-[80px] pt-[68px] md:px-[80px]">
          <div className="max-w-[1440px]">
            <p className="mb-[28px] text-[11px] font-normal uppercase tracking-widest text-smoke">
              daily check-in
            </p>
            <h1 className="text-[64px] font-light leading-[1.05] text-paper-white md:text-[94px]">
              how are you,
              <br />
              really?
            </h1>
            <p className="mt-[28px] max-w-[360px] text-[16px] font-normal leading-[1.39] text-ash">
              Thirty seconds. Just you. No one's grading this one.
            </p>
          </div>
          {/* scroll nudge */}
          <p className="absolute bottom-[40px] right-[40px] text-[11px] font-normal uppercase tracking-widest text-smoke">
            scroll to check in ↓
          </p>
        </section>
      ) : (
        /* ── Dark result hero ── */
        <section className="relative flex min-h-[60vh] flex-col items-start justify-end bg-ink-black px-[40px] pb-[80px] pt-[68px] md:px-[80px] animate-fade-in">
          <p className="mb-[28px] text-[11px] font-normal uppercase tracking-widest text-smoke">
            here's what I noticed
          </p>
          <p className="max-w-[720px] text-[39px] font-light leading-[1.19] text-paper-white">
            {result.acknowledgment}
          </p>
        </section>
      )}

      {/* ── White editorial form / result ── */}
      <section className="bg-paper-white px-[40px] py-[80px] md:px-[80px]">
        <div className="mx-auto max-w-[1440px]">

          {!result && (
            <form onSubmit={handleSubmit} className="max-w-[680px]">
              {/* Mood picker */}
              <div className="mb-[48px]">
                <p className="mb-[28px] text-[12px] font-normal uppercase tracking-widest text-ash">
                  today feels like
                </p>
                <MoodPicker value={mood} onChange={setMood} />
              </div>

              {/* Note */}
              <div className="mb-[48px] border-b border-ash/30 pb-[48px]">
                <p className="mb-[16px] text-[12px] font-normal uppercase tracking-widest text-ash">
                  want to say more? (optional)
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={5}
                  placeholder="what's on your mind today…"
                  className="w-full resize-none bg-transparent text-[18px] font-normal leading-[1.36] text-carbon outline-none placeholder:text-smoke"
                />
              </div>

              {/* Privacy + submit */}
              <div className="flex flex-col gap-[28px] sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12px] font-normal text-ash">
                  🔒 your check-ins stay on this device and are never shared
                </p>
                <div className="flex items-center gap-[16px]">
                  {error && (
                    <p className="text-[12px] font-normal text-ash">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-[75px] bg-ink-black px-[28px] py-[12px] text-[12px] font-normal text-paper-white transition-opacity hover:opacity-70 disabled:opacity-30"
                  >
                    {loading ? "reading…" : "check in"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {result && (
            <div className="max-w-[680px] animate-fade-up">
              {/* Tip block */}
              <div className="mb-[64px]">
                <p className="mb-[28px] text-[12px] font-normal uppercase tracking-widest text-ash">
                  try this
                </p>
                <p className="text-[30px] font-light leading-[1.25] text-carbon">
                  {result.tip}
                </p>
              </div>

              <div className="flex gap-[16px]">
                <button
                  onClick={reset}
                  className="rounded-[75px] bg-ink-black px-[28px] py-[12px] text-[12px] font-normal text-paper-white transition-opacity hover:opacity-70"
                >
                  check in again
                </button>
                <a
                  href="/dashboard"
                  className="rounded-[75px] border border-ash/40 px-[28px] py-[12px] text-[12px] font-normal text-ash transition-colors hover:border-carbon hover:text-carbon"
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
