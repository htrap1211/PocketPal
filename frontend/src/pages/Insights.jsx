import { useEffect, useState } from "react";
import { fetchInsights, fetchProfile, fetchMonthlyReflection } from "../api.js";
import MonthlyWrapped from "../components/MonthlyWrapped.jsx";
import WellnessProfile from "../components/WellnessProfile.jsx";
import HeroOrbs from "../components/HeroOrbs.jsx";
import { useInView } from "../utils/useInView.js";

const THEME_EMOJI = {
  school: "📚", friends: "👥", family: "🏠", sports: "⚽",
  sleep: "😴", health: "💊", hobbies: "🎨",
};

function MoodBar({ score, label }) {
  const pct = ((score - 1) / 4) * 100;
  const fill = score >= 4 ? "#1e1b2e" : score >= 3 ? "#636363" : "#9a9a9a";
  return (
    <div
      className="mt-[8px] h-[2px] w-full bg-smoke/30"
      role="img"
      aria-label={`${label}: average mood ${score} out of 5`}
    >
      <div
        className="h-full transition-all duration-700"
        style={{ width: `${pct}%`, background: fill }}
      />
    </div>
  );
}

function ThemeRow({ theme, count, averageMood, index }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`border-t border-ash/15 py-[24px] sm:py-[28px] transition-all duration-500 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[10px]"
      }`}
      style={{ transitionDelay: `${Math.min(index * 60, 360)}ms` }}
    >
      <div className="flex flex-col gap-[14px] sm:flex-row sm:items-center sm:justify-between sm:gap-[24px]">
        <div className="flex items-center gap-[14px] sm:gap-[16px]">
          <span className="text-[22px] sm:text-[24px] leading-none">{THEME_EMOJI[theme] || "✦"}</span>
          <span className="text-[17px] sm:text-[18px] font-light text-carbon capitalize">{theme}</span>
        </div>
        <div className="flex items-start gap-[24px] sm:gap-[28px] pl-[36px] sm:pl-0 text-left sm:text-right">
          <div>
            <p className="text-[11px] font-normal uppercase tracking-widest text-smoke">
              mentions
            </p>
            <p className="text-[17px] sm:text-[18px] font-light text-carbon">{count}</p>
          </div>
          <div className="min-w-[72px] sm:min-w-[80px]">
            <p className="text-[11px] font-normal uppercase tracking-widest text-smoke">
              avg mood
            </p>
            <p className="text-[17px] sm:text-[18px] font-light text-carbon">{averageMood}</p>
            <MoodBar score={averageMood} label={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Insights() {
  const [insights, setInsights]   = useState(null);
  const [profile, setProfile]     = useState(null);
  const [wrapped, setWrapped]     = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([fetchInsights(), fetchProfile(), fetchMonthlyReflection()])
      .then(([i, p, w]) => { setInsights(i); setProfile(p); setWrapped(w); })
      .finally(() => setLoading(false));
  }, []);

  const hasThemes = insights?.themeStats?.length > 0;

  return (
    <>
      {/* ── Dark hero ── */}
      <section className="relative flex min-h-[75svh] flex-col items-start justify-end overflow-hidden bg-[#0d0c14] px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] pb-[56px] sm:pb-[80px] pt-[68px]">
        <HeroOrbs />
        <div className="relative z-10">
          <p
            className="mb-[24px] sm:mb-[28px] text-[11px] font-normal uppercase tracking-widest text-smoke animate-slide-up"
            style={{ animationDelay: "80ms" }}
          >
            personal insights
          </p>
          <h1 className="text-[42px] sm:text-[58px] lg:text-[82px] font-light leading-[1.05] text-paper-white">
            <span
              className="block animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              what your
            </span>
            <span
              className="block animate-slide-up"
              style={{ animationDelay: "370ms" }}
            >
              data says
            </span>
          </h1>
          <p
            className="mt-[24px] sm:mt-[28px] max-w-[360px] text-[15px] sm:text-[16px] font-normal leading-[1.39] text-ash animate-slide-up"
            style={{ animationDelay: "540ms" }}
          >
            Patterns drawn from your check-ins. No diagnosis — just reflection.
          </p>
        </div>
      </section>

      {/* ── White: wellness profile ── */}
      <section className="bg-paper-white px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[48px] sm:py-[64px] md:py-[80px]">
        <div className="mx-auto max-w-[1440px]">
          <p className="mb-[40px] sm:mb-[48px] text-[11px] font-normal uppercase tracking-widest text-ash">
            wellness profile
          </p>
          <WellnessProfile profile={profile} loading={loading} />
        </div>
      </section>

      {/* ── Dark: monthly wrapped ── */}
      <MonthlyWrapped data={wrapped} loading={loading} />

      {/* ── White: theme correlation ── */}
      <section className="bg-paper-white px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[48px] sm:py-[64px] md:py-[80px]">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-[48px] sm:mb-[64px] flex flex-col gap-[24px] md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-[16px] text-[11px] font-normal uppercase tracking-widest text-ash">
                theme correlations
              </p>
              <h2 className="text-[30px] sm:text-[38px] md:text-[45px] font-light leading-[1.15] text-carbon">
                what affects
                <br />
                your mood
              </h2>
            </div>
            <p className="max-w-[320px] text-[15px] sm:text-[16px] font-normal leading-[1.39] text-ash">
              Topics from your notes, ranked by how often they appear and
              the average mood on days you mentioned them.
            </p>
          </div>

          {loading && (
            <p className="text-[16px] font-normal text-ash">loading…</p>
          )}

          {!loading && !hasThemes && (
            <div>
              <p className="text-[17px] sm:text-[18px] font-light text-ash">
                No patterns yet — check in a few more times with notes about what's on your mind.
              </p>
              <a
                href="/"
                className="mt-[40px] inline-flex min-h-[48px] items-center rounded-[75px] bg-[#1e1b2e] px-[28px] py-[14px] text-[12px] font-normal text-paper-white transition-all duration-150 hover:opacity-75 hover:scale-[0.98]"
              >
                check in now
              </a>
            </div>
          )}

          {hasThemes && (
            <div className="max-w-[860px]">
              {insights.themeStats.map((t, i) => (
                <ThemeRow key={t.theme} {...t} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
