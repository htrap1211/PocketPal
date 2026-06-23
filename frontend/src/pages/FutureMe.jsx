import { useEffect, useState } from "react";
import HeroOrbs from "../components/HeroOrbs.jsx";
import { submitFutureMe, fetchFutureMe } from "../api.js";
import { useInView } from "../utils/useInView.js";

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function MessageCard({ msg, index }) {
  const [ref, inView] = useInView(0.08);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[10px]"
      }`}
      style={{ transitionDelay: `${Math.min(index * 60, 360)}ms` }}
    >
      {msg.unlocked ? (
        /* Unlocked card */
        <div
          className="rounded-[4px] border p-[28px] sm:p-[36px]"
          style={{
            borderColor: "rgba(196,133,74,0.4)",
            boxShadow: "0 0 32px rgba(196,133,74,0.08)",
            background: "#0d0c14",
          }}
        >
          <div className="mb-[20px] flex items-center gap-[8px]">
            <span className="text-[18px]">📖</span>
            <p className="text-[11px] font-normal uppercase tracking-widest" style={{ color: "#c4854a" }}>
              Opened {fmtDate(msg.unlockDate)}
            </p>
          </div>
          <p className="text-[17px] sm:text-[18px] font-light leading-[1.6] text-paper-white">
            {msg.message}
          </p>
          <p className="mt-[20px] text-[11px] font-normal uppercase tracking-widest text-smoke">
            Written {fmtDate(msg.createdAt)}
          </p>
        </div>
      ) : (
        /* Locked card */
        <div className="rounded-[4px] border border-paper-white/[0.08] bg-[#0f0e19] p-[28px] sm:p-[36px]">
          <div className="mb-[20px] flex items-center justify-between gap-[16px]">
            <div className="flex items-center gap-[8px]">
              <span className="text-[18px]">📬</span>
              <p className="text-[11px] font-normal uppercase tracking-widest text-smoke">
                Sealed until {fmtDate(msg.unlockDate)}
              </p>
            </div>
            <span className="text-[11px] font-normal uppercase tracking-widest text-smoke">
              {msg.daysLeft} {msg.daysLeft === 1 ? "day" : "days"} away
            </span>
          </div>
          {/* Blurred placeholder lines */}
          <div className="space-y-[10px]" aria-hidden="true">
            <div className="h-[14px] w-full rounded-sm bg-paper-white/[0.06] blur-[3px]" />
            <div className="h-[14px] w-[85%] rounded-sm bg-paper-white/[0.06] blur-[3px]" />
            <div className="h-[14px] w-[70%] rounded-sm bg-paper-white/[0.06] blur-[3px]" />
          </div>
          <p className="sr-only">Message content is hidden until the unlock date.</p>
          <p className="mt-[20px] text-[11px] font-normal uppercase tracking-widest text-smoke/50">
            Written {fmtDate(msg.createdAt)}
          </p>
        </div>
      )}
    </div>
  );
}

const UNLOCK_OPTIONS = [
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "1 year" },
];

export default function FutureMe() {
  const [message, setMessage] = useState("");
  const [unlockDays, setUnlockDays] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null); // saved entry
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  function loadMessages() {
    return fetchFutureMe()
      .then((d) => setMessages(d.messages || []))
      .finally(() => setMessagesLoading(false));
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) { setError("write something to your future self first"); return; }
    setError("");
    setSubmitting(true);
    try {
      const entry = await submitFutureMe({ message, unlockDays });
      setSubmitted(entry);
      setMessage("");
      // Reload messages list
      setMessagesLoading(true);
      await loadMessages();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleWriteAnother() {
    setSubmitted(null);
    setError("");
  }

  const now = new Date();
  const previewUnlock = new Date(now.getTime() + unlockDays * 86400000);

  return (
    <>
      {/* ── Dark hero ── */}
      <section className="relative flex min-h-[75svh] flex-col items-start justify-end overflow-hidden bg-[#0d0c14] px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] pb-[56px] sm:pb-[80px] pt-[68px]">
        <HeroOrbs />
        <div className="relative z-10 max-w-[1440px]">
          <p
            className="mb-[24px] sm:mb-[28px] text-[11px] font-normal uppercase tracking-widest text-smoke animate-slide-up"
            style={{ animationDelay: "80ms" }}
          >
            time capsule
          </p>
          <h1 className="text-[42px] sm:text-[58px] lg:text-[82px] font-light leading-[1.05] text-paper-white">
            <span className="block animate-slide-up" style={{ animationDelay: "200ms" }}>
              dear
            </span>
            <span className="block animate-slide-up" style={{ animationDelay: "370ms" }}>
              future me
            </span>
          </h1>
          <p
            className="mt-[24px] sm:mt-[28px] max-w-[400px] text-[15px] sm:text-[16px] font-normal leading-[1.5] text-ash animate-slide-up"
            style={{ animationDelay: "540ms" }}
          >
            Write something to your future self. It'll stay sealed until you're ready to read it.
          </p>
        </div>
      </section>

      {/* ── White compose section ── */}
      <section className="bg-paper-white px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[48px] sm:py-[64px] md:py-[80px]">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-[680px]">

            {submitted ? (
              /* Success state */
              <div className="animate-fade-up">
                <p className="mb-[8px] text-[11px] font-normal uppercase tracking-widest text-ash">
                  sealed
                </p>
                <p className="mb-[32px] text-[24px] sm:text-[28px] font-light leading-[1.3] text-carbon">
                  Your message is sealed.
                  <br />
                  <span className="text-ash">
                    See you on {fmtDate(submitted.unlockDate)}.
                  </span>
                </p>
                <button
                  onClick={handleWriteAnother}
                  className="min-h-[48px] rounded-[75px] bg-[#1e1b2e] px-[28px] py-[14px] text-[12px] font-normal text-paper-white transition-all duration-150 hover:opacity-75 hover:scale-[0.98] active:scale-[0.94]"
                >
                  write another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="mb-[20px] text-[12px] font-normal uppercase tracking-widest text-ash">
                  write to your future self
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  maxLength={1000}
                  placeholder="Write something to your future self…"
                  className="w-full resize-none border-b border-ash/30 bg-transparent pb-[24px] text-[16px] sm:text-[18px] font-normal leading-[1.6] text-carbon outline-none placeholder:text-smoke placeholder:transition-colors focus:placeholder:text-smoke/40 focus:border-carbon transition-colors"
                />
                <div className="mt-[8px] flex justify-end">
                  <span className="text-[11px] text-smoke">{message.length}/1000</span>
                </div>

                {/* Unlock options */}
                <div className="mt-[32px] sm:mt-[40px]">
                  <p className="mb-[16px] text-[12px] font-normal uppercase tracking-widest text-ash">
                    unlock after
                  </p>
                  <div className="flex flex-wrap gap-[10px]">
                    {UNLOCK_OPTIONS.map((opt) => (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => setUnlockDays(opt.days)}
                        className={`min-h-[44px] rounded-[75px] px-[24px] py-[10px] text-[12px] font-normal transition-all duration-150 ${
                          unlockDays === opt.days
                            ? "bg-[#1e1b2e] text-paper-white"
                            : "border border-ash/40 text-ash hover:border-carbon hover:text-carbon"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-[12px] text-[13px] font-normal text-smoke">
                    Opens on {fmtDate(previewUnlock.toISOString())}
                  </p>
                </div>

                <div className="mt-[40px] flex flex-wrap items-center gap-[16px]">
                  {error && (
                    <p className="text-[12px] font-normal text-ash">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !message.trim()}
                    className="min-h-[48px] rounded-[75px] bg-[#1e1b2e] px-[32px] py-[14px] text-[12px] font-normal text-paper-white transition-all duration-150 hover:opacity-75 hover:scale-[0.98] active:scale-[0.94] disabled:opacity-30"
                  >
                    {submitting ? "sealing…" : "Seal the message →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Dark messages list ── */}
      <section className="bg-[#0d0c14] px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[48px] sm:py-[64px] md:py-[80px]">
        <div className="mx-auto max-w-[1440px]">
          <p className="mb-[32px] sm:mb-[40px] text-[11px] font-normal uppercase tracking-widest text-smoke">
            your messages
          </p>

          {messagesLoading && (
            <div className="space-y-[16px]">
              {[1, 2].map((i) => (
                <div key={i} className="h-[140px] rounded-[4px] border border-paper-white/[0.06] animate-shimmer" />
              ))}
            </div>
          )}

          {!messagesLoading && messages.length === 0 && (
            <p className="text-[17px] sm:text-[18px] font-light leading-[1.5] text-smoke">
              No messages yet — write one to your future self.
            </p>
          )}

          {!messagesLoading && messages.length > 0 && (
            <div className="max-w-[720px] space-y-[16px]">
              {/* Show newest first */}
              {[...messages].reverse().map((msg, i) => (
                <MessageCard key={msg.id} msg={msg} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
