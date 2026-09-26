import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";
import type { Id, Doc } from "./_generated/dataModel";

export const ORDER_STATUSES = [
  "pending",
  "payment_required",
  "paid",
  "in_progress",
  "revision",
  "completed",
  "cancelled",
] as const;

/** Admin emails are configured via the K9_ADMIN_EMAILS env var. */
export function adminEmails(): string[] {
  return (process.env.K9_ADMIN_EMAILS ?? "admin@k9studio.app")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const getMyOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("orders")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .order("desc")
      .take(200);
  },
});

export const getOrderDetail = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== userId) return null;
    const events = await ctx.db
      .query("orderEvents")
      .withIndex("by_order_time", (q) => q.eq("orderId", args.orderId))
      .order("desc")
      .take(50);
    return { order, events };
  },
});

export const getPublicSettingsQ = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("settings").collect();
    const out: Record<string, unknown> = {};
    for (const d of docs) out[d.key] = d.value;
    return out;
  },
});

/**
 * Create an order from catalog data (prices are snapshotted so later price
 * changes never alter existing orders) and send the admin Telegram ping.
 * `payWithCredit` is validated server-side against the real ledger balance.
 */
export const createOrder = mutation({
  args: {
    kind: v.union(v.literal("service"), v.literal("product")),
    slug: v.string(),
    tierKey: v.optional(v.string()),
    requirements: v.string(),
    contactTelegram: v.optional(v.string()),
    referenceLinks: v.array(v.string()),
    payWithCredit: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in required");

    const item = await ctx.db
      .query("catalog")
      .withIndex("by_kind_slug", (q) => q.eq("kind", args.kind).eq("slug", args.slug))
      .first();
    if (!item || item.status !== "active") throw new Error("Item not available");

    // Resolve tier + price snapshot
    let tierKey: string | undefined;
    let tierName: string | undefined;
    let priceUsd = item.basePriceUsd;
    let priceMmk = item.basePriceMmk;
    let deliveryDays: number | undefined;
    if (item.pricingModel === "tiered") {
      const tiers = item.tiers ?? [];
      const t =
        tiers.find((x) => x.tier === args.tierKey) ??
        tiers.find((x) => x.defaults) ??
        tiers[0];
      if (!t) throw new Error("No package available");
      tierKey = t.tier;
      tierName = t.name;
      priceUsd = item.basePriceUsd + t.priceDelta;
      priceMmk = item.basePriceMmk + t.priceDeltaMmk;
      deliveryDays = t.deliveryDays;
    }
    priceUsd = Math.round(priceUsd * 100) / 100;
    priceMmk = Math.round(priceMmk);

    const number = `K9-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 36).toString(36).toUpperCase()}`;
    const settings = await readSettingsMap(ctx);
    const mmkPerUsd = Number(settings.mmkPerUsd ?? 4200);
    void mmkPerUsd;

    // Instant purchase path
    let status = "payment_required";
    let creditSpent = 0;
    let paymentMethod = "manual";
    if (args.payWithCredit) {
      const last = await ctx.db
        .query("creditTransactions")
        .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .order("desc")
        .first();
      const balance = last?.balanceAfter ?? 0;
      if (balance + 1e-9 < priceUsd) {
        throw new Error("INSUFFICIENT_CREDIT");
      }
      await ctx.runMutation(internal.credit.applyLedger, {
        userId,
        kind: "purchase",
        direction: "debit",
        amount: priceUsd,
        note: `${number} · ${item.name}${tierName ? ` (${tierName})` : ""}`,
        paymentMethod: "k9_credit",
        by: "purchase",
      });
      creditSpent = priceUsd;
      status = "paid";
      paymentMethod = "k9_credit";
    }

    const orderId = await ctx.db.insert("orders", {
      userId,
      number,
      catalogId: item._id,
      catalogKind: args.kind,
      slug: item.slug,
      itemName: item.name,
      category: item.category,
      tierKey,
      tierName,
      requirements: args.requirements.trim(),
      contactTelegram: args.contactTelegram?.trim() || undefined,
      referenceLinks: args.referenceLinks.filter(Boolean),
      priceUsd,
      priceMmk,
      currency: "USDT",
      creditSpent,
      paymentMethod,
      status,
    } as never);

    await ctx.db.insert("orderEvents", {
      orderId,
      kind: "created",
      note: args.payWithCredit ? "Paid instantly with K9 Credit" : "Order created — payment required",
      by: "customer",
    });

    await ctx.scheduler.runAfter(0, api.telegram.sendOrderNotification, { orderId });
    return { orderId, number, priceUsd, priceMmk, status };
  },
});

/** Customer marks a manual-payment order as requested (attaches note). */
export const addOrderNote = mutation({
  args: { orderId: v.id("orders"), note: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in required");
    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== userId) throw new Error("Not found");
    await ctx.db.insert("orderEvents", {
      orderId: args.orderId,
      kind: "note",
      note: args.note.slice(0, 1000),
      by: "customer",
    });
  },
});

/** Customer cancels a pending order before work starts. */
export const cancelMyOrder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in required");
    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== userId) throw new Error("Not found");
    if (!["pending", "payment_required"].includes(order.status)) {
      throw new Error("Order can no longer be cancelled");
    }
    // Refund K9 Credit if it was paid
    if (order.creditSpent > 0) {
      await ctx.runMutation(internal.credit.applyLedger, {
        userId,
        kind: "refund",
        direction: "credit",
        amount: order.creditSpent,
        note: `Refund for cancelled order ${order.number}`,
        orderId: order._id,
        by: "system",
      });
    }
    await ctx.db.patch(args.orderId, { status: "cancelled" });
    await ctx.db.insert("orderEvents", {
      orderId: args.orderId,
      kind: "cancelled",
      note: "Cancelled by customer",
      by: "customer",
    });
  },
});

async function readSettingsMap(ctx: { db: any }): Promise<Record<string, unknown>> {
  const docs = await ctx.db.query("settings").collect();
  const out: Record<string, unknown> = {};
  for (const d of docs) out[d.key] = d.value;
  return out;
}

// ─── Admin ────────────────────────────────────────────────────────────────

async function requireAdmin(ctx: { auth: any; db: any }) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized");
  const user = await ctx.db.get(userId);
  const email = (user?.email ?? "").toLowerCase();
  if (!adminEmails().includes(email)) throw new Error("Unauthorized");
  return { userId, email };
}

export const adminListOrders = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("orders").withIndex("by_status_time").order("desc").take(300);
  },
});
