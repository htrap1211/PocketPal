import { useEffect, useState } from "react";
import { fetchCoreMemories } from "../api.js";
import { useInView } from "../utils/useInView.js";

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MemoryCard({ memory, index }) {
  const [ref, inView] = useInView(0.08);

  return (
    <div
      ref={ref}
      className={`neo-card cursor-default p-[22px] transition-all duration-500 ease-out sm:p-[26px] ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[10px]"
      }`}
      style={{
        transitionDelay: `${Math.min(index * 70, 420)}ms`,
      }}
    >
      <div className="neo-inset mb-[16px] flex h-[44px] w-[44px] items-center justify-center text-[13px] font-bold uppercase text-[#6f96b8]">
        {memory.title?.slice(0, 2) || "me"}
      </div>
      <p className="mb-[4px] text-[16px] sm:text-[18px] font-bold text-[#26313b]">
        {memory.title}
      </p>
      <p className="neo-label mb-[12px] uppercase">
        {fmtDate(memory.date)}
      </p>
      <p className="text-[13px] font-normal leading-[1.6] text-[#6f7f8c]">
        {memory.description}
      </p>
    </div>
  );
}

export default function CoreMemories({ memories: memoriesProp }) {
  const [memories, setMemories] = useState(memoriesProp || null);
  const [loading, setLoading] = useState(!memoriesProp);

  useEffect(() => {
    if (memoriesProp) return; // use prop if provided
    fetchCoreMemories()
      .then((d) => setMemories(d.memories || []))
      .finally(() => setLoading(false));
  }, [memoriesProp]);

  // Don't render if loading or no memories
  if (loading) return null;
  if (!memories || memories.length === 0) return null;

  return (
    <div className="mb-[64px] max-w-[920px] sm:mb-[80px]">
      <p className="neo-label mb-[28px] uppercase">
        core memories
      </p>
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {memories.map((memory, i) => (
          <MemoryCard key={memory.id} memory={memory} index={i} />
        ))}
      </div>
    </div>
  );
}
