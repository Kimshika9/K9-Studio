import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * K9 Credit (spec §14): a USD-pegged universal purchasing layer with a fully
 * auditable ledger. Every balance change writes a `creditTransactions` row.
 */
export const getBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const last = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
    return last?.balanceAfter ?? 0;
  },
});

export const getBalanceAndHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const rows = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
    return {
      balance: rows[0]?.balanceAfter ?? 0,
      transactions: rows,
    };
  },
});

/**
 * The only mutation allowed to change balances. Purchases, top-ups, refunds
 * and admin grants all flow through here, keeping the ledger auditable.
 */
export const applyLedger = internalMutation({
  args: {
    userId: v.id("users"),
    kind: v.string(), // topup | purchase | refund | admin_grant | admin_deduct | adjustment
    direction: v.union(v.literal("credit"), v.literal("debit")),
    amount: v.number(),
    note: v.optional(v.string()),
    orderId: v.optional(v.id("orders")),
    paymentMethod: v.optional(v.string()),
    paymentRef: v.optional(v.string()),
    by: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!(args.amount > 0)) throw new Error("Amount must be positive");
    const last = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user_time", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();
    const current = last?.balanceAfter ?? 0;
    const delta = args.direction === "credit" ? args.amount : -args.amount;
    const next = Math.round((current + delta) * 100) / 100;
    if (next < 0) throw new Error("Insufficient K9 Credit");
    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      kind: args.kind,
      direction: args.direction,
      amount: args.amount,
      balanceAfter: next,
      note: args.note,
      orderId: args.orderId,
      paymentMethod: args.paymentMethod,
      paymentRef: args.paymentRef,
      by: args.by ?? "system",
    });
    return next;
  },
});
