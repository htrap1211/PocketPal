import { useState } from "react";

const SLIDES = [
  {
    index: "01",
    heading: "hey, I'm\nPocketPal",
    body: "A 30-second daily check-in that actually listens. Pick how you're feeling, write as much or as little as you want, and get a thoughtful reply — not a generic bot response.",
  },
  {
    index: "02",
    heading: "here's how\nit works",
    body: "Pick your mood on a 1–5 scale → share what's on your mind (optional) → get a personalized reply with a grounding tip → watch your mood patterns over time.",
  },
  {
    index: "03",
    heading: "your data\nstays private",
    body: "Everything you write lives only on this device. Nothing is uploaded, shared, or seen by anyone else. PocketPal is a journaling tool, not a diagnosis or crisis service. If you're in crisis, call or text 988.",
  },
];

export default function Onboarding({ onDone }) {
  const [slide, setSlide] = useState(0);
  const last = slide === SLIDES.length - 1;
  const s = SLIDES[slide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black">
      <div className="animate-fade-up w-full max-w-[640px] px-[40px]">
        <p className="mb-[48px] text-[11px] font-normal uppercase tracking-widest text-smoke">
          {s.index} / 03
        </p>

        <h2 className="whitespace-pre-line text-[54px] font-light leading-[1.1] text-paper-white md:text-[78px]">
          {s.heading}
        </h2>

        <p className="mt-[40px] max-w-[400px] text-[18px] font-normal leading-[1.36] text-ash">
          {s.body}
        </p>

        <div className="mt-[64px] flex items-center justify-between">
          <div className="flex gap-[8px]">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-[2px] transition-all duration-300 ${
                  i === slide ? "w-[32px] bg-paper-white" : "w-[12px] bg-smoke"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (last) {
                localStorage.setItem("pp_onboarded", "1");
                onDone();
              } else {
                setSlide((s) => s + 1);
              }
            }}
            className="rounded-[75px] bg-paper-white px-[28px] py-[12px] text-[12px] font-normal text-ink-black transition-opacity hover:opacity-80"
          >
            {last ? "get started" : "next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
