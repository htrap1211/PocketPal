import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const PRIMARY_LINKS = [
  { to: "/", label: "check in" },
  { to: "/dashboard", label: "trends" },
  { to: "/insights", label: "insights" },
];

const STORY_LINKS = [
  { to: "/chapters", label: "chapters" },
  { to: "/wrapped", label: "wrapped" },
  { to: "/future-me", label: "future me" },
  { to: "/movie-recap", label: "movie" },
];

export default function Nav() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [largeText, setLargeText] = useState(
    () => localStorage.getItem("pp_large_text") === "1",
  );

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("large-text", largeText);
    localStorage.setItem("pp_large_text", largeText ? "1" : "0");
  }, [largeText]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const deskLink = (to, label) => {
    const active = pathname === to;
    return (
      <Link
        key={to}
        to={to}
        className={`rounded-[14px] px-[12px] py-[7px] text-[11px] font-medium uppercase tracking-[0.06em] transition-all duration-200 ${
          active
            ? "bg-[#d9ebfa] text-[#26313b] shadow-[inset_-4px_-4px_10px_rgba(255,255,255,0.85),inset_4px_4px_10px_rgba(145,162,176,0.2)]"
            : "text-[#6f7f8c] hover:text-[#26313b]"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <nav
        className={`fixed top-0 z-30 w-full transition-all duration-300 ${
          scrolled
            ? "bg-[#edf3f7]/90 backdrop-blur-xl border-b border-white/40 shadow-[0_1px_12px_rgba(145,162,176,0.12)]"
            : "bg-transparent"
        }`}
      >
        <div className="flex h-[68px] items-center justify-between px-[20px] md:px-[40px] lg:px-[80px]">
          <Link
            to="/"
            className="rounded-[14px] px-[14px] py-[9px] text-[13px] font-bold tracking-[0.06em] text-[#26313b] shadow-[-5px_-5px_14px_rgba(255,255,255,0.78),5px_5px_14px_rgba(145,162,176,0.16)]"
          >
            POCKETPAL
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-[6px] md:flex">
            {PRIMARY_LINKS.map(({ to, label }) => deskLink(to, label))}

            <span className="mx-[8px] h-[16px] w-[1px] bg-[#6f7f8c]/20" />

            {STORY_LINKS.map(({ to, label }) => deskLink(to, label))}

            <span className="mx-[8px] h-[16px] w-[1px] bg-[#6f7f8c]/20" />

            <button
              onClick={() => setLargeText((v) => !v)}
              aria-label="Toggle large text"
              aria-pressed={largeText}
              className={`rounded-[14px] px-[10px] py-[7px] text-[11px] font-medium tracking-[0.04em] transition-all ${
                largeText
                  ? "bg-[#f5e0e8] text-[#26313b] shadow-[inset_-4px_-4px_10px_rgba(255,255,255,0.85),inset_4px_4px_10px_rgba(145,162,176,0.18)]"
                  : "text-[#6f7f8c] hover:text-[#26313b]"
              }`}
            >
              A+
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-[44px] w-[44px] flex-col items-center justify-center gap-[5px] rounded-[14px] text-[#26313b] shadow-[-5px_-5px_14px_rgba(255,255,255,0.78),5px_5px_14px_rgba(145,162,176,0.16)] md:hidden"
          >
            <span className={`block h-[1.5px] w-[22px] bg-current transition-all duration-200 ${menuOpen ? "translate-y-[6.5px] rotate-45" : ""}`} />
            <span className={`block h-[1.5px] w-[22px] bg-current transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-[1.5px] w-[22px] bg-current transition-all duration-200 ${menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[#edf3f7] transition-all duration-300 md:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-[68px] flex-shrink-0 items-center justify-between px-[20px]">
          <span className="text-[13px] font-bold tracking-[0.06em] text-[#26313b]">POCKETPAL</span>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="flex h-[44px] w-[44px] items-center justify-center rounded-[14px] text-[#26313b] shadow-[-5px_-5px_14px_rgba(255,255,255,0.78),5px_5px_14px_rgba(145,162,176,0.16)]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>

        <div className="flex flex-1 flex-col px-[20px] pb-[48px] pt-[8px]">
          <p className="mb-[12px] text-[10px] font-medium uppercase tracking-[0.1em] text-[#6f7f8c]">daily</p>
          {PRIMARY_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`mb-[8px] rounded-[14px] px-[20px] py-[16px] text-[22px] font-bold leading-none transition-all ${
                pathname === to
                  ? "bg-[#d9ebfa] text-[#26313b] shadow-[inset_-5px_-5px_12px_rgba(255,255,255,0.86),inset_5px_5px_12px_rgba(145,162,176,0.22)]"
                  : "text-[#6f7f8c] shadow-[-5px_-5px_14px_rgba(255,255,255,0.78),5px_5px_14px_rgba(145,162,176,0.16)]"
              }`}
            >
              {label}
            </Link>
          ))}

          <p className="mb-[12px] mt-[24px] text-[10px] font-medium uppercase tracking-[0.1em] text-[#6f7f8c]">your story</p>
          {STORY_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`mb-[8px] rounded-[14px] px-[20px] py-[16px] text-[22px] font-bold leading-none transition-all ${
                pathname === to
                  ? "bg-[#d9ebfa] text-[#26313b] shadow-[inset_-5px_-5px_12px_rgba(255,255,255,0.86),inset_5px_5px_12px_rgba(145,162,176,0.22)]"
                  : "text-[#6f7f8c] shadow-[-5px_-5px_14px_rgba(255,255,255,0.78),5px_5px_14px_rgba(145,162,176,0.16)]"
              }`}
            >
              {label}
            </Link>
          ))}

          <div className="mt-[24px] flex items-center gap-[12px]">
            <button
              onClick={() => setLargeText((v) => !v)}
              className={`rounded-[14px] px-[16px] py-[12px] text-[13px] font-medium tracking-[0.04em] transition-colors ${
                largeText ? "bg-[#f5e0e8] text-[#26313b]" : "text-[#6f7f8c]"
              }`}
            >
              {largeText ? "A+ ON" : "A+ OFF"}
            </button>
            <Link
              to="/about-ai"
              className="text-[12px] font-medium text-[#6f7f8c] hover:text-[#26313b] transition-colors"
            >
              about the ai →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
