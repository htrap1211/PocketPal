import { useEffect, useRef } from "react";

const COLORS = ["#c4854a", "#d4a070", "#ffffff", "#e8e0d0", "#9a9a9a"];

export default function Confetti() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 120,
      y: canvas.height * 0.7,
      vx: (Math.random() - 0.5) * 16,
      vy: -(Math.random() * 14 + 7),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w: Math.random() * 7 + 3,
      h: Math.random() * 3 + 2,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.22,
      life: 1,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.38;
        p.vx *= 0.985;
        p.rot += p.rotV;
        p.life -= 0.017;
        if (p.life <= 0) return;
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (alive) rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[200]"
      aria-hidden="true"
    />
  );
}
