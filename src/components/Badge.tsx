import { cn } from "../lib/utils";

export function Badge({
  children,
  accent = false,
  className,
}: {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return <span className={cn(accent ? "badge-accent" : "badge-k9", className)}>{children}</span>;
}
