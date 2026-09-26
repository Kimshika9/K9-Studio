import { useQuery } from "convex/react";
import { Send } from "lucide-react";
import { api } from "@convex/_generated/api";

export function useTelegramLink(): string {
  const settings = useQuery(api.catalogReads.getPublicSettings) ?? {};
  const link = typeof settings.supportTelegram === "string" ? settings.supportTelegram : undefined;
  return link ?? "https://t.me/k9studio";
}

export function TelegramCTA({ label = "Message us on Telegram", className = "btn-k9 btn-primary" }: { label?: string; className?: string }) {
  const link = useTelegramLink();
  return (
    <a href={link} target="_blank" rel="noreferrer" className={className}>
      <Send size={16} /> {label}
    </a>
  );
}
