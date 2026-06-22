import { useEffect, useState } from "react";
import { fetchInsights, fetchProfile, fetchMonthlyReflection } from "../api.js";
import MonthlyWrapped from "../components/MonthlyWrapped.jsx";
import WellnessProfile from "../components/WellnessProfile.jsx";

const THEME_EMOJI = {
  school: "📚", friends: "👥", family: "🏠", sports: "⚽",
  sleep: "😴", health: "💊", hobbies: "🎨",
};

function MoodBar({ score }) {
  const pct = ((score - 1) / 4) * 100;
  const color = score >= 4 ? "#181818" : score >= 3 ? "#636363" : "#9a9a9a";
  return (
    <div className="mt-[8px] h-[2px] w-full bg-smoke/30">
      <div
        className="h-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function ThemeRow({ theme, count, averageMood, index }) {
  return (
    <div
      className="animate-fade-up border-t border-ash/15 py-[28px]"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-center justify-between gap-[24px]">
        <div className="flex items-center gap-[16px]">
          <span className="text-[24px] leading-none">{THEME_EMOJI[theme] || "✦"}</span>
          <span className="text-[18px] font-light text-carbon">{theme}</span>
        </div>
        <div className="flex items-center gap-[28px] text-right">
          <div>
            <p className="text-[11px] font-normal uppercase tracking-widest text-smoke">
              mentions
            </p>
            <p className="text-[18px] font-light text-carbon">{count}</p>
          </div>
          <div className="min-w-[80px]">
            <p className="text-[11px] font-normal uppercase tracking-widest text-smoke">
              avg mood
            </p>
            <p className="text-[18px] font-light text-carbon">{averageMood}</p>
            <MoodBar score={averageMood} />
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
      <section className="flex min-h-[70vh] flex-col items-start justify-end bg-ink-black px-[40px] pb-[80px] pt-[68px] md:px-[80px]">
        <p className="mb-[28px] text-[11px] font-normal uppercase tracking-widest text-smoke">
          personal insights
        </p>
        <h1 className="text-[64px] font-light leading-[1.05] text-paper-white md:text-[94px]">
          what your
          <br />
          data says
        </h1>
        <p className="mt-[28px] max-w-[360px] text-[16px] font-normal leading-[1.39] text-ash">
          Patterns drawn from your check-ins. No diagnosis — just reflection.
        </p>
      </section>

      {/* ── White: wellness profile ── */}
      <section className="bg-paper-white px-[40px] py-[80px] md:px-[80px]">
        <div className="mx-auto max-w-[1440px]">
          <p className="mb-[48px] text-[11px] font-normal uppercase tracking-widest text-ash">
            wellness profile
          </p>
          <WellnessProfile profile={profile} loading={loading} />
        </div>
      </section>

      {/* ── Dark: monthly wrapped ── */}
      <MonthlyWrapped data={wrapped} loading={loading} />

      {/* ── White: theme correlation ── */}
      <section className="bg-paper-white px-[40px] py-[80px] md:px-[80px]">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-[64px] flex flex-col gap-[16px] md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-[16px] text-[11px] font-normal uppercase tracking-widest text-ash">
                theme correlations
              </p>
              <h2 className="text-[45px] font-light leading-[1.15] text-carbon">
                what affects
                <br />
                your mood
              </h2>
            </div>
            <p className="max-w-[320px] text-[16px] font-normal leading-[1.39] text-ash">
              Topics from your notes, ranked by how often they appear and
              the average mood on days you mentioned them.
            </p>
          </div>

          {loading && (
            <p className="text-[16px] font-normal text-ash">loading…</p>
          )}

          {!loading && !hasThemes && (
            <div>
              <p className="text-[18px] font-light text-ash">
                No patterns yet — check in a few more times with notes about what's on your mind.
              </p>
              <a
                href="/"
                className="mt-[40px] inline-block rounded-[75px] bg-ink-black px-[28px] py-[12px] text-[12px] font-normal text-paper-white transition-opacity hover:opacity-70"
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
