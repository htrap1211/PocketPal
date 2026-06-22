import { useEffect, useState } from "react";
import { getHelpline, getHelplineByGPS } from "../utils/helpline.js";

function CrisisLine({ line }) {
  const isPhone = !/[a-z]/i.test(line);
  if (isPhone) {
    return (
      <a
        href={`tel:${line.replace(/[\s\-\(\)]/g, "")}`}
        className="mt-[8px] block text-[18px] sm:text-[20px] font-light text-smoke hover:text-paper-white transition-colors"
        aria-label={`Call crisis line: ${line}`}
      >
        {line}
      </a>
    );
  }
  return (
    <a
      href={`https://${line}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-[8px] block text-[18px] sm:text-[20px] font-light text-smoke hover:text-paper-white transition-colors"
    >
      {line}
    </a>
  );
}

export default function Footer() {
  const [helpline, setHelpline] = useState(() => getHelpline());
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    getHelplineByGPS().then((h) => {
      setHelpline(h);
      setStatus(h.country ? "located" : "denied");
    });
  }, []);

  return (
    <footer className="bg-carbon px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[40px] sm:py-[48px]">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-[32px] md:flex-row md:items-start md:justify-between">
          <p className="text-[11px] font-normal uppercase tracking-widest text-smoke">
            PocketPal
          </p>

          <div className="max-w-[520px]">
            <p className="text-[12px] font-normal leading-[1.58] text-smoke">
              PocketPal is a journaling and reflection tool — not medical
              advice, a diagnosis, or a crisis service.
            </p>

            <div className="mt-[28px] border-l border-pewter pl-[16px]">
              <div className="flex items-center gap-[12px]">
                <p className="text-[11px] font-normal uppercase tracking-widest text-pewter">
                  {status === "loading"
                    ? "detecting location…"
                    : helpline.country
                    ? `crisis support — ${helpline.country}`
                    : "crisis support — worldwide"}
                </p>
                {status === "loading" && (
                  <span className="text-[11px] text-graphite animate-pulse">●</span>
                )}
              </div>

              <CrisisLine line={helpline.line} />

              <p className="mt-[4px] text-[12px] font-normal leading-[1.58] text-pewter">
                {helpline.label} — {helpline.extra}
              </p>

              {status === "denied" && (
                <p className="mt-[8px] text-[11px] font-normal text-graphite">
                  location access denied — showing closest match for your browser region
                </p>
              )}

              <p className="mt-[12px] text-[11px] font-normal leading-[1.5] text-graphite">
                {helpline.country
                  ? "For immediate danger call your local emergency number. Other countries: "
                  : "Find your local helpline: "}
                <a
                  href="https://befrienders.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pewter hover:text-smoke transition-colors"
                >
                  befrienders.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
