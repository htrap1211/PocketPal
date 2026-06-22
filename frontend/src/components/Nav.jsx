import { Link, useLocation } from "react-router-dom";

// Floating pill nav — 52px radius, white fill, soft 30px shadow (design token).
export default function Nav() {
  const { pathname } = useLocation();
  const link = (to, text) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={`rounded-[30px] px-[22px] py-3 text-[16px] tracking-body transition ${
          active
            ? "border border-carbon-black text-carbon-black"
            : "text-stone hover:text-carbon-black"
        }`}
      >
        {text}
      </Link>
    );
  };

  return (
    <nav className="sticky top-5 z-20 mx-auto flex w-[min(100%-32px,1100px)] items-center justify-between rounded-[52px] bg-paper-white px-[22px] py-4 shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)]">
      <Link to="/" className="text-[22px] tracking-heading text-hims-violet">
        PocketPal
      </Link>
      <div className="flex items-center gap-1">
        {link("/", "Check in")}
        {link("/dashboard", "Trends")}
      </div>
    </nav>
  );
}
