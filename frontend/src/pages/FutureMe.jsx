import { useEffect, useState } from "react";
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
        <div className="neo-card-warm p-[28px] sm:p-[34px]">
          <div className="mb-[20px] flex items-center gap-[8px]">
            <span className="neo-inset flex h-[32px] w-[32px] items-center justify-center text-[10px] font-bold text-[#6f96b8]">OP</span>
            <p className="neo-label uppercase">
              Opened {fmtDate(msg.unlockDate)}
            </p>
          </div>
          <p className="text-[17px] sm:text-[18px] font-normal leading-[1.6] text-[#26313b]">
            {msg.message}
          </p>
          <p className="neo-label mt-[20px] uppercase">
            Written {fmtDate(msg.createdAt)}
          </p>
        </div>
      ) : (
        <div className="neo-card p-[28px] sm:p-[34px]">
          <div className="mb-[20px] flex items-center justify-between gap-[16px]">
            <div className="flex items-center gap-[8px]">
              <span className="neo-inset flex h-[32px] w-[32px] items-center justify-center text-[10px] font-bold text-[#6f96b8]">SL</span>
              <p className="neo-label uppercase">
                Sealed until {fmtDate(msg.unlockDate)}
              </p>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6f7f8c]">
              {msg.daysLeft} {msg.daysLeft === 1 ? "day" : "days"} away
            </span>
          </div>
          {/* Blurred placeholder lines */}
          <div className="space-y-[10px]" aria-hidden="true">
            <div className="h-[14px] w-full rounded-[14px] bg-[#6f7f8c]/12 blur-[3px]" />
            <div className="h-[14px] w-[85%] rounded-[14px] bg-[#6f7f8c]/12 blur-[3px]" />
            <div className="h-[14px] w-[70%] rounded-[14px] bg-[#6f7f8c]/12 blur-[3px]" />
          </div>
          <p className="sr-only">Message content is hidden until the unlock date.</p>
          <p className="mt-[20px] text-[11px] font-medium uppercase tracking-[0.04em] text-[#6f7f8c]/70">
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
      <section className="neo-section relative flex min-h-[64dvh] items-end overflow-hidden pt-[96px]">
        <div className="neo-container grid gap-[28px] lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div className="relative z-10">
          <p
            className="neo-label mb-[18px] uppercase animate-slide-up"
            style={{ animationDelay: "80ms" }}
          >
            time capsule
          </p>
          <h1 className="text-[clamp(2.5rem,5vw,4.6rem)] font-bold leading-[1.04] text-[#26313b]">
            <span className="block animate-slide-up" style={{ animationDelay: "200ms" }}>
              dear
            </span>
            <span className="block animate-slide-up" style={{ animationDelay: "370ms" }}>
              future me
            </span>
          </h1>
          <p
            className="mt-[22px] max-w-[430px] text-[16px] font-normal leading-[1.6] text-[#6f7f8c] animate-slide-up"
            style={{ animationDelay: "540ms" }}
          >
            Write something to your future self. It'll stay sealed until you're ready to read it.
          </p>
        </div>
        <div className="neo-card-warm p-[22px] sm:p-[28px]">
          <div className="neo-inset p-[20px]">
            <p className="neo-label uppercase">next unlock preview</p>
            <p className="mt-[10px] text-[24px] font-bold text-[#26313b]">
              {fmtDate(previewUnlock.toISOString())}
            </p>
          </div>
        </div>
        </div>
      </section>

      <section className="neo-section pt-0">
        <div className="neo-container">
          <div className="max-w-[680px]">

            {submitted ? (
              <div className="neo-card animate-fade-up p-[28px] sm:p-[34px]">
                <p className="neo-label mb-[8px] uppercase">
                  sealed
                </p>
                <p className="mb-[32px] text-[24px] sm:text-[28px] font-bold leading-[1.3] text-[#26313b]">
                  Your message is sealed.
                  <br />
                  <span className="text-[#6f7f8c]">
                    See you on {fmtDate(submitted.unlockDate)}.
                  </span>
                </p>
                <button
                  onClick={handleWriteAnother}
                  className="neo-button min-h-[48px] px-[24px] py-[13px] text-[13px] font-semibold"
                >
                  write another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="neo-card p-[24px] sm:p-[32px]">
                <p className="neo-label mb-[20px] uppercase">
                  write to your future self
                </p>
                <div className="neo-inset p-[18px]">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    maxLength={1000}
                    placeholder="Write something to your future self..."
                    className="neo-focus w-full resize-none bg-transparent text-[16px] sm:text-[18px] font-normal leading-[1.6] text-[#26313b] outline-none placeholder:text-[#6f7f8c]/55"
                  />
                </div>
                <div className="mt-[8px] flex justify-end">
                  <span className="text-[11px] text-[#6f7f8c]">{message.length}/1000</span>
                </div>

                {/* Unlock options */}
                <div className="mt-[32px] sm:mt-[40px]">
                  <p className="neo-label mb-[16px] uppercase">
                    unlock after
                  </p>
                  <div className="flex flex-wrap gap-[10px]">
                    {UNLOCK_OPTIONS.map((opt) => (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => setUnlockDays(opt.days)}
                        className={`min-h-[44px] rounded-[14px] px-[22px] py-[10px] text-[12px] font-semibold transition-all duration-150 ${
                          unlockDays === opt.days
                            ? "bg-[#d9ebfa] text-[#26313b] shadow-[inset_-5px_-5px_12px_rgba(255,255,255,0.86),inset_5px_5px_12px_rgba(145,162,176,0.22)]"
                            : "neo-button-secondary"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-[12px] text-[13px] font-normal text-[#6f7f8c]">
                    Opens on {fmtDate(previewUnlock.toISOString())}
                  </p>
                </div>

                <div className="mt-[40px] flex flex-wrap items-center gap-[16px]">
                  {error && (
                    <p className="text-[12px] font-normal text-[#9a5b5b]">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !message.trim()}
                    className="neo-button min-h-[48px] px-[28px] py-[13px] text-[13px] font-semibold disabled:opacity-40"
                  >
                    {submitting ? "sealing..." : "Seal the message"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="neo-section pt-0">
        <div className="neo-container">
          <p className="neo-label mb-[28px] uppercase">
            your messages
          </p>

          {messagesLoading && (
            <div className="space-y-[16px]">
              {[1, 2].map((i) => (
                <div key={i} className="neo-card h-[140px] animate-shimmer" />
              ))}
            </div>
          )}

          {!messagesLoading && messages.length === 0 && (
            <p className="text-[17px] sm:text-[18px] font-normal leading-[1.6] text-[#6f7f8c]">
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
