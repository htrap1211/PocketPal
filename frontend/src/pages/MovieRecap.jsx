import { useEffect, useState } from "react";
import { fetchMovieRecap } from "../api.js";

function Skeleton() {
  return (
    <section className="neo-section flex min-h-[100dvh] items-center justify-center pt-[96px]">
      <div className="neo-card-warm w-full max-w-[860px] p-[28px] text-center sm:p-[42px]">
        <div className="mx-auto mb-[24px] h-[11px] w-[180px] rounded-[14px] bg-[#6f7f8c]/12 animate-shimmer" />
        <div className="mx-auto mb-[16px] h-[80px] w-[70%] rounded-[14px] bg-[#6f7f8c]/12 animate-shimmer" />
        <div className="mx-auto h-[40px] w-[50%] rounded-[14px] bg-[#6f7f8c]/12 animate-shimmer" />
        <div className="mt-[64px] space-y-[28px]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mx-auto max-w-[600px]">
              <div className="mx-auto mb-[8px] h-[11px] w-[80px] rounded-[14px] bg-[#6f7f8c]/12 animate-shimmer" />
              <div className="mx-auto h-[20px] w-[200px] rounded-[14px] bg-[#6f7f8c]/12 animate-shimmer" />
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
      className="neo-card animate-credits-in p-[18px] text-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="neo-label mb-[6px] uppercase">
        {label}
      </p>
      <p className="text-[16px] sm:text-[18px] font-bold text-[#26313b]">
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
        <section className="neo-section flex min-h-[100dvh] items-center justify-center pt-[96px]">
          <div className="neo-card-warm max-w-[720px] p-[28px] text-center sm:p-[42px]">
            <p className="neo-label mb-[18px] uppercase animate-slide-up" style={{ animationDelay: "80ms" }}>
              pocketpal presents
            </p>
            <h1
              className="font-bold leading-[1.05] text-[#26313b] animate-slide-up"
              style={{
                fontSize: "clamp(40px, 8vw, 90px)",
                animationDelay: "200ms",
              }}
            >
              coming soon
            </h1>
            <p className="mt-[24px] mx-auto max-w-[440px] text-[16px] font-normal leading-[1.6] text-[#6f7f8c] animate-slide-up" style={{ animationDelay: "370ms" }}>
              Check in a few more times this month to unlock your personal movie recap.
            </p>
            <a
              href="/"
              className="neo-button mt-[28px] inline-flex min-h-[48px] items-center px-[24px] py-[13px] text-[13px] font-semibold animate-slide-up"
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
    <section className="neo-section relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden pt-[100px]">
      <div className="neo-container">
      <div className="neo-card-warm mx-auto w-full max-w-[920px] p-[28px] text-center sm:p-[42px]">
        {/* Eyebrow */}
        <p
          className="neo-label mb-[16px] uppercase animate-slide-up"
          style={{ animationDelay: "80ms" }}
        >
          pocketpal presents
        </p>

        {/* Giant title */}
        <h1
          className="font-bold leading-[1.0] text-[#26313b] animate-slide-up"
          style={{
            fontSize: "clamp(40px, 9vw, 120px)",
            animationDelay: "200ms",
          }}
        >
          {recap.title}
        </h1>

        {/* Divider */}
        <div
          className="neo-inset mx-auto mt-[32px] mb-[48px] h-[8px] w-[96px] animate-fade-in sm:mt-[40px] sm:mb-[64px]"
          style={{ animationDelay: "400ms" }}
        />

        {/* Credits grid */}
        <div className="mx-auto grid max-w-[760px] gap-[14px] text-left sm:text-center md:grid-cols-2 lg:grid-cols-3">
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
          <span className="neo-inset inline-block px-[20px] py-[10px] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6f7f8c]">
            {monthLabel} {yearLabel}
          </span>
        </div>
      </div>
      </div>
    </section>
  );
}
