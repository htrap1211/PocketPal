import { useEffect, useRef, useState } from "react";
import HeroOrbs from "../components/HeroOrbs.jsx";
import { fetchWrapped } from "../api.js";

const THEME_EMOJI = {
  school: "📚", friends: "👥", family: "🏠", sports: "⚽",
  sleep: "😴", health: "💊", hobbies: "🎨",
};

const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// CountUp animation
function CountUp({ end, decimals = 0, duration = 1400 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!end && end !== 0) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(+(end * eased).toFixed(decimals));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [end, decimals, duration]);

  return <>{val}</>;
}

// Typewriter
function Typewriter({ text, speed = 18 }) {
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
        setTimeout(() => setCursorOn(false), 1800);
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
          style={{ height: "0.85em" }}
          aria-hidden="true"
        />
      )}
    </>
  );
}

function Slide1({ data, active }) {
  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long" });

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-[20px] transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <HeroOrbs />
      <div className="relative z-10">
        <p className={`mb-[16px] text-[11px] font-normal uppercase tracking-widest text-smoke ${active ? "animate-slide-up" : ""}`} style={{ animationDelay: "100ms" }}>
          {monthName}
        </p>
        <p
          className={`font-light leading-none text-paper-white ${active ? "animate-number-pop" : ""}`}
          style={{ fontSize: "clamp(80px, 20vw, 200px)", animationDelay: "200ms" }}
        >
          {active ? <CountUp end={data.checkinCount} /> : data.checkinCount}
        </p>
        <p className={`mt-[16px] text-[18px] sm:text-[22px] font-light text-smoke ${active ? "animate-slide-up" : ""}`} style={{ animationDelay: "400ms" }}>
          check-ins this month
        </p>
        <p className={`mt-[8px] text-[14px] font-normal text-smoke/60 ${active ? "animate-slide-up" : ""}`} style={{ animationDelay: "550ms" }}>
          you showed up
        </p>
      </div>
    </div>
  );
}

function Slide2({ data, active }) {
  const trend = data.averageMood >= 4 ? "strong" : data.averageMood >= 3 ? "steady" : "building";
  const trendLabel = {
    strong: "Your mood this month was strong. Keep going.",
    steady: "You held steady through it all.",
    building: "Every check-in counts — you're building something.",
  }[trend];

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-[20px] transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <HeroOrbs />
      <div className="relative z-10">
        <p className={`mb-[16px] text-[11px] font-normal uppercase tracking-widest text-smoke ${active ? "animate-slide-up" : ""}`} style={{ animationDelay: "100ms" }}>
          average mood
        </p>
        <p
          className={`font-light leading-none text-paper-white ${active ? "animate-number-pop" : ""}`}
          style={{ fontSize: "clamp(80px, 18vw, 180px)", animationDelay: "200ms" }}
        >
          {active ? <CountUp end={data.averageMood} decimals={1} /> : data.averageMood}
        </p>
        <p className={`mt-[8px] text-[14px] sm:text-[16px] font-normal text-smoke ${active ? "animate-slide-up" : ""}`} style={{ animationDelay: "300ms" }}>
          out of 5
        </p>
        <p className={`mt-[24px] max-w-[400px] text-[16px] sm:text-[18px] font-light text-ash ${active ? "animate-slide-up" : ""}`} style={{ animationDelay: "480ms" }}>
          {trendLabel}
        </p>
      </div>
    </div>
  );
}

function Slide3({ data, active }) {
  const emoji = data.topTheme ? (THEME_EMOJI[data.topTheme] || "✦") : "✦";

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-[20px] transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <HeroOrbs />
      <div className="relative z-10">
        <p className={`mb-[24px] text-[11px] font-normal uppercase tracking-widest text-smoke ${active ? "animate-slide-up" : ""}`} style={{ animationDelay: "100ms" }}>
          what was on your mind
        </p>
        <div
          className={`mb-[16px] text-[80px] sm:text-[100px] leading-none ${active ? "animate-number-pop" : ""}`}
          style={{ animationDelay: "200ms" }}
        >
          {emoji}
        </div>
        <p
          className={`font-light leading-none text-paper-white capitalize ${active ? "animate-slide-up" : ""}`}
          style={{ fontSize: "clamp(36px, 7vw, 80px)", animationDelay: "350ms" }}
        >
          {data.topTheme || "everything"}
        </p>
        <p className={`mt-[20px] text-[14px] sm:text-[16px] font-normal text-smoke ${active ? "animate-slide-up" : ""}`} style={{ animationDelay: "500ms" }}>
          your most-mentioned topic
        </p>
      </div>
    </div>
  );
}

function Slide4({ data, active }) {
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-[20px] transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <HeroOrbs />
      <div className="relative z-10">
        <p className={`mb-[16px] text-[11px] font-normal uppercase tracking-widest text-smoke ${active ? "animate-slide-up" : ""}`} style={{ animationDelay: "100ms" }}>
          your streak
        </p>
        <p
          className={`font-light leading-none text-paper-white ${active ? "animate-number-pop" : ""}`}
          style={{ fontSize: "clamp(80px, 20vw, 200px)", animationDelay: "200ms" }}
        >
          {active ? <CountUp end={data.longestStreak} /> : data.longestStreak}
        </p>
        <p className={`mt-[16px] text-[18px] sm:text-[22px] font-light text-smoke ${active ? "animate-slide-up" : ""}`} style={{ animationDelay: "400ms" }}>
          {data.longestStreak === 1 ? "day in a row" : "days in a row"}
        </p>
        {data.longestStreak >= 7 && (
          <p className={`mt-[12px] text-[14px] font-normal text-smoke/60 ${active ? "animate-slide-up" : ""}`} style={{ animationDelay: "550ms" }}>
            that's a whole week 🔥
          </p>
        )}
      </div>
    </div>
  );
}

function Slide5({ data, active, onShare }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    navigator.clipboard.writeText(window.location.origin).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShare?.();
  }

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-[20px] sm:px-[40px] transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <HeroOrbs />
      <div className="relative z-10 max-w-[720px]">
        <p className={`mb-[32px] sm:mb-[40px] text-[11px] font-normal uppercase tracking-widest text-smoke ${active ? "animate-slide-up" : ""}`} style={{ animationDelay: "100ms" }}>
          a word from pocketpal
        </p>
        {data.reflection ? (
          <p
            className={`text-[22px] sm:text-[26px] md:text-[30px] font-light leading-[1.45] text-paper-white ${active ? "" : ""}`}
          >
            {active ? <Typewriter text={data.reflection} speed={20} /> : data.reflection}
          </p>
        ) : (
          <p className="text-[22px] sm:text-[26px] font-light leading-[1.45] text-paper-white">
            You showed up for yourself this month. That's what matters.
          </p>
        )}
        <div className={`mt-[40px] sm:mt-[48px] ${active ? "animate-fade-in" : ""}`} style={{ animationDelay: "2000ms" }}>
          <button
            onClick={handleShare}
            className="min-h-[48px] rounded-[75px] border border-paper-white/25 px-[28px] py-[14px] text-[12px] font-normal text-paper-white transition-all duration-150 hover:border-paper-white/60 hover:scale-[0.98] active:scale-[0.94]"
          >
            {copied ? "link copied ✓" : "share pocketpal"}
          </button>
        </div>
      </div>
    </div>
  );
}

const SLIDE_COUNT = 5;

export default function Wrapped() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    fetchWrapped()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  function prev() { setSlide((s) => Math.max(0, s - 1)); }
  function next() { setSlide((s) => Math.min(SLIDE_COUNT - 1, s + 1)); }

  function handleKey(e) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0c14]">
        <HeroOrbs />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-[16px] h-[11px] w-[120px] rounded-sm bg-paper-white/10 animate-shimmer" />
          <div className="mx-auto h-[80px] w-[200px] rounded-sm bg-paper-white/10 animate-shimmer" />
        </div>
      </div>
    );
  }

  if (!data?.wrapped) {
    return (
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0d0c14] px-[20px] py-[80px] text-center">
        <HeroOrbs />
        <div className="relative z-10">
          <p className="mb-[24px] text-[11px] font-normal uppercase tracking-widest text-smoke animate-slide-up" style={{ animationDelay: "80ms" }}>
            wrapped
          </p>
          <h1
            className="font-light leading-[1.05] text-paper-white animate-slide-up"
            style={{ fontSize: "clamp(42px, 8vw, 90px)", animationDelay: "200ms" }}
          >
            no data yet
          </h1>
          <p className="mt-[24px] max-w-[400px] mx-auto text-[16px] font-normal text-ash animate-slide-up" style={{ animationDelay: "370ms" }}>
            Check in this month to unlock your Wrapped experience.
          </p>
          <a
            href="/"
            className="mt-[40px] inline-flex min-h-[48px] items-center rounded-[75px] border border-paper-white/20 px-[28px] py-[14px] text-[12px] font-normal text-paper-white transition-all duration-150 hover:border-paper-white/60 animate-slide-up"
            style={{ animationDelay: "500ms" }}
          >
            check in now
          </a>
        </div>
      </section>
    );
  }

  const { wrapped } = data;

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden bg-[#0d0c14]"
      onKeyDown={handleKey}
      tabIndex={0}
      style={{ outline: "none" }}
    >
      {/* Slides container */}
      <div className="relative flex-1" style={{ minHeight: "100svh" }}>
        <Slide1 data={wrapped} active={slide === 0} />
        <Slide2 data={wrapped} active={slide === 1} />
        <Slide3 data={wrapped} active={slide === 2} />
        <Slide4 data={wrapped} active={slide === 3} />
        <Slide5 data={wrapped} active={slide === 4} />
      </div>

      {/* Navigation controls */}
      <div className="fixed bottom-[32px] left-0 right-0 z-20 flex items-center justify-center gap-[16px] px-[20px]">
        <button
          onClick={prev}
          disabled={slide === 0}
          aria-label="Previous slide"
          className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-paper-white/20 text-paper-white transition-all duration-150 hover:border-paper-white/50 disabled:opacity-20"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-[8px]">
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === slide
                  ? "h-[8px] w-[24px] bg-paper-white"
                  : "h-[6px] w-[6px] bg-paper-white/30 hover:bg-paper-white/60"
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={slide === SLIDE_COUNT - 1}
          aria-label="Next slide"
          className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-paper-white/20 text-paper-white transition-all duration-150 hover:border-paper-white/50 disabled:opacity-20"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
