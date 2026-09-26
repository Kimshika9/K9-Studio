import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Globe, Bot, Sparkles, Wand2, Camera, Film, Brain, Code2, Zap, Layout, ArrowUpRight, type LucideIcon } from "lucide-react";
import type { Doc } from "@convex/_generated/dataModel";
import { PriceTag } from "./PriceTag";
import { Badge } from "./Badge";

const ICONS: Record<string, LucideIcon> = {
  globe: Globe,
  bot: Bot,
  sparkles: Sparkles,
  wand: Wand2,
  camera: Camera,
  film: Film,
  brain: Brain,
  code: Code2,
  zap: Zap,
  layout: Layout,
};

export function CatalogCard({ item, index = 0 }: { item: Doc<"catalog">; index?: number }) {
  const Icon = ICONS[item.icon ?? "sparkles"] ?? Sparkles;
  const href = item.kind === "service" ? `/services/${item.slug}` : `/products/${item.slug}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={href}
        className={`card-k9 group block h-full p-6 ${item.featured ? "glow-ring" : ""}`}
      >
        <div className="flex items-start justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl border"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)",
              background: "color-mix(in srgb, var(--accent) 12%, transparent)",
              color: "var(--accent)",
            }}
          >
            <Icon size={20} />
          </div>
          {item.featured && <Badge accent>Popular</Badge>}
        </div>

        <p className="eyebrow mt-5">{item.category}</p>
        <h3 className="font-display mt-1.5 text-lg font-bold">{item.name}</h3>
        <p className="soft mt-2 text-sm leading-relaxed">{item.tagline}</p>

        <div className="mt-5 flex items-end justify-between">
          <PriceTag usd={item.basePriceUsd} mmk={item.basePriceMmk} size="sm" />
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-2)" }}
            aria-hidden="true"
          >
            <ArrowUpRight size={15} />
          </span>
        </div>
        {item.pricingModel === "tiered" && (
          <p className="muted mt-2 text-[0.7rem] uppercase tracking-wider">
            Basic · Standard · Premium
          </p>
        )}
      </Link>
    </motion.article>
  );
}
