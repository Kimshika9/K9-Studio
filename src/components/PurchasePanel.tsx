import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Zap, Star, MessageCircle, Loader2, Lock } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { PriceTag } from "./PriceTag";
import { formatMmk, formatUsd } from "../lib/utils";

interface Props {
  item: Doc<"catalog">;
  tierKey?: string;
  priceUsd: number;
  priceMmk: number;
  onOrdered?: (orderNumber: string) => void;
}

/**
 * Checkout (spec §16): instant purchase with K9 Credit is the primary path.
 * Without enough credit, two clear fallbacks appear: top up credit, or
 * request the order manually (admin completes payment by hand).
 */
export function PurchasePanel({ item, tierKey, priceUsd, priceMmk, onOrdered }: Props) {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState("");
  const [telegram, setTelegram] = useState("");
  const [refs, setRefs] = useState("");
  const [busy, setBusy] = useState<"credit" | "manual" | null>(null);

  const auth = useQuery(api.users.currentUserId);
  const signedIn = auth !== null && auth !== undefined;
  const balanceQ = useQuery(api.credit.getBalance, signedIn ? {} : "skip");
  const balance = typeof balanceQ === "number" ? balanceQ : null;
  const canInstant = balance !== null && balance + 1e-9 >= priceUsd;

  const createOrder = useMutation(api.orders.createOrder);

  async function go(payWithCredit: boolean) {
    if (!signedIn) {
      toast.error("Please sign in first", {
        description: "Your order, credit and downloads live in your K9 account.",
        action: { label: "Sign in", onClick: () => navigate("/auth?returnTo=" + encodeURIComponent(location.pathname)) },
      });
      return;
    }
    if (item.kind === "service" && requirements.trim().length < 10) {
      toast.error("Tell us a little about what you need (10+ characters)");
      return;
    }
    setBusy(payWithCredit ? "credit" : "manual");
    try {
      const res = await createOrder({
        kind: item.kind,
        slug: item.slug,
        tierKey: tierKey ?? undefined,
        requirements,
        contactTelegram: telegram || undefined,
        referenceLinks: refs.split("\n").map((s) => s.trim()).filter(Boolean),
        payWithCredit,
      });
      if (payWithCredit) {
        toast.success(`Order ${res.number} confirmed ⭐`, {
          description: "Paid instantly with K9 Credit. We'll reach out on Telegram.",
        });
      } else {
        toast.success(`Order ${res.number} requested`, {
          description: "We'll contact you on Telegram to arrange payment.",
        });
      }
      onOrdered?.(res.number);
      navigate("/account?tab=orders");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      if (msg.includes("INSUFFICIENT_CREDIT")) {
        toast.error("Not enough K9 Credit", {
          description: "Top up your balance, or request the order and pay manually.",
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="glass-2 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{item.pricingModel === "tiered" ? "Package price" : "Price"}</p>
          <div className="mt-2">
            <PriceTag usd={priceUsd} mmk={priceMmk} size="lg" />
          </div>
        </div>
        {typeof balance === "number" && (
          <div className="text-right">
            <p className="eyebrow">Your balance</p>
            <p className="font-display mt-2 text-xl font-bold" style={{ color: "var(--accent)" }}>
              {balance.toFixed(2)} <Star size={15} className="inline -mt-1" /> 
            </p>
          </div>
        )}
      </div>

      {item.kind === "service" && (
        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="soft text-sm font-medium">What do you need? <span className="muted">(plain language is perfect)</span></span>
            <textarea
              className="input-k9 mt-1.5 min-h-24"
              placeholder={
                item.category === "Bot Creation"
                  ? "e.g. A Telegram bot for my gaming community — welcome messages, polls and a points leaderboard."
                  : "e.g. I want a website for my clothing business with a lookbook and an order form."
              }
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="soft text-sm font-medium">Your Telegram <span className="muted">(for delivery & updates)</span></span>
            <input
              className="input-k9 mt-1.5"
              placeholder="@username"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="soft text-sm font-medium">Reference links <span className="muted">(optional, one per line)</span></span>
            <textarea
              className="input-k9 mt-1.5 min-h-16"
              placeholder="https://…"
              value={refs}
              onChange={(e) => setRefs(e.target.value)}
            />
          </label>
        </div>
      )}

      {item.kind === "product" && (
        <div className="mt-5">
          <label className="block">
            <span className="soft text-sm font-medium">Your Telegram <span className="muted">(for the receipt)</span></span>
            <input
              className="input-k9 mt-1.5"
              placeholder="@username"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
            />
          </label>
        </div>
      )}

      <div className="mt-6 space-y-2.5">
        {canInstant && (
          <button
            onClick={() => go(true)}
            disabled={busy !== null}
            className="btn-k9 btn-primary w-full"
          >
            {busy === "credit" ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            Pay {formatUsd(priceUsd)} ⭐ with K9 Credit
          </button>
        )}
        {!canInstant && (
          <button
            onClick={() => go(false)}
            disabled={busy !== null}
            className="btn-k9 btn-primary w-full"
          >
            {busy === "manual" ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
            Request Order
          </button>
        )}
        {!canInstant && (
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={() => navigate("/account?tab=credit")} className="btn-k9 btn-ghost">
              <Star size={15} /> Buy K9 Credit
            </button>
            <button onClick={() => go(false)} disabled={busy !== null} className="btn-k9 btn-ghost">
              {busy === "manual" ? <Loader2 size={15} className="animate-spin" /> : <MessageCircle size={15} />}
              Request Order
            </button>
          </div>
        )}
      </div>

      <p className="muted mt-4 flex items-center gap-1.5 text-xs">
        <Lock size={12} /> Payments are recorded server-side. K9 Credit is refundable while an order is pending.
      </p>
      {item.kind === "product" && (
        <p className="muted mt-1.5 text-xs">
          Digital products are delivered as instant downloads once payment is confirmed.
        </p>
      )}
      {typeof priceMmk === "number" && priceMmk > 0 && (
        <p className="muted mt-1.5 text-xs">Local payment: KBZPay · WavePay · AYA · PayWell — {formatMmk(priceMmk)} MMK</p>
      )}
    </div>
  );
}
