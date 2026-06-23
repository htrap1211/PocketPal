import { useEffect, useState } from "react";
import { fetchChapter } from "../api.js";
import { useInView } from "../utils/useInView.js";

const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Typewriter({ text, speed = 16 }) {
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
        setTimeout(() => setCursorOn(false), 1600);
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
          style={{ height: "0.85em" }}
          aria-hidden="true"
        />
      )}
    </>
  );
}

function Skeleton() {
  return (
    <>
      <section className="neo-section relative flex min-h-[64dvh] items-end overflow-hidden pt-[96px]">
        <div className="neo-container w-full">
          <div className="neo-card-warm max-w-[720px] p-[28px] sm:p-[40px]">
            <div className="mb-[24px] h-[11px] w-[160px] rounded-[14px] bg-[#6f7f8c]/12 animate-shimmer" />
            <div className="mb-[12px] h-[60px] w-[80%] rounded-[14px] bg-[#6f7f8c]/12 animate-shimmer" />
            <div className="h-[60px] w-[60%] rounded-[14px] bg-[#6f7f8c]/12 animate-shimmer" />
          </div>
        </div>
      </section>
      <section className="neo-section pt-0">
        <div className="neo-container space-y-[16px]">
          {[200, 160, 260, 180].map((w, i) => (
            <div key={i} className="neo-card max-w-[860px] p-[24px]">
              <div className="mb-[12px] h-[11px] w-[100px] rounded-[14px] bg-[#6f7f8c]/12 animate-pulse" />
              <div className="h-[32px] rounded-[14px] bg-[#6f7f8c]/10 animate-pulse" style={{ width: `${w}px` }} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="neo-label mb-[12px] uppercase">
      {children}
    </p>
  );
}

function ContentBlock({ label, children, index }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`neo-card mb-[16px] p-[24px] transition-all duration-500 ease-out sm:p-[30px] ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[10px]"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}

export default function Chapters() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChapter()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  const now = new Date();
  const monthLabel = now.toLocaleString("default", { month: "long" }).toLowerCase();
  const yearLabel = now.getFullYear();

  if (!data?.chapter) {
    return (
      <>
        <section className="neo-section relative flex min-h-[64dvh] items-end overflow-hidden pt-[96px]">
          <div className="neo-container">
            <p className="neo-label mb-[18px] uppercase animate-slide-up" style={{ animationDelay: "80ms" }}>
              chapter {monthLabel} {yearLabel}
            </p>
            <h1 className="text-[clamp(2.5rem,5vw,4.6rem)] font-bold leading-[1.04] text-[#26313b]">
              <span className="block animate-slide-up" style={{ animationDelay: "200ms" }}>your chapter</span>
              <span className="block animate-slide-up" style={{ animationDelay: "370ms" }}>is unfolding</span>
            </h1>
          </div>
        </section>
        <section className="neo-section pt-0">
          <div className="neo-container">
            <div className="neo-card max-w-[560px] p-[28px]">
            <p className="max-w-[520px] text-[18px] sm:text-[20px] font-normal leading-[1.6] text-[#6f7f8c]">
              Check in a few more times this month to unlock your chapter.
            </p>
            <a
              href="/"
              className="neo-button mt-[28px] inline-flex min-h-[48px] items-center px-[24px] py-[13px] text-[13px] font-semibold"
            >
              check in now
            </a>
            </div>
          </div>
        </section>
      </>
    );
  }

  const { chapter } = data;

  return (
    <>
      <section className="neo-section relative flex min-h-[64dvh] items-end overflow-hidden pt-[96px]">
        <div className="neo-container">
          <p
            className="neo-label mb-[18px] uppercase animate-slide-up"
            style={{ animationDelay: "80ms" }}
          >
            chapter {monthLabel} {yearLabel}
          </p>
          <h1 className="max-w-[860px] text-[clamp(2.5rem,5vw,4.6rem)] font-bold leading-[1.04] text-[#26313b] animate-slide-up" style={{ animationDelay: "200ms" }}>
            {chapter.title}
          </h1>
        </div>
      </section>

      <section className="neo-section pt-0">
        <div className="neo-container">
          <div className="max-w-[860px]">

            <ContentBlock label="Main Challenge" index={0}>
              <p className="text-[24px] sm:text-[28px] md:text-[32px] font-bold leading-[1.3] text-[#26313b]">
                {chapter.mainChallenge}
              </p>
            </ContentBlock>

            {chapter.supportingThemes?.length > 0 && (
              <ContentBlock label="Themes" index={1}>
                <div className="flex flex-wrap gap-[8px] mt-[4px]">
                  {chapter.supportingThemes.map((theme) => (
                    <span
                      key={theme}
                      className="inline-flex items-center rounded-[14px] bg-[#edf3f7] px-[16px] py-[9px] text-[13px] font-semibold text-[#6f7f8c] shadow-[-5px_-5px_14px_rgba(255,255,255,0.78),5px_5px_14px_rgba(145,162,176,0.16)] capitalize"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </ContentBlock>
            )}

            <ContentBlock label="Turning Point" index={2}>
              <p className="text-[18px] sm:text-[20px] font-normal leading-[1.6] text-[#26313b]">
                {chapter.turningPoint}
              </p>
            </ContentBlock>

            <ContentBlock label="Growth" index={3}>
              <p className="text-[18px] sm:text-[20px] font-normal leading-[1.6] text-[#26313b]">
                {chapter.growthSummary}
              </p>
            </ContentBlock>
          </div>
        </div>
      </section>

      <section className="neo-section pt-0">
        <div className="neo-container">
          <div className="neo-card-warm max-w-[860px] p-[28px] sm:p-[40px]">
          <p className="neo-label mb-[24px] uppercase">
            your chapter
          </p>
          <p className="max-w-[760px] text-[28px] sm:text-[32px] md:text-[34px] font-bold leading-[1.42] text-[#26313b]">
            <Typewriter text={chapter.chapterNarrative} speed={18} />
          </p>
          </div>
        </div>
      </section>
    </>
  );
}
