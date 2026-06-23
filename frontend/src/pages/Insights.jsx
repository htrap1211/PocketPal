import { useEffect, useState } from "react";
import { fetchInsights, fetchProfile, fetchMonthlyReflection } from "../api.js";
import MonthlyWrapped from "../components/MonthlyWrapped.jsx";
import WellnessProfile from "../components/WellnessProfile.jsx";
import { useInView } from "../utils/useInView.js";

function MoodBar({ score, label }) {
  const pct = ((score - 1) / 4) * 100;
  const fill = score >= 4 ? "#1e1b2e" : score >= 3 ? "#636363" : "#9a9a9a";
  return (
    <div
      className="neo-inset mt-[8px] h-[8px] w-full overflow-hidden"
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
      className={`neo-card mb-[14px] p-[18px] transition-all duration-500 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[10px]"
      }`}
      style={{ transitionDelay: `${Math.min(index * 60, 360)}ms` }}
    >
      <div className="flex flex-col gap-[14px] sm:flex-row sm:items-center sm:justify-between sm:gap-[24px]">
        <div className="flex items-center gap-[14px] sm:gap-[16px]">
          <span className="neo-inset flex h-[40px] w-[40px] items-center justify-center text-[13px] font-bold uppercase text-[#6f96b8]">
            {theme.slice(0, 2)}
          </span>
          <span className="text-[17px] sm:text-[18px] font-semibold text-[#26313b] capitalize">{theme}</span>
        </div>
        <div className="flex items-start gap-[24px] sm:gap-[28px] pl-[36px] sm:pl-0 text-left sm:text-right">
          <div>
            <p className="neo-label uppercase">
              mentions
            </p>
            <p className="text-[17px] sm:text-[18px] font-bold text-[#26313b]">{count}</p>
          </div>
          <div className="min-w-[72px] sm:min-w-[80px]">
            <p className="neo-label uppercase">
              avg mood
            </p>
            <p className="text-[17px] sm:text-[18px] font-bold text-[#26313b]">{averageMood}</p>
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
      <section className="neo-section relative flex min-h-[64dvh] items-end overflow-hidden pt-[96px]">
        <div className="neo-container grid gap-[28px] lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div className="relative z-10">
          <p
            className="neo-label mb-[18px] uppercase animate-slide-up"
            style={{ animationDelay: "80ms" }}
          >
            personal insights
          </p>
          <h1 className="text-[clamp(2.5rem,5vw,4.6rem)] font-bold leading-[1.04] text-[#26313b]">
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
            className="mt-[22px] max-w-[440px] text-[16px] font-normal leading-[1.6] text-[#6f7f8c] animate-slide-up"
            style={{ animationDelay: "540ms" }}
          >
            Patterns drawn from your check-ins. No diagnosis — just reflection.
          </p>
        </div>
        <div className="neo-card-warm p-[22px] sm:p-[28px]">
          <div className="grid grid-cols-2 gap-[12px]">
            <div className="neo-inset p-[18px]">
              <p className="neo-label uppercase">themes</p>
              <p className="mt-[8px] text-[32px] font-bold text-[#26313b]">
                {insights?.themeStats?.length || 0}
              </p>
            </div>
            <div className="neo-inset p-[18px]">
              <p className="neo-label uppercase">month</p>
              <p className="mt-[8px] text-[32px] font-bold text-[#26313b]">
                {wrapped?.checkins || 0}
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className="neo-section pt-0">
        <div className="neo-container">
          <p className="neo-label mb-[30px] uppercase">
            wellness profile
          </p>
          <WellnessProfile profile={profile} loading={loading} />
        </div>
      </section>

      {/* ── Dark: monthly wrapped ── */}
      <MonthlyWrapped data={wrapped} loading={loading} />

      <section className="neo-section">
        <div className="neo-container">
          <div className="mb-[48px] sm:mb-[64px] flex flex-col gap-[24px] md:flex-row md:items-end md:justify-between">
            <div>
              <p className="neo-label mb-[16px] uppercase">
                theme correlations
              </p>
              <h2 className="text-[30px] sm:text-[38px] md:text-[45px] font-bold leading-[1.15] text-[#26313b]">
                what affects
                <br />
                your mood
              </h2>
            </div>
            <p className="max-w-[360px] text-[15px] sm:text-[16px] font-normal leading-[1.6] text-[#6f7f8c]">
              Topics from your notes, ranked by how often they appear and
              the average mood on days you mentioned them.
            </p>
          </div>

          {loading && (
            <p className="text-[16px] font-normal text-[#6f7f8c]">loading...</p>
          )}

          {!loading && !hasThemes && (
            <div>
              <p className="text-[17px] sm:text-[18px] font-normal text-[#6f7f8c]">
                No patterns yet — check in a few more times with notes about what's on your mind.
              </p>
              <a
                href="/"
                className="neo-button mt-[28px] inline-flex min-h-[48px] items-center px-[24px] py-[13px] text-[13px] font-semibold"
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
