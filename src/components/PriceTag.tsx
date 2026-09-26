import { formatMmk, formatUsd } from "../lib/utils";

interface Props {
  usd: number;
  mmk: number;
  size?: "sm" | "md" | "lg";
  align?: "start" | "center";
}

/**
 * Dual-currency display (spec §15). Locale decides the primary — Myanmar
 * visitors see MMK first; everyone else sees USDT first. The secondary stays
 * visible but muted. Conversion rate comes from settings, not code.
 */
export function PriceTag({ usd, mmk, size = "md", align = "start" }: Props) {
  const locale = typeof navigator !== "undefined" ? navigator.language : "en-US";
  const mmkFirst = locale.toLowerCase().startsWith("mm") || locale.toLowerCase().startsWith("my");
  const primary = mmkFirst
    ? { value: formatMmk(mmk), symbol: "MMK", note: `${formatUsd(usd)} USDT` }
    : { value: formatUsd(usd), symbol: "USDT", note: `${formatMmk(mmk)} MMK` };

  const main = size === "lg" ? "text-4xl" : size === "sm" ? "text-lg" : "text-2xl";
  const sub = size === "lg" ? "text-base" : "text-xs";

  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div className="font-display font-bold tracking-tight" style={{ fontSize: undefined }}>
        <span className={`${main} leading-none`}>{primary.value}</span>
        <span className={`ml-1.5 align-middle ${sub} font-semibold`} style={{ color: "var(--accent)" }}>
          {primary.symbol}
        </span>
      </div>
      <p className={`muted mt-1 ${sub}`}>≈ {primary.note}</p>
    </div>
  );
}
