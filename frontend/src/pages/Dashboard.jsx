import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fetchCheckins, fetchWeeklySummary } from "../api.js";
import { moodMeta, SENTIMENT_META } from "../constants.js";
import EscalationBanner from "../components/EscalationBanner.jsx";
import WeeklyInsight from "../components/WeeklyInsight.jsx";
import SupportMap from "../components/SupportMap.jsx";
import HeroOrbs from "../components/HeroOrbs.jsx";
import { calcStreak } from "../utils/streak.js";
import { useInView } from "../utils/useInView.js";

function fmtDay(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function CheckInRow({ checkin, index }) {
  const [ref, inView] = useInView(0.08);
  const m = moodMeta(checkin.mood);
  const s = SENTIMENT_META[checkin.sentiment] || SENTIMENT_META.okay;

  return (
    <li
      ref={ref}
      className={`border-t border-ash/15 py-[24px] sm:py-[28px] first:border-t-0 transition-all duration-500 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[10px]"
      }`}
      style={{ transitionDelay: `${Math.min(index * 40, 300)}ms` }}
    >
      <div className="flex items-start justify-between gap-[16px] sm:gap-[24px]">
        <div className="flex items-center gap-[12px] sm:gap-[16px]">
          <span className="text-[20px] sm:text-[24px] leading-none">{m.emoji}</span>
          <span className="text-[15px] sm:text-[16px] font-normal text-carbon">
            {m.label}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-[8px] sm:gap-[16px] text-[10px] sm:text-[11px] font-normal uppercase tracking-widest">
          <span style={{ color: s.color }}>{s.label}</span>
          <span className="text-smoke">{fmtDay(checkin.date)}</span>
        </div>
      </div>
      {checkin.note && (
        <p className="mt-[10px] sm:mt-[12px] max-w-[600px] pl-[32px] sm:pl-[40px] text-[14px] sm:text-[16px] font-normal leading-[1.5] text-ash">
          {checkin.note}
        </p>
      )}
    </li>
  );
}

export default function Dashboard() {
  const [checkins, setCheckins] = useState([]);
  const [escalate, setEscalate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weekInsight, setWeekInsight] = useState(null);
  const [weekLoading, setWeekLoading] = useState(true);

  useEffect(() => {
    fetchCheckins()
      .then((d) => { setCheckins(d.checkins); setEscalate(d.escalate); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    fetchWeeklySummary()
      .then(setWeekInsight)
      .finally(() => setWeekLoading(false));
  }, []);

  const chartData = [...checkins].slice(0, 14).reverse()
    .map((c) => ({ day: fmtDay(c.date), mood: c.mood }));

  const streak = calcStreak(checkins);

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
            mood history
          </p>
          <h1 className="text-[42px] sm:text-[58px] lg:text-[82px] font-light leading-[1.05] text-paper-white">
            <span
              className="block animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              your last
            </span>
            <span
              className="block animate-slide-up"
              style={{ animationDelay: "370ms" }}
            >
              two weeks
            </span>
          </h1>
          {streak >= 2 && (
            <p
              className="mt-[20px] sm:mt-[28px] text-[14px] sm:text-[16px] font-normal text-smoke animate-slide-up"
              style={{ animationDelay: "500ms" }}
            >
              🔥 {streak}-day check-in streak
            </p>
          )}
          <p
            className="mt-[20px] sm:mt-[28px] max-w-[360px] text-[15px] sm:text-[16px] font-normal leading-[1.39] text-ash animate-slide-up"
            style={{ animationDelay: streak >= 2 ? "620ms" : "500ms" }}
          >
            Patterns, not grades. Just noticing how things have felt.
          </p>
        </div>
      </section>

      {/* ── White editorial content ── */}
      <section className="bg-paper-white px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[48px] sm:py-[64px] md:py-[80px]">
        <div className="mx-auto max-w-[1440px]">

          {loading && (
            <p className="text-[16px] font-normal text-ash">loading…</p>
          )}
          {error && (
            <p className="text-[16px] font-normal text-ash">{error}</p>
          )}

          {!loading && !error && checkins.length === 0 && (
            <div className="max-w-[560px]">
              <p className="text-[17px] sm:text-[18px] font-normal leading-[1.5] text-ash">
                No check-ins yet. Your trends will show up here once you've
                checked in a few times.
              </p>
              <a
                href="/"
                className="mt-[40px] inline-flex min-h-[48px] items-center rounded-[75px] bg-[#1e1b2e] px-[28px] py-[14px] text-[12px] font-normal text-paper-white transition-all duration-150 hover:opacity-75 hover:scale-[0.98]"
              >
                do your first check-in
              </a>
            </div>
          )}

          {!loading && checkins.length > 0 && (
            <>
              {escalate && <EscalationBanner />}

              {/* Chart */}
              <div className="mb-[64px] sm:mb-[80px] max-w-[900px]">
                <p className="mb-[32px] sm:mb-[40px] text-[12px] font-normal uppercase tracking-widest text-ash">
                  mood over time
                </p>
                <div
                  role="img"
                  aria-label={`Line chart: your mood over the last ${chartData.length} check-ins`}
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData} margin={{ left: -20, right: 8, top: 4, bottom: 4 }}>
                      <CartesianGrid stroke="#f0f0f0" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "#9a9a9a", fontSize: 10, fontWeight: 400 }}
                        axisLine={{ stroke: "#e8e8e8" }}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        domain={[1, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                        tick={{ fill: "#9a9a9a", fontSize: 10, fontWeight: 400 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          border: "1px solid #e8e8e8",
                          borderRadius: 0,
                          fontSize: 12,
                          fontWeight: 400,
                          background: "#ffffff",
                          color: "#181818",
                        }}
                        formatter={(v) => [
                          `${moodMeta(v).emoji}  ${moodMeta(v).label}`,
                          "mood",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="#1e1b2e"
                        strokeWidth={1.5}
                        dot={{ r: 3, fill: "#1e1b2e", strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: "#0d0c14" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly insight */}
              <WeeklyInsight
                insight={weekInsight?.insight}
                trend={weekInsight?.trend}
                loading={weekLoading}
              />

              {/* Support map */}
              <div className="mb-[64px] sm:mb-[80px] max-w-[900px]">
                <div className="mb-[24px] sm:mb-[28px] flex items-baseline justify-between gap-[16px]">
                  <p className="text-[12px] font-normal uppercase tracking-widest text-ash">
                    {checkins[0]?.mood <= 2
                      ? "support near you"
                      : checkins[0]?.mood >= 4
                      ? "community near you"
                      : "resources near you"}
                  </p>
                  <p className="text-[11px] text-smoke/50 hidden sm:block">tap a pin</p>
                </div>
                <SupportMap lastMood={checkins[0]?.mood} />
              </div>

              {/* Past check-ins — scroll-reveal */}
              <div className="max-w-[900px]">
                <p className="mb-[32px] sm:mb-[40px] text-[12px] font-normal uppercase tracking-widest text-ash">
                  past check-ins
                </p>
                <ul>
                  {checkins.map((c, i) => (
                    <CheckInRow key={c.id} checkin={c} index={i} />
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
