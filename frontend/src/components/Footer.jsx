import { useState } from "react";
import { getHelpline, getHelplineByGPS } from "../utils/helpline.js";

export default function Footer() {
  const [helpline, setHelpline] = useState(() => getHelpline());
  const [status, setStatus] = useState("idle"); // idle | loading | located | denied

  async function handleLocate() {
    setStatus("loading");
    const h = await getHelplineByGPS();
    setHelpline(h);
    setStatus(h.country ? "located" : "denied");
  }

  return (
    <footer className="bg-carbon px-[40px] py-[48px]">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-[28px] md:flex-row md:items-start md:justify-between">
          <p className="text-[11px] font-normal uppercase tracking-widest text-smoke">
            PocketPal
          </p>

          <div className="max-w-[520px]">
            <p className="text-[12px] font-normal leading-[1.58] text-smoke">
              PocketPal is a journaling and reflection tool — not medical
              advice, a diagnosis, or a crisis service.
            </p>

            {/* Crisis line block */}
            <div className="mt-[28px] border-l border-pewter pl-[16px]">
              <div className="flex items-center justify-between gap-[16px]">
                <p className="text-[11px] font-normal uppercase tracking-widest text-pewter">
                  {status === "located" && helpline.country
                    ? `crisis support — ${helpline.country}`
                    : helpline.country
                    ? `crisis support — ${helpline.country}`
                    : "crisis support — worldwide"}
                </p>

                {status !== "located" && (
                  <button
                    onClick={handleLocate}
                    disabled={status === "loading"}
                    className="rounded-[75px] border border-pewter px-[12px] py-[4px] text-[11px] font-normal text-pewter transition-colors hover:border-smoke hover:text-smoke disabled:opacity-40"
                  >
                    {status === "loading" ? "locating…" : "📍 use my location"}
                  </button>
                )}
              </div>

              <p className="mt-[8px] text-[16px] font-light text-smoke">
                {helpline.line}
              </p>
              <p className="mt-[4px] text-[12px] font-normal leading-[1.58] text-pewter">
                {helpline.label} — {helpline.extra}
              </p>

              {status === "denied" && (
                <p className="mt-[8px] text-[11px] font-normal text-graphite">
                  location access denied — showing closest match for your region
                </p>
              )}

              <p className="mt-[12px] text-[11px] font-normal leading-[1.5] text-graphite">
                {helpline.country
                  ? "For immediate danger call your local emergency number. Other countries: "
                  : "Find your local helpline: "}
                <span className="text-pewter">befrienders.org</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
