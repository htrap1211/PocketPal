import { useEffect, useState } from "react";
import HeroOrbs from "../components/HeroOrbs.jsx";
import { fetchMovieRecap } from "../api.js";

function Skeleton() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0d0c14] px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[80px]">
      <HeroOrbs />
      <div className="relative z-10 w-full max-w-[860px] text-center">
        <div className="mx-auto mb-[24px] h-[11px] w-[180px] rounded-sm bg-paper-white/10 animate-shimmer" />
        <div className="mx-auto mb-[16px] h-[80px] w-[70%] rounded-sm bg-paper-white/10 animate-shimmer" />
        <div className="mx-auto h-[40px] w-[50%] rounded-sm bg-paper-white/10 animate-shimmer" />
        <div className="mt-[64px] space-y-[28px]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mx-auto max-w-[600px]">
              <div className="mx-auto mb-[8px] h-[11px] w-[80px] rounded-sm bg-paper-white/10 animate-shimmer" />
              <div className="mx-auto h-[20px] w-[200px] rounded-sm bg-paper-white/10 animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CreditLine({ label, value, delay }) {
  return (
    <div
      className="text-center animate-credits-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="mb-[6px] text-[10px] sm:text-[11px] font-normal uppercase tracking-widest text-smoke">
        {label}
      </p>
      <p className="text-[16px] sm:text-[18px] font-light text-paper-white">
        {value}
      </p>
    </div>
  );
}

export default function MovieRecap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovieRecap()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  const now = new Date();
  const monthLabel = now.toLocaleString("default", { month: "long" });
  const yearLabel = now.getFullYear();

  if (!data?.recap) {
    return (
      <>
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0d0c14] px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[80px]">
          <HeroOrbs />
          <div className="relative z-10 text-center">
            <p className="mb-[24px] text-[11px] font-normal uppercase tracking-widest text-smoke animate-slide-up" style={{ animationDelay: "80ms" }}>
              pocketpal presents
            </p>
            <h1
              className="font-light leading-[1.05] text-paper-white animate-slide-up"
              style={{
                fontSize: "clamp(40px, 8vw, 90px)",
                animationDelay: "200ms",
              }}
            >
              coming soon
            </h1>
            <p className="mt-[28px] max-w-[440px] mx-auto text-[16px] font-normal text-ash animate-slide-up" style={{ animationDelay: "370ms" }}>
              Check in a few more times this month to unlock your personal movie recap.
            </p>
            <a
              href="/"
              className="mt-[40px] inline-flex min-h-[48px] items-center rounded-[75px] border border-paper-white/20 px-[28px] py-[14px] text-[12px] font-normal text-paper-white transition-all duration-150 hover:border-paper-white/60 hover:scale-[0.98] animate-slide-up"
              style={{ animationDelay: "500ms" }}
            >
              check in now
            </a>
          </div>
        </section>
      </>
    );
  }

  const { recap } = data;

  return (
    <section className="film-grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0d0c14] px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[80px] pt-[100px]">
      <HeroOrbs />

      <div className="relative z-10 w-full max-w-[860px] text-center">
        {/* Eyebrow */}
        <p
          className="mb-[16px] text-[10px] sm:text-[11px] font-normal uppercase tracking-[0.3em] text-smoke animate-slide-up"
          style={{ animationDelay: "80ms" }}
        >
          pocketpal presents
        </p>

        {/* Giant title */}
        <h1
          className="font-light leading-[1.0] text-paper-white animate-slide-up"
          style={{
            fontSize: "clamp(40px, 9vw, 120px)",
            animationDelay: "200ms",
          }}
        >
          {recap.title}
        </h1>

        {/* Divider */}
        <div
          className="mx-auto mt-[32px] mb-[48px] sm:mt-[40px] sm:mb-[64px] h-[1px] w-[80px] animate-fade-in"
          style={{ background: "rgba(255,255,255,0.15)", animationDelay: "400ms" }}
        />

        {/* Credits grid */}
        <div className="grid gap-[32px] sm:gap-[40px] md:grid-cols-2 lg:grid-cols-3 text-left sm:text-center max-w-[720px] mx-auto">
          <CreditLine label="Starring" value={recap.starring} delay={480} />
          {recap.supportingCast?.length > 0 && (
            <CreditLine
              label="Supporting Cast"
              value={recap.supportingCast.join(" · ")}
              delay={560}
            />
          )}
          <CreditLine label="Main Conflict" value={recap.mainConflict} delay={640} />
          <CreditLine label="Growth Arc" value={recap.growthArc} delay={720} />
          <CreditLine label="Favorite Scene" value={recap.favoriteScene} delay={800} />
          <CreditLine label="Ending" value={recap.ending} delay={880} />
        </div>

        {/* Month badge */}
        <div
          className="mt-[64px] sm:mt-[80px] animate-fade-in"
          style={{ animationDelay: "1000ms" }}
        >
          <span className="inline-block rounded-[75px] border border-paper-white/20 px-[20px] py-[8px] text-[11px] font-normal uppercase tracking-widest text-smoke">
            {monthLabel} {yearLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
