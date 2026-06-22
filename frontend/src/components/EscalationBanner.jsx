// Soft, non-alarming nudge. Shows only when the backend flags 3+ stressed/low
// check-ins in the last 7 days. Never diagnostic, never urgent-sounding.
export default function EscalationBanner() {
  return (
    <div className="mx-auto mb-8 w-full max-w-[640px] rounded-[30px] border border-linen bg-paper-white p-[32px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)]">
      <p className="mb-2 text-[20px] tracking-body text-hims-violet">
        Hey — checking in on you 💛
      </p>
      <p className="text-[16px] leading-[1.43] tracking-body text-graphite">
        Looks like the last week has felt heavier than usual. That's completely
        okay, and you don't have to carry it alone. Talking to someone you trust
        — a parent, a school counselor, or a friend — can really help. No
        pressure, just a gentle reminder that support is there when you want it.
      </p>
    </div>
  );
}
