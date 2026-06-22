export default function HeroOrbs() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <div
        className="absolute top-[14%] right-[8%] h-[280px] w-[280px] rounded-full bg-paper-white/[0.02] animate-float-slow"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute top-[52%] right-[30%] h-[140px] w-[140px] rounded-full bg-paper-white/[0.016] animate-float-medium"
        style={{ animationDelay: "2.2s" }}
      />
      <div
        className="absolute top-[27%] right-[50%] h-[70px] w-[70px] rounded-full bg-paper-white/[0.028] animate-float-fast"
        style={{ animationDelay: "1.1s" }}
      />
      <div
        className="absolute bottom-[18%] right-[14%] h-[110px] w-[110px] rounded-full bg-paper-white/[0.014] animate-float-medium"
        style={{ animationDelay: "3.7s" }}
      />
    </div>
  );
}
