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
import { calcStreak } from "../utils/streak.js";

function fmtDay(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
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
      {/* ── Dark immersive hero ── */}
      <section className="flex min-h-[70vh] flex-col items-start justify-end bg-ink-black px-[40px] pb-[80px] pt-[68px] md:px-[80px]">
        <p className="mb-[28px] text-[11px] font-normal uppercase tracking-widest text-smoke">
          mood history
        </p>
        <h1 className="text-[64px] font-light leading-[1.05] text-paper-white md:text-[94px]">
          your last
          <br />
          two weeks
        </h1>
        {streak >= 2 && (
          <p className="mt-[28px] text-[16px] font-normal text-smoke">
            🔥 {streak}-day check-in streak
          </p>
        )}
        <p className="mt-[28px] max-w-[360px] text-[16px] font-normal leading-[1.39] text-ash">
          Patterns, not grades. Just noticing how things have felt.
        </p>
      </section>

      {/* ── White editorial content ── */}
      <section className="bg-paper-white px-[40px] py-[80px] md:px-[80px]">
        <div className="mx-auto max-w-[1440px]">

          {loading && (
            <p className="text-[16px] font-normal text-ash">loading…</p>
          )}
          {error && (
            <p className="text-[16px] font-normal text-ash">{error}</p>
          )}

          {!loading && !error && checkins.length === 0 && (
            <div className="max-w-[560px]">
              <p className="text-[18px] font-normal leading-[1.36] text-ash">
                No check-ins yet. Your trends will show up here once you've
                checked in a few times.
              </p>
              <a
                href="/"
                className="mt-[40px] inline-block rounded-[75px] bg-ink-black px-[28px] py-[12px] text-[12px] font-normal text-paper-white transition-opacity hover:opacity-70"
              >
                do your first check-in
              </a>
            </div>
          )}

          {!loading && checkins.length > 0 && (
            <>
              {escalate && <EscalationBanner />}

              {/* Chart */}
              <div className="mb-[80px] max-w-[900px]">
                <p className="mb-[40px] text-[12px] font-normal uppercase tracking-widest text-ash">
                  mood over time
                </p>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData} margin={{ left: -20, right: 8 }}>
                    <CartesianGrid stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#9a9a9a", fontSize: 11, fontWeight: 400 }}
                      axisLine={{ stroke: "#e8e8e8" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tick={{ fill: "#9a9a9a", fontSize: 11, fontWeight: 400 }}
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
                      stroke="#181818"
                      strokeWidth={1.5}
                      dot={{ r: 3, fill: "#181818", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#000000" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Weekly insight — dark immersive interlude */}
              <WeeklyInsight
                insight={weekInsight?.insight}
                trend={weekInsight?.trend}
                loading={weekLoading}
              />

              {/* Past check-ins list */}
              <div className="max-w-[900px]">
                <p className="mb-[40px] text-[12px] font-normal uppercase tracking-widest text-ash">
                  past check-ins
                </p>
                <ul>
                  {checkins.map((c) => {
                    const m = moodMeta(c.mood);
                    const s = SENTIMENT_META[c.sentiment] || SENTIMENT_META.okay;
                    return (
                      <li
                        key={c.id}
                        className="border-t border-ash/15 py-[28px] first:border-t-0"
                      >
                        <div className="flex items-start justify-between gap-[24px]">
                          <div className="flex items-center gap-[16px]">
                            <span className="text-[24px] leading-none">{m.emoji}</span>
                            <span className="text-[16px] font-normal text-carbon">
                              {m.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-[16px] text-[11px] font-normal uppercase tracking-widest">
                            <span style={{ color: s.color }}>{s.label}</span>
                            <span className="text-smoke">{fmtDay(c.date)}</span>
                          </div>
                        </div>
                        {c.note && (
                          <p className="mt-[12px] max-w-[600px] pl-[40px] text-[16px] font-normal leading-[1.39] text-ash">
                            {c.note}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
