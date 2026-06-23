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
    <div className="neo-app-bg fixed inset-0 z-50 flex items-center justify-center px-[20px]">
      <div className="neo-card-warm animate-fade-up w-full max-w-[680px] p-[28px] sm:p-[42px]">
        <p className="neo-label mb-[28px] uppercase sm:mb-[36px]">
          {s.index} / 03
        </p>

        <h2 className="whitespace-pre-line text-[40px] sm:text-[54px] md:text-[68px] font-bold leading-[1.05] text-[#26313b]">
          {s.heading}
        </h2>

        <p className="mt-[24px] max-w-[460px] text-[16px] sm:text-[18px] font-normal leading-[1.6] text-[#6f7f8c]">
          {s.body}
        </p>

        <div className="mt-[48px] sm:mt-[64px] flex items-center justify-between gap-[16px]">
          <div className="flex gap-[8px]">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-[8px] rounded-[14px] transition-all duration-300 ${
                  i === slide ? "w-[34px] bg-[#6f96b8]" : "w-[14px] bg-[#d5e1e8]"
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
            className="neo-button min-h-[48px] px-[24px] py-[13px] text-[12px] font-semibold sm:px-[28px]"
          >
            {last ? "get started" : "next"}
          </button>
        </div>
      </div>
    </div>
  );
}
