import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

/** Custom project request (spec §13). Works signed-in or anonymous. */
export const submitProjectRequest = mutation({
  args: {
    description: v.string(),
    budget: v.string(),
    deadline: v.string(),
    references: v.string(),
    contactTelegram: v.string(),
    contactPref: v.string(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const description = args.description.trim();
    if (description.length < 10) throw new Error("Please describe your idea in a little more detail");
    const userId = await getAuthUserId(ctx);
    const id = await ctx.db.insert("projectRequests", {
      userId: userId ?? undefined,
      description: description.slice(0, 4000),
      budget: args.budget.trim().slice(0, 120),
      deadline: args.deadline.trim().slice(0, 120),
      references: args.references.trim().slice(0, 1000),
      contactTelegram: args.contactTelegram.trim().replace(/^@/, "").slice(0, 60),
      contactPref: args.contactPref,
      status: "new",
      source: args.source,
    });
    await ctx.scheduler.runAfter(0, api.telegram.sendProjectRequestNotification, { requestId: id });
    return id;
  },
});

/** Support message (spec §23). Works signed-in or anonymous. */
export const submitSupportMessage = mutation({
  args: {
    name: v.string(),
    contact: v.string(),
    topic: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const message = args.message.trim();
    if (message.length < 5) throw new Error("Please write your message");
    const userId = await getAuthUserId(ctx);
    const id = await ctx.db.insert("supportMessages", {
      userId: userId ?? undefined,
      name: args.name.trim().slice(0, 80),
      contact: args.contact.trim().slice(0, 120),
      topic: args.topic.trim().slice(0, 80) || "General",
      message: message.slice(0, 3000),
      status: "new",
    });
    await ctx.scheduler.runAfter(0, api.telegram.sendSupportMessageNotification, { messageId: id });
    return id;
  },
});

/** Save / update the customer's Telegram username on their profile. */
export const saveMyTelegram = mutation({
  args: { telegramUsername: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in required");
    const handle = args.telegramUsername.trim().replace(/^@/, "").slice(0, 60);
    const existing = await ctx.db
      .query("usersProfile")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { telegramUsername: handle });
    } else {
      await ctx.db.insert("usersProfile", { userId, telegramUsername: handle });
    }
  },
});
