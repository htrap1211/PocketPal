import { getHelpline } from "../utils/helpline.js";

const h = getHelpline();

export default function Footer() {
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

            {/* Location-aware crisis line */}
            <div className="mt-[28px] border-l border-pewter pl-[16px]">
              <p className="text-[11px] font-normal uppercase tracking-widest text-pewter">
                {h.country ? `crisis support — ${h.country}` : "crisis support — worldwide"}
              </p>
              <p className="mt-[8px] text-[16px] font-light text-smoke">
                {h.line}
              </p>
              <p className="mt-[4px] text-[12px] font-normal leading-[1.58] text-pewter">
                {h.label} — {h.extra}
              </p>
              {h.country && (
                <p className="mt-[12px] text-[11px] font-normal leading-[1.5] text-graphite">
                  If you're in immediate danger, call your local emergency number.
                  For other countries visit{" "}
                  <span className="text-pewter">befrienders.org</span>
                </p>
              )}
              {!h.country && (
                <p className="mt-[12px] text-[11px] font-normal text-graphite">
                  Find your local helpline at{" "}
                  <span className="text-pewter">befrienders.org</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
