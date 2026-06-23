import { useEffect, useRef, useState } from "react";
import { getHelpline, getHelplineByGPS, HELPLINES_LIST } from "../utils/helpline.js";

const STORAGE_KEY = "pp_helpline_override";

function CrisisLine({ line }) {
  const isPhone = !/[a-z]/i.test(line);
  if (isPhone) {
    return (
      <a
        href={`tel:${line.replace(/[\s\-\(\)]/g, "")}`}
        className="mt-[8px] block text-[18px] sm:text-[20px] font-bold text-[#26313b] hover:text-[#6f96b8] transition-colors"
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
      className="mt-[8px] block text-[18px] sm:text-[20px] font-bold text-[#26313b] hover:text-[#6f96b8] transition-colors"
    >
      {line}
    </a>
  );
}

function CountryPicker({ onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="neo-card absolute bottom-full left-0 z-50 mb-[8px] w-[220px] overflow-y-auto py-[4px]"
      style={{ maxHeight: "220px" }}
      role="listbox"
      aria-label="Select your country"
    >
      {HELPLINES_LIST.map(({ code, country }) => (
        <button
          key={code}
          role="option"
          onClick={() => onSelect(code)}
          className="flex w-full items-center gap-[10px] px-[14px] py-[9px] text-left text-[12px] font-medium text-[#6f7f8c] transition-colors hover:text-[#26313b]"
        >
          {country}
        </button>
      ))}
    </div>
  );
}

export default function Footer() {
  const [helpline, setHelpline] = useState(() => getHelpline());
  const [status, setStatus] = useState("loading");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    // Check for manual override first.
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const found = HELPLINES_LIST.find((h) => h.code === saved);
      if (found) { setHelpline(found); setStatus("manual"); return; }
    }
    getHelplineByGPS().then((h) => {
      setHelpline(h);
      setStatus(h.country ? "located" : "denied");
    });
  }, []);

  function handleManualSelect(code) {
    const found = HELPLINES_LIST.find((h) => h.code === code);
    if (!found) return;
    localStorage.setItem(STORAGE_KEY, code);
    setHelpline(found);
    setStatus("manual");
    setShowPicker(false);
  }

  function clearOverride() {
    localStorage.removeItem(STORAGE_KEY);
    setStatus("loading");
    setHelpline(getHelpline());
    getHelplineByGPS().then((h) => {
      setHelpline(h);
      setStatus(h.country ? "located" : "denied");
    });
  }

  return (
    <footer className="neo-section pt-[32px]">
      <div className="neo-container neo-card p-[24px] sm:p-[32px]">
        <div className="flex flex-col gap-[32px] md:flex-row md:items-start md:justify-between">
          <p className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#26313b]">
            PocketPal
          </p>

          <div className="max-w-[520px]">
            <p className="text-[12px] font-normal leading-[1.6] text-[#6f7f8c]">
              PocketPal is a journaling and reflection tool — not medical
              advice, a diagnosis, or a crisis service.
            </p>

            <div className="neo-inset mt-[28px] p-[18px]">
              <div className="flex flex-wrap items-center gap-[10px]">
                <p className="neo-label uppercase">
                  {status === "loading"
                    ? "detecting location…"
                    : helpline.country
                    ? `crisis support — ${helpline.country}`
                    : "crisis support — worldwide"}
                </p>
                {status === "loading" && (
                  <span className="text-[11px] text-[#6f96b8] animate-pulse">loading</span>
                )}
              </div>

              <CrisisLine line={helpline.line} />

              <p className="mt-[4px] text-[12px] font-normal leading-[1.6] text-[#6f7f8c]">
                {helpline.label} — {helpline.extra}
              </p>

              <p className="mt-[12px] text-[11px] font-normal leading-[1.5] text-[#6f7f8c]">
                {helpline.country
                  ? "For immediate danger call your local emergency number. Other countries: "
                  : "Find your local helpline: "}
                <a
                  href="https://befrienders.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#6f96b8] hover:text-[#26313b] transition-colors"
                >
                  befrienders.org
                </a>
              </p>

              {/* Manual country override */}
              <div className="relative mt-[10px]">
                {status !== "manual" ? (
                  <button
                    onClick={() => setShowPicker((v) => !v)}
                    className="text-[11px] font-semibold text-[#6f7f8c] underline-offset-2 hover:text-[#26313b] transition-colors"
                    style={{ textDecoration: "underline", textDecorationStyle: "dotted" }}
                  >
                    wrong country?
                  </button>
                ) : (
                  <button
                    onClick={clearOverride}
                    className="text-[11px] font-semibold text-[#6f7f8c] underline-offset-2 hover:text-[#26313b] transition-colors"
                    style={{ textDecoration: "underline", textDecorationStyle: "dotted" }}
                  >
                    reset location
                  </button>
                )}
                {showPicker && (
                  <CountryPicker
                    onSelect={handleManualSelect}
                    onClose={() => setShowPicker(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
