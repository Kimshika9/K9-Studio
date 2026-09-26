import { mutation } from "./_generated/server";
import { CATALOG_SEED, SETTINGS_SEED } from "./seedData";

/**
 * Idempotent seeding — run with: bun convex run seed:seedOnce
 * Never overwrites existing data.
 */
export const seedOnce = mutation({
  args: {},
  handler: async (ctx) => {
    let catalogCreated = 0;
    let settingsCreated = 0;
    for (const item of CATALOG_SEED) {
      const existing = await ctx.db
        .query("catalog")
        .withIndex("by_kind_slug", (q) =>
          q.eq("kind", item.kind as "service" | "product").eq("slug", item.slug),
        )
        .first();
      if (!existing) {
        await ctx.db.insert("catalog", item as never);
        catalogCreated++;
      }
    }
    for (const s of SETTINGS_SEED) {
      const existing = await ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", s.key))
        .first();
      if (!existing) {
        await ctx.db.insert("settings", { key: s.key, value: s.value });
        settingsCreated++;
      }
    }
    return { catalogCreated, settingsCreated };
  },
});
