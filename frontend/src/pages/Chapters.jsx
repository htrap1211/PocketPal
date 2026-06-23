import { useEffect, useState } from "react";
import HeroOrbs from "../components/HeroOrbs.jsx";
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
          className="ml-[3px] inline-block w-[2px] bg-paper-white animate-cursor-blink align-middle"
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
      {/* Dark hero skeleton */}
      <section className="relative flex min-h-[75svh] flex-col items-start justify-end overflow-hidden bg-[#0d0c14] px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] pb-[56px] sm:pb-[80px] pt-[68px]">
        <HeroOrbs />
        <div className="relative z-10 w-full max-w-[640px]">
          <div className="mb-[24px] h-[11px] w-[160px] rounded-sm bg-paper-white/10 animate-shimmer" />
          <div className="mb-[12px] h-[60px] w-[80%] rounded-sm bg-paper-white/10 animate-shimmer" />
          <div className="h-[60px] w-[60%] rounded-sm bg-paper-white/10 animate-shimmer" />
        </div>
      </section>
      {/* White section skeleton */}
      <section className="bg-paper-white px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[48px] sm:py-[64px] md:py-[80px]">
        <div className="mx-auto max-w-[1440px] space-y-[48px]">
          {[200, 160, 260, 180].map((w, i) => (
            <div key={i}>
              <div className="mb-[12px] h-[11px] w-[100px] rounded-sm bg-smoke/20 animate-pulse" />
              <div className="h-[32px] rounded-sm bg-smoke/10 animate-pulse" style={{ width: `${w}px` }} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="mb-[12px] text-[11px] font-normal uppercase tracking-widest text-ash">
      {children}
    </p>
  );
}

function ContentBlock({ label, children, index }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`border-t border-ash/15 py-[32px] sm:py-[40px] transition-all duration-500 ease-out ${
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
        <section className="relative flex min-h-[75svh] flex-col items-start justify-end overflow-hidden bg-[#0d0c14] px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] pb-[56px] sm:pb-[80px] pt-[68px]">
          <HeroOrbs />
          <div className="relative z-10">
            <p className="mb-[24px] text-[11px] font-normal uppercase tracking-widest text-smoke animate-slide-up" style={{ animationDelay: "80ms" }}>
              chapter {monthLabel} {yearLabel}
            </p>
            <h1 className="text-[42px] sm:text-[58px] lg:text-[72px] font-light leading-[1.05] text-paper-white">
              <span className="block animate-slide-up" style={{ animationDelay: "200ms" }}>your chapter</span>
              <span className="block animate-slide-up" style={{ animationDelay: "370ms" }}>is unfolding</span>
            </h1>
          </div>
        </section>
        <section className="bg-paper-white px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[48px] sm:py-[64px] md:py-[80px]">
          <div className="mx-auto max-w-[1440px]">
            <p className="max-w-[520px] text-[18px] sm:text-[20px] font-light leading-[1.5] text-ash">
              Check in a few more times this month to unlock your chapter.
            </p>
            <a
              href="/"
              className="mt-[40px] inline-flex min-h-[48px] items-center rounded-[75px] bg-[#1e1b2e] px-[28px] py-[14px] text-[12px] font-normal text-paper-white transition-all duration-150 hover:opacity-75 hover:scale-[0.98]"
            >
              check in now
            </a>
          </div>
        </section>
      </>
    );
  }

  const { chapter } = data;

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
            chapter {monthLabel} {yearLabel}
          </p>
          <h1 className="text-[42px] sm:text-[58px] lg:text-[82px] font-light leading-[1.05] text-paper-white animate-slide-up" style={{ animationDelay: "200ms" }}>
            {chapter.title}
          </h1>
        </div>
      </section>

      {/* ── White editorial content ── */}
      <section className="bg-paper-white px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[48px] sm:py-[64px] md:py-[80px]">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-[860px]">

            <ContentBlock label="Main Challenge" index={0}>
              <p className="text-[24px] sm:text-[28px] md:text-[32px] font-light leading-[1.3] text-carbon">
                {chapter.mainChallenge}
              </p>
            </ContentBlock>

            {chapter.supportingThemes?.length > 0 && (
              <ContentBlock label="Themes" index={1}>
                <div className="flex flex-wrap gap-[8px] mt-[4px]">
                  {chapter.supportingThemes.map((theme) => (
                    <span
                      key={theme}
                      className="inline-flex items-center rounded-[75px] border border-ash/40 px-[16px] py-[8px] text-[13px] font-normal text-ash capitalize"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </ContentBlock>
            )}

            <ContentBlock label="Turning Point" index={2}>
              <p className="text-[18px] sm:text-[20px] font-light leading-[1.5] text-carbon">
                {chapter.turningPoint}
              </p>
            </ContentBlock>

            <ContentBlock label="Growth" index={3}>
              <p className="text-[18px] sm:text-[20px] font-light leading-[1.5] text-carbon">
                {chapter.growthSummary}
              </p>
            </ContentBlock>
          </div>
        </div>
      </section>

      {/* ── Dark narrative section ── */}
      <section className="relative overflow-hidden bg-[#0d0c14] px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[64px] sm:py-[80px] md:py-[100px]">
        <HeroOrbs />
        <div className="relative z-10 mx-auto max-w-[1440px]">
          <p className="mb-[32px] sm:mb-[40px] text-[11px] font-normal uppercase tracking-widest text-smoke">
            your chapter
          </p>
          <p className="max-w-[760px] text-[28px] sm:text-[32px] md:text-[34px] font-light leading-[1.45] text-paper-white">
            <Typewriter text={chapter.chapterNarrative} speed={18} />
          </p>
        </div>
      </section>
    </>
  );
}
