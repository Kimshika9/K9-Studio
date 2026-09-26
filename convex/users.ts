import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Current-user resolution via Convex Auth (works for OAuth + password).
 * The `users` table is owned by @convex-dev/auth (see authTables in schema).
 */
export const currentUserId = query({
  args: {},
  handler: async (ctx) => {
    return await getAuthUserId(ctx);
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const profile = await ctx.db
      .query("usersProfile")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    return {
      userId,
      email: user.email ?? null,
      name: user.name ?? null,
      image: user.image ?? null,
      profile,
    };
  },
});
