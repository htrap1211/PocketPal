// Crisis footer — ALWAYS visible, separate from any AI logic.
// PocketPal is a wellness/journaling tool, not a crisis service.
export default function Footer() {
  return (
    <footer className="mt-[100px] border-t border-vellum-gray px-8 py-12">
      <div className="mx-auto max-w-[1100px] text-[14px] leading-[1.67] tracking-body text-stone">
        <p className="mb-2 text-carbon-black">
          PocketPal is a journaling and reflection tool — not medical advice, a
          diagnosis, or a crisis service.
        </p>
        <p>
          If you're in crisis or thinking about harming yourself, you deserve
          real support right now. In the US, call or text{" "}
          <span className="text-carbon-black">988</span> (Suicide &amp; Crisis
          Lifeline), available 24/7. If you're in immediate danger, call 911 or
          your local emergency number.
        </p>
      </div>
    </footer>
  );
}
