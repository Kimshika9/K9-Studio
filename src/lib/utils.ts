import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_MMK_PER_USD = 4200;

export function formatMmk(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

export function formatUsd(n: number): string {
  return dualFormatUsd(n);
}

export function dualFormatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

/** Primary currency per spec §15: MMK primary for Myanmar users, USDT/USD primary internationally. */
export type CurrencyPref = "mmk-first" | "usd-first";

export function resolveCurrencyPref(locale: string): CurrencyPref {
  const primary = locale.slice(0, 2).toLowerCase();
  return ["mm", "my"].includes(primary) ? "mmk-first" : "usd-first";
}
