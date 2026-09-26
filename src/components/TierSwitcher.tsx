import { motion } from "motion/react";
import { Check, RotateCcw } from "lucide-react";
import { cn } from "../lib/utils";

export interface Tier {
  tier: string;
  name: string;
  priceDelta: number;
  priceDeltaMmk: number;
  deliveryDays: number;
  description: string;
  features: string[];
  defaults: boolean;
}

interface Props {
  tiers: Tier[];
  active: number;
  onChange: (index: number) => void;
}

/**
 * Package tier switcher (spec §12). The active tier is unmissable (violet
 * ring + glow), and a "back to base" reset is always available.
 */
export function TierSwitcher({ tiers, active, onChange }: Props) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Package tier">
        {tiers.map((t, i) => {
          const selected = i === active;
          return (
            <button
              key={t.tier}
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(i)}
              className={cn(
                "relative rounded-xl border px-3 py-3 text-center transition-all duration-300",
                selected ? "card-selected" : "card-k9 hover:-translate-y-0.5",
              )}
            >
              <span className="eyebrow block text-[0.62rem]">{t.name}</span>
              <span className="mt-1 block text-xs muted">
                {t.priceDelta === 0 ? "Base" : `+${(t.priceDelta * 4200).toLocaleString()} MMK`}
              </span>
              {selected && (
                <motion.span
                  layoutId="tier-glow-dot"
                  className="absolute -top-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
                  style={{ background: "var(--accent)", boxShadow: "0 0 12px var(--glow)" }}
                />
              )}
            </button>
          );
        })}
      </div>
      {active !== 0 && (
        <button
          onClick={() => onChange(0)}
          className="btn-k9 btn-quiet mt-2 !px-2 !py-1 text-xs"
        >
          <RotateCcw size={13} /> Back to base package
        </button>
      )}
    </div>
  );
}

export function TierFeatures({ tier, compact = false }: { tier: Tier; compact?: boolean }) {
  return (
    <ul className={compact ? "space-y-1.5" : "space-y-2.5"}>
      {tier.features.map((f) => (
        <li key={f} className="flex items-start gap-2.5 text-sm soft">
          <Check size={15} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}
