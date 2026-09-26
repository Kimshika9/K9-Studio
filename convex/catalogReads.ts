import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { CATALOG_SEED, SETTINGS_SEED } from "./seedData";

/**
 * Public settings + catalog readers (spec §14, §15, §33, §34).
 * Prices, packages and conversion rate are data, not code.
 * First run auto-seeds the catalog so the storefront is never empty.
 */
async function seedIfEmpty(ctx: { db: any }) {
  const anyItem = await ctx.db.query("catalog").first();
  if (anyItem) return;
  for (const item of CATALOG_SEED) {
    await ctx.db.insert("catalog", item as never);
  }
  for (const s of SETTINGS_SEED) {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q: any) => q.eq("key", s.key))
      .first();
    if (!existing) await ctx.db.insert("settings", { key: s.key, value: s.value });
  }
}

export const getPublicSettings = query({
  args: {},
  handler: async (ctx) => {
    await seedIfEmpty(ctx);
    const docs = await ctx.db.query("settings").collect();
    const out: Record<string, unknown> = {};
    for (const d of docs) out[d.key] = d.value;
    return out;
  },
});

export const listCatalog = query({
  args: {
    kind: v.optional(v.union(v.literal("service"), v.literal("product"))),
    category: v.optional(v.string()),
    includeHidden: v.boolean(),
  },
  handler: async (ctx, args) => {
    await seedIfEmpty(ctx);
    let docs: Doc<"catalog">[];
    if (args.kind) {
      docs = await ctx.db
        .query("catalog")
        .withIndex("by_kind_status_order", (q) =>
          q.eq("kind", args.kind!).eq("status", "active"),
        )
        .collect();
    } else {
      docs = await ctx.db.query("catalog").collect();
    }
    let list = docs;
    if (args.category) list = list.filter((d) => d.category === args.category);
    if (!args.includeHidden) list = list.filter((d) => d.status === "active");
    return list.sort((a, b) => a.order - b.order);
  },
});

export const getCatalogItem = query({
  args: { kind: v.union(v.literal("service"), v.literal("product")), slug: v.string() },
  handler: async (ctx, args) => {
    await seedIfEmpty(ctx);
    return await ctx.db
      .query("catalog")
      .withIndex("by_kind_slug", (q) => q.eq("kind", args.kind).eq("slug", args.slug))
      .first();
  },
});
