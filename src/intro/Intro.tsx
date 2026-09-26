import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { K9Mark } from "../brand/K9Mark";

/**
 * K9 opening experience (spec §6) — "a digital universe forming".
 *
 * Stages: VOID → PARTICLES → FORM → IDENTITY → RELEASE
 * Canvas 2D particle field (deliberately lighter than WebGL), DPR-capped,
 * paused when the tab is hidden, and replaced by a calm fade under
 * prefers-reduced-motion. Skipped entirely for returning visitors.
 */
const STAGES = [
  { key: "VOID", ms: 250 },
  { key: "PARTICLES", ms: 2100 },
  { key: "FORM", ms: 1500 },
  { key: "IDENTITY", ms: 1400 },
  { key: "RELEASE", ms: 750 },
] as const;

type Stage = (typeof STAGES)[number]["key"];

export function Intro({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<Stage>("VOID");
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Mark the intro as seen so returning navigations skip it
  useEffect(() => {
    try {
      sessionStorage.setItem("k9-intro-seen", "1");
    } catch {
      /* ignore */
    }
  }, []);

  // Sequential stage timing — single source of truth
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setLeaving(true);
      return;
    }
    const timers: number[] = [];
    let acc = 0;
    for (const s of STAGES) {
      acc += s.ms;
      timers.push(window.setTimeout(() => setStage(s.key), acc));
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => {
      setGone(true);
      onDone();
    }, 700);
    return () => clearTimeout(t);
  }, [leaving, onDone]);

  // Canvas particle formation
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (reduced || !canvas) return;
    const g2d = canvas.getContext("2d");
    if (!g2d) return;
    const ctx = g2d;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
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

    const COLORS = ["#c4b5fd", "#a78bfa", "#8b5cf6", "#ede9fe"];
    const N = Math.max(90, Math.min(240, Math.floor((w * h) / 7000)));
    interface P {
      x: number; y: number; vx: number; vy: number; r: number; c: string; tw: number;
    }
    const parts: P[] = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 0.6 + Math.random() * 1.8,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      tw: Math.random() * Math.PI * 2,
    }));

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
      const alpha = Math.min(1, t / 1.2) * 0.9;
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x += w;
        if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        if (p.y > h) p.y -= h;
        p.tw += 0.02;
        const twinkle = 0.55 + Math.sin(p.tw) * 0.45;
        // converge toward center as the mark forms
        const pull = Math.max(0, Math.min(1, (t - 2.1) / 1.5));
        p.x += (w / 2 - p.x) * 0.004 * pull;
        p.y += (h / 2 - p.y) * 0.004 * pull;
        ctx.globalAlpha = alpha * twinkle * (1 - pull * 0.4);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 + pull * 0.2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  if (gone) return null;

  return (
    <AnimatePresence>
      {leaving ? (
        <motion.div
          key="out"
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "var(--bg)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }}
          aria-hidden="true"
        >
          <K9Mark size={64} />
        </motion.div>
      ) : (
        <motion.section
          key="in"
          className="fixed inset-0 z-[100] overflow-hidden"
          style={{ background: "var(--bg)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          aria-label="K9 Studio intro"
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 55%, var(--hero-veil-a) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.7, filter: "blur(14px)" }}
              animate={
                stage === "VOID" || stage === "PARTICLES"
                  ? { opacity: 0 }
                  : { opacity: 1, scale: 1, filter: "blur(0px)" }
              }
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <K9Mark size={92} glowing />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={
                stage === "IDENTITY" || stage === "RELEASE"
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 26 }
              }
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-display text-3xl font-bold tracking-[0.32em] sm:text-4xl">
                K9 STUDIO
              </h1>
              <motion.p
                className="muted mt-3 text-sm tracking-[0.14em]"
                initial={{ opacity: 0 }}
                animate={stage === "RELEASE" ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.55 }}
              >
                WE BUILD YOUR DIGITAL WORLD
              </motion.p>
            </motion.div>

            <button
              onClick={() => setLeaving(true)}
              className="btn-k9 btn-quiet absolute bottom-8 right-8 text-xs"
            >
              Skip intro
            </button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
