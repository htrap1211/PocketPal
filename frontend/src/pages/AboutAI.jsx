import HeroOrbs from "../components/HeroOrbs.jsx";
import { useInView } from "../utils/useInView.js";

function Section({ eyebrow, title, children, index }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`border-t border-ash/15 py-[40px] sm:py-[48px] transition-all duration-500 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[10px]"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="flex flex-col gap-[24px] md:flex-row md:gap-[48px]">
        <div className="md:w-[260px] flex-shrink-0">
          <p className="text-[11px] font-normal uppercase tracking-widest text-ash">{eyebrow}</p>
        </div>
        <div className="flex-1">
          {title && (
            <h2 className="mb-[16px] text-[22px] sm:text-[26px] font-light leading-[1.3] text-carbon">
              {title}
            </h2>
          )}
          <div className="space-y-[16px] text-[16px] font-normal leading-[1.6] text-ash">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AboutAI() {
  return (
    <>
      {/* ── Dark hero ── */}
      <section className="relative flex min-h-[75svh] flex-col items-start justify-end overflow-hidden bg-[#0d0c14] px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] pb-[56px] sm:pb-[80px] pt-[68px]">
        <HeroOrbs />
        <div className="relative z-10 max-w-[1440px]">
          <p
            className="mb-[24px] sm:mb-[28px] text-[11px] font-normal uppercase tracking-widest text-smoke animate-slide-up"
            style={{ animationDelay: "80ms" }}
          >
            transparency
          </p>
          <h1 className="text-[42px] sm:text-[58px] lg:text-[82px] font-light leading-[1.05] text-paper-white">
            <span className="block animate-slide-up" style={{ animationDelay: "200ms" }}>
              about
            </span>
            <span className="block animate-slide-up" style={{ animationDelay: "370ms" }}>
              the ai
            </span>
          </h1>
          <p
            className="mt-[24px] sm:mt-[28px] max-w-[400px] text-[15px] sm:text-[16px] font-normal leading-[1.5] text-ash animate-slide-up"
            style={{ animationDelay: "540ms" }}
          >
            How PocketPal uses AI — and where it stops.
          </p>
        </div>
      </section>

      {/* ── White editorial content ── */}
      <section className="bg-paper-white px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[48px] sm:py-[64px] md:py-[80px]">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-[900px]">

            <Section eyebrow="01" title="How AI is used" index={0}>
              <p>
                PocketPal uses AI to generate short responses after each check-in — a brief acknowledgment and a practical tip. These are based only on what you actually write. The AI references the topics you mention (like school, friends, or sleep), never your exact words.
              </p>
              <p>
                AI also generates weekly and monthly summaries to help you notice patterns over time. These are based on your mood scores and the themes in your notes — not on any personal data beyond what you've shared in the app.
              </p>
            </Section>

            <Section eyebrow="02" title="What AI cannot do" index={1}>
              <p>
                The AI in PocketPal cannot diagnose anything. It is not trained to identify mental health conditions and will never suggest one.
              </p>
              <p>
                It cannot replace therapy, counseling, or a conversation with a trusted adult. It is a journaling companion — not a mental health professional.
              </p>
              <p>
                It cannot see your data. The AI receives a brief, anonymized summary of your mood scores and topic categories — never your raw notes or any identifying information.
              </p>
            </Section>

            <Section eyebrow="03" title="Your data stays here" index={2}>
              <p>
                Your check-ins are stored locally on this device in a simple file. Nothing is uploaded to a cloud account. There are no accounts, no syncing, and no profiles.
              </p>
              <p>
                When you check in, a summary (your mood score and the topics you mentioned — not your words) is sent briefly to the AI to generate a response. That's it. Nothing is stored remotely.
              </p>
            </Section>

            <Section eyebrow="04" title="Safety first" index={3}>
              <p>
                PocketPal always shows crisis resources when your mood dips. These are real, trusted helplines — not AI-generated.
              </p>
              <p>
                The AI is instructed never to escalate, never to alarm, and never to speculate about your emotional state beyond what you explicitly wrote. If something feels serious, we always point you toward real humans who can help.
              </p>
            </Section>

            {/* Crisis resource */}
            <div className="mt-[16px] border-t border-ash/15 py-[40px] sm:py-[48px]">
              <p className="mb-[16px] text-[11px] font-normal uppercase tracking-widest text-ash">
                need to talk to someone?
              </p>
              <p className="mb-[20px] text-[17px] sm:text-[18px] font-light leading-[1.5] text-carbon">
                If you're going through something difficult, real support is available.
              </p>
              <a
                href="https://findahelpline.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center rounded-[75px] border border-carbon px-[28px] py-[14px] text-[12px] font-normal text-carbon transition-all duration-150 hover:bg-carbon hover:text-paper-white"
              >
                findahelpline.com →
              </a>
              <p className="mt-[16px] text-[13px] font-normal text-smoke">
                Free, confidential crisis helplines in 30+ countries.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
