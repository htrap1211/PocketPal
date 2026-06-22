import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Nav() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [largeText, setLargeText] = useState(
    () => localStorage.getItem("pp_large_text") === "1",
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const desktopLink = (to, label) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={`text-[12px] font-normal uppercase tracking-widest transition-colors ${
          scrolled
            ? active ? "text-carbon" : "text-ash hover:text-carbon"
            : active ? "text-paper-white" : "text-smoke hover:text-paper-white"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* ── Desktop / Scrolled nav bar ── */}
      <nav
        className={`fixed top-0 z-30 w-full transition-all duration-300 ${
          scrolled ? "bg-paper-white border-b border-ash/20" : "bg-transparent"
        }`}
      >
        <div className="flex h-[68px] items-center justify-between px-[20px] md:px-[40px] lg:px-[80px]">
          <Link
            to="/"
            className={`text-[13px] font-normal tracking-widest transition-colors ${
              scrolled ? "text-carbon" : "text-paper-white"
            }`}
          >
            POCKETPAL
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-[28px] md:flex">
            {desktopLink("/", "check in")}
            {desktopLink("/dashboard", "trends")}
            {desktopLink("/insights", "insights")}
            <span className={`${scrolled ? "text-ash/30" : "text-smoke/40"}`}>|</span>
            <button
              onClick={() => setLargeText((v) => !v)}
              aria-label="Toggle large text"
              aria-pressed={largeText}
              className={`text-[11px] font-normal transition-colors ${
                largeText
                  ? scrolled ? "text-carbon font-semibold" : "text-paper-white font-semibold"
                  : scrolled ? "text-ash hover:text-carbon" : "text-smoke hover:text-paper-white"
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
            className={`flex h-[44px] w-[44px] flex-col items-center justify-center gap-[5px] md:hidden ${
              scrolled ? "text-carbon" : "text-paper-white"
            }`}
          >
            <span
              className={`block h-[1.5px] w-[22px] bg-current transition-all duration-200 ${
                menuOpen ? "translate-y-[6.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-[1.5px] w-[22px] bg-current transition-all duration-200 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-[1.5px] w-[22px] bg-current transition-all duration-200 ${
                menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* ── Mobile full-screen menu ── */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-[#0d0c14] transition-all duration-300 md:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-[68px] items-center justify-between px-[20px]">
          <span className="text-[13px] font-normal tracking-widest text-paper-white">
            POCKETPAL
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="flex h-[44px] w-[44px] items-center justify-center text-paper-white"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center px-[28px] pb-[48px]">
          {[
            { to: "/", label: "check in" },
            { to: "/dashboard", label: "trends" },
            { to: "/insights", label: "insights" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`border-b border-paper-white/10 py-[24px] text-[36px] font-light leading-none transition-colors ${
                pathname === to ? "text-paper-white" : "text-smoke hover:text-paper-white"
              }`}
            >
              {label}
            </Link>
          ))}

          <button
            onClick={() => setLargeText((v) => !v)}
            className={`mt-[40px] self-start text-[13px] font-normal tracking-widest transition-colors ${
              largeText ? "text-paper-white" : "text-smoke"
            }`}
          >
            {largeText ? "A+ ON" : "A+ OFF"} — text size
          </button>
        </div>
      </div>
    </>
  );
}
