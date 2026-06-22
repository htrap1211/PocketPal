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
import { fetchCheckins } from "../api.js";
import { moodMeta, SENTIMENT_META } from "../constants.js";
import EscalationBanner from "../components/EscalationBanner.jsx";

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

  useEffect(() => {
    fetchCheckins()
      .then((data) => {
        setCheckins(data.checkins);
        setEscalate(data.escalate);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Last 14 days, oldest -> newest, for the trend line.
  const chartData = [...checkins]
    .slice(0, 14)
    .reverse()
    .map((c) => ({ day: fmtDay(c.date), mood: c.mood }));

  return (
    <section className="mx-auto w-[min(100%-32px,720px)] pt-[64px]">
      <h1 className="text-center text-[44px] leading-[1.15] tracking-heading text-carbon-black">
        Your last two weeks
      </h1>
      <p className="mb-[40px] mt-4 text-center text-[18px] tracking-body text-stone">
        Patterns, not grades. Just noticing how things have felt.
      </p>

      {escalate && <EscalationBanner />}

      {loading && (
        <p className="text-center text-[16px] tracking-body text-stone">
          Loading…
        </p>
      )}
      {error && (
        <p className="text-center text-[16px] tracking-body text-stone">
          {error}
        </p>
      )}

      {!loading && !error && checkins.length === 0 && (
        <div className="rounded-[45px] bg-paper-white p-[32px] text-center shadow-[0px_8px_127px_0px_rgba(0,0,0,0.11)]">
          <p className="text-[18px] tracking-body text-graphite">
            No check-ins yet. Your trends will show up here once you've checked
            in a few times.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-[30px] border border-carbon-black px-[22px] py-3 text-[16px] tracking-body text-carbon-black transition hover:bg-carbon-black hover:text-paper-white"
          >
            Do your first check-in
          </a>
        </div>
      )}

      {!loading && checkins.length > 0 && (
        <>
          <div className="rounded-[45px] bg-paper-white p-[32px] shadow-[0px_8px_127px_0px_rgba(0,0,0,0.11)]">
            <p className="mb-6 text-[16px] tracking-body text-graphite">
              Mood over time
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ left: -20, right: 8 }}>
                <CartesianGrid stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#8f8f8f", fontSize: 13 }}
                  axisLine={{ stroke: "#e0e0e0" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fill: "#8f8f8f", fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid #e0e0e0",
                    fontSize: 14,
                  }}
                  formatter={(v) => [`${moodMeta(v).emoji} ${moodMeta(v).label}`, "Mood"]}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#5d48db"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#5d48db" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <h2 className="mb-5 mt-[64px] text-[32px] tracking-heading text-carbon-black">
            Past check-ins
          </h2>
          <ul className="flex flex-col gap-4">
            {checkins.map((c) => {
              const m = moodMeta(c.mood);
              const s = SENTIMENT_META[c.sentiment] || SENTIMENT_META.okay;
              return (
                <li
                  key={c.id}
                  className="rounded-[30px] bg-paper-white p-6 shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-3 text-[18px] tracking-body text-carbon-black">
                      <span className="text-[24px]">{m.emoji}</span>
                      {m.label}
                    </span>
                    <span className="flex items-center gap-3 text-[14px] tracking-body text-stone">
                      <span
                        className="rounded-[30px] border px-3 py-1"
                        style={{ borderColor: "#e0e0e0", color: s.color }}
                      >
                        {s.label}
                      </span>
                      {fmtDay(c.date)}
                    </span>
                  </div>
                  {c.note && (
                    <p className="mt-3 text-[16px] leading-[1.43] tracking-body text-graphite">
                      {c.note}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
