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
import { fetchCheckins, fetchWeeklySummary, generateDemo } from "../api.js";
import { moodMeta, SENTIMENT_META } from "../constants.js";
import EscalationBanner from "../components/EscalationBanner.jsx";
import WeeklyInsight from "../components/WeeklyInsight.jsx";
import SupportMap from "../components/SupportMap.jsx";
import CoreMemories from "../components/CoreMemories.jsx";
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
      className={`neo-card mb-[14px] p-[18px] transition-all duration-500 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[10px]"
      }`}
      style={{ transitionDelay: `${Math.min(index * 40, 300)}ms` }}
    >
      <div className="flex items-start justify-between gap-[16px] sm:gap-[24px]">
        <div className="flex items-center gap-[12px] sm:gap-[16px]">
          <span className="neo-inset flex h-[38px] w-[38px] items-center justify-center text-[15px] font-bold text-[#6f96b8]">
            {checkin.mood}
          </span>
          <span className="text-[15px] sm:text-[16px] font-semibold text-[#26313b]">
            {m.label}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-[8px] sm:gap-[16px] text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.04em]">
          <span style={{ color: s.color }}>{s.label}</span>
          <span className="text-[#6f7f8c]">{fmtDay(checkin.date)}</span>
        </div>
      </div>
      {checkin.note && (
        <p className="mt-[12px] max-w-[600px] pl-[50px] text-[14px] sm:text-[16px] font-normal leading-[1.6] text-[#6f7f8c]">
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
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState("");

  function loadCheckins() {
    return fetchCheckins()
      .then((d) => { setCheckins(d.checkins); setEscalate(d.escalate); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCheckins();
    fetchWeeklySummary()
      .then(setWeekInsight)
      .finally(() => setWeekLoading(false));
  }, []);

  async function handleDemo() {
    setDemoLoading(true);
    setDemoSuccess("");
    try {
      const result = await generateDemo();
      setDemoSuccess(`${result.added} days of data generated`);
      // Reload everything
      setLoading(true);
      await loadCheckins();
      fetchWeeklySummary().then(setWeekInsight);
    } catch (err) {
      setDemoSuccess("failed to generate demo data");
    } finally {
      setDemoLoading(false);
    }
  }

  const chartData = [...checkins].slice(0, 14).reverse()
    .map((c) => ({ day: fmtDay(c.date), mood: c.mood }));

  const streak = calcStreak(checkins);

  return (
    <>
      <section className="neo-section relative flex min-h-[64dvh] items-end overflow-hidden pt-[96px]">
        <div className="neo-container grid gap-[28px] lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div className="relative z-10">
          <p
            className="neo-label mb-[18px] uppercase animate-slide-up"
            style={{ animationDelay: "80ms" }}
          >
            mood history
          </p>
          <h1 className="text-[clamp(2.5rem,5vw,4.6rem)] font-bold leading-[1.04] text-[#26313b]">
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
              className="mt-[20px] text-[14px] sm:text-[16px] font-semibold text-[#6f96b8] animate-slide-up"
              style={{ animationDelay: "500ms" }}
            >
              {streak}-day check-in streak
            </p>
          )}
          <p
            className="mt-[20px] max-w-[420px] text-[16px] font-normal leading-[1.6] text-[#6f7f8c] animate-slide-up"
            style={{ animationDelay: streak >= 2 ? "620ms" : "500ms" }}
          >
            Patterns, not grades. Just noticing how things have felt.
          </p>
        </div>
        <div className="neo-card-warm grid grid-cols-3 gap-[12px] p-[18px] sm:p-[24px]">
          <div className="neo-inset p-[16px]">
            <p className="neo-label uppercase">entries</p>
            <p className="mt-[8px] text-[30px] font-bold text-[#26313b]">{checkins.length}</p>
          </div>
          <div className="neo-inset p-[16px]">
            <p className="neo-label uppercase">latest</p>
            <p className="mt-[8px] text-[30px] font-bold text-[#26313b]">{checkins[0]?.mood || "-"}</p>
          </div>
          <div className="neo-inset p-[16px]">
            <p className="neo-label uppercase">streak</p>
            <p className="mt-[8px] text-[30px] font-bold text-[#26313b]">{streak}</p>
          </div>
        </div>
        </div>
      </section>

      <section className="neo-section pt-0">
        <div className="neo-container">

          {loading && (
            <p className="text-[16px] font-normal text-[#6f7f8c]">loading...</p>
          )}
          {error && (
            <p className="text-[16px] font-normal text-[#9a5b5b]">{error}</p>
          )}

          {!loading && !error && checkins.length === 0 && (
            <div className="neo-card max-w-[560px] p-[28px]">
              <p className="text-[17px] sm:text-[18px] font-normal leading-[1.6] text-[#6f7f8c]">
                No check-ins yet. Your trends will show up here once you've
                checked in a few times.
              </p>
              <a
                href="/"
                className="neo-button mt-[28px] inline-flex min-h-[48px] items-center px-[24px] py-[13px] text-[13px] font-semibold"
              >
                do your first check-in
              </a>

              {/* Demo mode */}
              <div className="neo-inset mt-[28px] p-[18px]">
                <p className="neo-label mb-[12px] uppercase">
                  demo mode
                </p>
                <button
                  onClick={handleDemo}
                  disabled={demoLoading}
                  className="neo-button-secondary min-h-[44px] px-[20px] py-[10px] text-[12px] font-semibold disabled:opacity-40"
                >
                  {demoLoading ? "generating..." : "generate 90 days of data"}
                </button>
                {demoSuccess && (
                  <p className="mt-[10px] text-[12px] font-normal text-[#6f7f8c] animate-fade-in">
                    {demoSuccess}
                  </p>
                )}
              </div>
            </div>
          )}

          {!loading && checkins.length > 0 && (
            <>
              {escalate && <EscalationBanner />}

              {/* Chart */}
              <div className="neo-card mb-[42px] max-w-[920px] p-[22px] sm:p-[30px]">
                <p className="neo-label mb-[28px] uppercase">
                  mood over time
                </p>
                <div
                  className="neo-inset p-[12px]"
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
                          border: "1px solid rgba(255,255,255,0.7)",
                          borderRadius: 14,
                          fontSize: 12,
                          fontWeight: 400,
                          background: "#edf3f7",
                          color: "#26313b",
                        }}
                        formatter={(v) => [
                          `${v}  ${moodMeta(v).label}`,
                          "mood",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="#6f96b8"
                        strokeWidth={1.5}
                        dot={{ r: 3, fill: "#6f96b8", strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: "#26313b" }}
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

              {/* Core memories */}
              <CoreMemories />

              {/* Support map */}
              <div className="mb-[42px] max-w-[920px]">
                <div className="mb-[24px] sm:mb-[28px] flex items-baseline justify-between gap-[16px]">
                  <p className="neo-label uppercase">
                    {checkins[0]?.mood <= 2
                      ? "support near you"
                      : checkins[0]?.mood >= 4
                      ? "community near you"
                      : "resources near you"}
                  </p>
                  <p className="hidden text-[11px] text-[#6f7f8c]/70 sm:block">tap a pin</p>
                </div>
                <SupportMap lastMood={checkins[0]?.mood} />
              </div>

              {/* Past check-ins — scroll-reveal */}
              <div className="max-w-[920px]">
                <div className="mb-[32px] sm:mb-[40px] flex items-center justify-between gap-[16px]">
                  <p className="neo-label uppercase">
                    past check-ins
                  </p>
                  {/* Demo mode button — subtle */}
                  <div className="flex flex-col items-end gap-[4px]">
                    <button
                      onClick={handleDemo}
                      disabled={demoLoading}
                      className="text-[11px] font-medium text-[#6f7f8c]/60 transition-colors hover:text-[#26313b] disabled:opacity-30"
                    >
                      {demoLoading ? "generating..." : "demo mode"}
                    </button>
                    {demoSuccess && (
                      <span className="text-[10px] font-normal text-[#6f7f8c]/70 animate-fade-in">
                        {demoSuccess}
                      </span>
                    )}
                  </div>
                </div>
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
