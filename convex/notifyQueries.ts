import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/** Internal queries used by notification actions (single arg-object shape). */
export const getOrderForNotify = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const getNotifyDoc = query({
  args: { table: v.union(v.literal("projectRequests"), v.literal("supportMessages")), id: v.string() },
  handler: async (ctx, args) => {
    if (args.table === "projectRequests") {
      return await ctx.db.get(args.id as Id<"projectRequests">);
    }
    return await ctx.db.get(args.id as Id<"supportMessages">);
  },
});
