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
    if (!mood) {
      setError("Pick how you're feeling first 🙂");
      return;
    }
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
    <section className="mx-auto flex w-[min(100%-32px,640px)] flex-col items-center pt-[64px]">
      {!result && (
        <>
          <h1 className="text-center text-[44px] leading-[1.1] tracking-heading text-hims-violet sm:text-[64px]">
            How are you,
            <br />
            really?
          </h1>
          <p className="mt-5 text-center text-[18px] leading-[1.33] tracking-body text-stone">
            Thirty seconds. Just you. No one's grading this one.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-[40px] w-full rounded-[45px] bg-paper-white p-[32px] shadow-[0px_8px_127px_0px_rgba(0,0,0,0.11)]"
          >
            <label className="mb-4 block text-[16px] tracking-body text-graphite">
              Today feels like…
            </label>
            <MoodPicker value={mood} onChange={setMood} />

            <label className="mb-3 mt-[32px] block text-[16px] tracking-body text-graphite">
              Want to say more? (totally optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="what's on your mind today…"
              className="w-full resize-none rounded-[30px] border border-linen bg-paper-white p-5 text-[16px] leading-[1.43] tracking-body text-carbon-black outline-none placeholder:text-stone focus:border-hims-violet"
            />

            {error && (
              <p className="mt-4 text-[14px] tracking-body text-stone">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-[32px] w-full rounded-[30px] border border-carbon-black px-[22px] py-4 text-[16px] tracking-body text-carbon-black transition hover:bg-carbon-black hover:text-paper-white disabled:opacity-40"
            >
              {loading ? "Reading what you shared…" : "Check in"}
            </button>
          </form>
        </>
      )}

      {result && (
        <div className="w-full pt-[40px]">
          <p className="text-center text-[14px] tracking-body text-stone">
            Thanks for checking in 💛
          </p>
          <div className="mt-5 rounded-[45px] bg-paper-white p-[32px] shadow-[0px_8px_127px_0px_rgba(0,0,0,0.11)]">
            <p className="text-[20px] leading-[1.33] tracking-body text-carbon-black">
              {result.acknowledgment}
            </p>
            <div className="mt-6 rounded-[30px] border border-linen p-6">
              <p className="mb-2 text-[14px] tracking-body text-hims-violet">
                Try this
              </p>
              <p className="text-[18px] leading-[1.33] tracking-body text-graphite">
                {result.tip}
              </p>
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={reset}
              className="rounded-[30px] border border-carbon-black px-[22px] py-3 text-[16px] tracking-body text-carbon-black transition hover:bg-carbon-black hover:text-paper-white"
            >
              Check in again
            </button>
            <a
              href="/dashboard"
              className="rounded-[30px] px-[22px] py-3 text-[16px] tracking-body text-stone transition hover:text-carbon-black"
            >
              See my trends →
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
