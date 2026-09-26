import { motion } from "motion/react";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PageHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <header className="section-pad pb-0">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          {sub && <p className="soft mt-4 max-w-2xl text-lg leading-relaxed">{sub}</p>}
        </Reveal>
      </div>
    </header>
  );
}
