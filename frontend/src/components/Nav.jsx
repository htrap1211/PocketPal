import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Nav() {
  const { pathname } = useLocation();
  const [largeText, setLargeText] = useState(
    () => localStorage.getItem("pp_large_text") === "1",
  );
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("large-text", largeText);
    localStorage.setItem("pp_large_text", largeText ? "1" : "0");
  }, [largeText]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLink = (to, label) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={`text-[12px] font-normal uppercase tracking-widest transition-opacity ${
          scrolled
            ? active ? "text-carbon opacity-100" : "text-ash hover:text-carbon"
            : active ? "text-paper-white opacity-100" : "text-smoke hover:text-paper-white"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav
      className={`fixed top-0 z-30 w-full transition-all duration-300 ${
        scrolled ? "bg-paper-white border-b border-ash/20" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-[40px]">
        <Link
          to="/"
          className={`text-[12px] font-normal tracking-widest transition-colors ${
            scrolled ? "text-carbon" : "text-paper-white"
          }`}
        >
          POCKETPAL
        </Link>
        <div className="flex items-center gap-[28px]">
          {navLink("/", "check in")}
          {navLink("/dashboard", "trends")}
          {navLink("/insights", "insights")}
          <button
            onClick={() => setLargeText((v) => !v)}
            aria-label="Toggle large text"
            className={`text-[11px] font-normal transition-colors ${
              largeText
                ? scrolled ? "text-carbon" : "text-paper-white"
                : "text-smoke hover:text-paper-white"
            }`}
          >
            A+
          </button>
        </div>
      </div>
    </nav>
  );
}
