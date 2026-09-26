import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

/**
 * K9 Studio authentication (spec §17).
 * Primary: Google OAuth + Email (password). Telegram contact is captured on
 * the user profile / orders instead of a separate sign-in method for now.
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google, Password],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      const existing = await ctx.db
        .query("usersProfile")
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();
      if (!existing) {
        await ctx.db.insert("usersProfile", { userId });
      }
    },
  },
});
