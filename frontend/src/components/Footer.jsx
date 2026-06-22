export default function Footer() {
  return (
    <footer className="bg-carbon px-[40px] py-[48px]">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-[28px] md:flex-row md:items-start md:justify-between">
          <p className="text-[11px] font-normal uppercase tracking-widest text-smoke">
            PocketPal
          </p>
          <div className="max-w-[480px]">
            <p className="text-[12px] font-normal leading-[1.58] text-smoke">
              PocketPal is a journaling and reflection tool — not medical
              advice, a diagnosis, or a crisis service.
            </p>
            <p className="mt-[16px] text-[12px] font-normal leading-[1.58] text-pewter">
              If you're in crisis or thinking about harming yourself, real
              support is available right now. Call or text{" "}
              <span className="text-smoke">988</span> (Suicide &amp; Crisis
              Lifeline, US), 24/7. For immediate danger, call 911.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
