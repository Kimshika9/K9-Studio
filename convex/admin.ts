import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal, api } from "./_generated/api";
import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";

function adminEmails(): string[] {
  return (process.env.K9_ADMIN_EMAILS ?? "admin@k9studio.app")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

async function requireAdmin(ctx: GenericMutationCtx<any> | GenericQueryCtx<any>) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized");
  const user = await ctx.db.get(userId);
  const email = (user?.email ?? "").toLowerCase();
  if (!adminEmails().includes(email)) throw new Error("Unauthorized");
  return { userId, email };
}

function log(ctx: any, actor: string, action: string, detail: string) {
  void ctx.db.insert("adminAudit", { actor, action, detail });
}

// ─── Queries ──────────────────────────────────────────────────────────────

export const adminStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const orders = await ctx.db.query("orders").collect();
    const requests = await ctx.db.query("projectRequests").collect();
    const support = await ctx.db.query("supportMessages").collect();
    return {
      orders: orders.length,
      activeOrders: orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length,
      revenueUsd: Math.round(orders.filter((o) => o.creditSpent > 0 || o.status !== "payment_required").reduce((s, o) => s + o.priceUsd, 0) * 100) / 100,
      requests: requests.filter((r) => r.status === "new").length,
      supportNew: support.filter((s) => s.status === "new").length,
    };
  },
});

export const adminListOrders = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.status) {
      return await ctx.db
        .query("orders")
        .withIndex("by_status_time", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(300);
    }
    return await ctx.db.query("orders").order("desc").take(300);
  },
});

export const adminGetOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    const events = await ctx.db
      .query("orderEvents")
      .withIndex("by_order_time", (q) => q.eq("orderId", args.orderId))
      .order("desc")
      .take(100);
    const customer = await ctx.db.get(order.userId);
    const creditTxs = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user_time", (q) => q.eq("userId", order.userId))
      .order("desc")
      .take(30);
    return { order, events, customer, creditTxs };
  },
});

export const adminListRequests = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("projectRequests").order("desc").take(200);
  },
});

export const adminListSupport = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("supportMessages").order("desc").take(200);
  },
});

export const adminListCatalog = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("catalog").collect();
  },
});

export const adminListCustomers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const profiles = await ctx.db.query("usersProfile").collect();
    const out = [];
    for (const p of profiles) {
      const user = await ctx.db.get(p.userId);
      const lastTx = await ctx.db
        .query("creditTransactions")
        .withIndex("by_user_time", (q) => q.eq("userId", p.userId))
        .order("desc")
        .first();
      out.push({
        profileId: p._id,
        userId: p.userId,
        email: user?.email ?? null,
        name: user?.name ?? null,
        telegram: p.telegramUsername ?? null,
        balance: lastTx?.balanceAfter ?? 0,
        joined: user?._creationTime ?? null,
      });
    }
    return out;
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────

export const adminSetOrderStatus = mutation({
  args: { orderId: v.id("orders"), status: v.string(), note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    await ctx.db.patch(args.orderId, { status: args.status });
    await ctx.db.insert("orderEvents", {
      orderId: args.orderId,
      kind: "status",
      note: args.note ?? `Status → ${args.status.replace(/_/g, " ")}`,
      by: admin.email,
    });
    // Refund credit when an admin cancels a credit-paid order
    if (args.status === "cancelled" && order.creditSpent > 0) {
      await ctx.runMutation(internal.credit.applyLedger, {
        userId: order.userId,
        kind: "refund",
        direction: "credit",
        amount: order.creditSpent,
        note: `Refund — order ${order.number} cancelled by admin`,
        orderId: order._id,
        by: admin.email,
      });
    }
    log(ctx, admin.email, "order_status", `${order.number} → ${args.status}`);
    await ctx.scheduler.runAfter(0, api.telegram.sendCustomNotification, {
      text: `🔄 <b>Order ${order.number}</b> → ${args.status.replace(/_/g, " ")}${args.note ? `\n<i>${args.note}</i>` : ""}`,
    });
  },
});

export const adminAddOrderNote = mutation({
  args: { orderId: v.id("orders"), note: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await ctx.db.insert("orderEvents", {
      orderId: args.orderId,
      kind: "note",
      note: args.note.slice(0, 1000),
      by: admin.email,
    });
  },
});

export const adminSetRequestStatus = mutation({
  args: { requestId: v.id("projectRequests"), status: v.string(), note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await ctx.db.patch(args.requestId, {
      status: args.status,
      ...(args.note !== undefined ? { adminNote: args.note } : {}),
    });
    log(ctx, admin.email, "request_status", `${args.requestId} → ${args.status}`);
  },
});

export const adminSetSupportStatus = mutation({
  args: { messageId: v.id("supportMessages"), status: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await ctx.db.patch(args.messageId, { status: args.status });
    log(ctx, admin.email, "support_status", `${args.messageId} → ${args.status}`);
  },
});

export const adminGrantCredit = mutation({
  args: { userId: v.id("users"), amount: v.number(), note: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (!(args.amount > 0)) throw new Error("Amount must be positive");
    await ctx.runMutation(internal.credit.applyLedger, {
      userId: args.userId,
      kind: args.amount >= 0 ? "admin_grant" : "admin_deduct",
      direction: args.amount >= 0 ? "credit" : "debit",
      amount: Math.abs(args.amount),
      note: args.note,
      by: admin.email,
    });
    log(ctx, admin.email, "credit", `${args.userId} ${args.amount} (${args.note})`);
  },
});

export const adminUpsertCatalog = mutation({
  args: {
    id: v.optional(v.id("catalog")),
    patch: v.any(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (args.id) {
      await ctx.db.patch(args.id, args.patch);
      log(ctx, admin.email, "catalog_update", args.id);
    } else {
      const id = await ctx.db.insert("catalog", args.patch);
      log(ctx, admin.email, "catalog_create", String(id));
      return id;
    }
  },
});

export const adminSetSetting = mutation({
  args: { key: v.string(), value: v.any() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
    } else {
      await ctx.db.insert("settings", { key: args.key, value: args.value });
    }
    log(ctx, admin.email, "setting", `${args.key} = ${JSON.stringify(args.value).slice(0, 100)}`);
  },
});

export const adminUpdateProfile = mutation({
  args: { profileId: v.id("usersProfile"), telegramUsername: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await ctx.db.patch(args.profileId, { telegramUsername: args.telegramUsername });
    log(ctx, admin.email, "profile", String(args.profileId));
  },
});

export const adminGetAudit = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("adminAudit").order("desc").take(100);
  },
});

export const adminCheck = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return true;
  },
});
