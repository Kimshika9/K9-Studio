import { useEffect, useRef } from "react";

/**
 * Ambient hero field: slow drifting star-particles with a gentle violet
 * parallax drift and a pointer-tilt influence on desktop. Deliberately light
 * (Canvas 2D, DPR-capped, count scales with viewport, pauses when hidden).
 */
export function CosmicCanvas({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const g2d = canvas.getContext("2d");
    if (!g2d) return;
    const ctx = g2d;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    interface P {
      x: number; y: number; z: number; r: number; tw: number; vx: number; vy: number;
    }
    const N = Math.floor(
      Math.max(60, Math.min(170, (w * h) / 11000)) * density,
    );
    const parts: P[] = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: 0.35 + Math.random() * 0.65,
      r: 0.5 + Math.random() * 1.5,
      tw: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
    }));

    let pointer = { x: 0.5, y: 0.5 };
    const onPointer = (e: PointerEvent) => {
      pointer = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    if (!reduced && window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", onPointer, { passive: true });
    }

    let raf = 0;
    let running = true;
    const onVis = () => {
      const visible = document.hidden === false;
      if (visible && !running) {
        running = true;
        raf = requestAnimationFrame(tick);
      } else if (!visible && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const start = performance.now();
    function tick(now: number) {
      if (!running) return;
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      const dx = (pointer.x - 0.5) * 18;
      const dy = (pointer.y - 0.5) * 12;
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        if (p.y < -4) p.y = h + 4;
        if (p.y > h + 4) p.y = -4;
        p.tw += 0.015;
        const twinkle = 0.5 + Math.sin(p.tw) * 0.5;
        const px = p.x + dx * p.z;
        const py = p.y + dy * p.z;
        ctx.globalAlpha = (0.25 + twinkle * 0.5) * p.z;
        ctx.fillStyle = p.z > 0.75 ? "#c4b5fd" : "#8f8fb0";
        ctx.beginPath();
        ctx.arc(px, py, p.r * p.z, 0, Math.PI * 2);
        ctx.fill();
      }
      // one slow comet accent
      const cx = (t * 40) % (w + 200) - 100;
      const cy = h * 0.3 + Math.sin(t * 0.4) * 40;
      const grad = ctx.createLinearGradient(cx - 90, cy, cx, cy);
      grad.addColorStop(0, "rgba(139,92,246,0)");
      grad.addColorStop(1, "rgba(196,181,253,0.6)");
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx - 90, cy);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }
    if (!reduced) {
      raf = requestAnimationFrame(tick);
    } else {
      // draw one static frame
      tick(performance.now() + 4000);
      running = false;
      cancelAnimationFrame(raf);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [density]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
