import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * K9 Studio — data model.
 *
 * Everything customer-facing (services, products, packages, prices, delivery
 * estimates, FAQ) lives in `catalog` so business updates never require UI
 * changes. Money is stored in two canonical units: USD (float) and MMK
 * (integer). K9 Credit is a USD-pegged balance with a full transaction ledger.
 */
export const tierShape = {
  tier: v.string(), // "basic" | "standard" | "premium" | custom key
  name: v.string(),
  priceDelta: v.number(), // USD added to catalog base price
  priceDeltaMmk: v.number(), // MMK added to catalog base price
  deliveryDays: v.number(),
  description: v.string(),
  features: v.array(v.string()),
  defaults: v.boolean(),
};

export const catalogSchema = {
  kind: v.union(v.literal("service"), v.literal("product")),
  slug: v.string(),
  category: v.string(), // "Website Development" | "Bot Creation" | "AI Bots" | "Custom Projects" | "Prompts" | "AI Role Prompts" | "Code"
  name: v.string(),
  tagline: v.string(),
  description: v.string(),
  longDescription: v.string(),
  pricingModel: v.union(v.literal("tiered"), v.literal("fixed")),
  basePriceUsd: v.number(),
  basePriceMmk: v.number(),
  featured: v.boolean(),
  status: v.union(v.literal("active"), v.literal("hidden")),
  order: v.number(),
  icon: v.optional(v.string()),
  highlights: v.array(v.string()),
  audience: v.optional(v.array(v.string())),
  included: v.optional(v.array(v.string())),
  deliveryNote: v.optional(v.string()),
  requirements: v.optional(v.array(v.string())),
  faq: v.optional(v.array(v.object({ q: v.string(), a: v.string() }))),
  tiers: v.optional(v.array(v.object(tierShape))),
  downloadable: v.optional(
    v.array(v.object({ title: v.string(), kind: v.string() })),
  ),
};

export default defineSchema({
  ...authTables,

  usersProfile: defineTable({
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    telegramUsername: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  settings: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),

  catalog: defineTable(catalogSchema)
    .index("by_kind_slug", ["kind", "slug"])
    .index("by_kind_status_order", ["kind", "status", "order"])
    .index("by_category", ["category"]),

  creditTransactions: defineTable({
    userId: v.id("users"),
    // "topup" | "purchase" | "refund" | "admin_grant" | "admin_deduct" | "adjustment"
    kind: v.string(),
    direction: v.union(v.literal("credit"), v.literal("debit")),
    amount: v.number(), // USD
    balanceAfter: v.number(), // USD
    note: v.optional(v.string()),
    orderId: v.optional(v.id("orders")),
    paymentMethod: v.optional(v.string()),
    paymentRef: v.optional(v.string()),
    by: v.optional(v.string()), // "system" | admin identity
  }).index("by_user_time", ["userId"]),

  orders: defineTable({
    userId: v.id("users"),
    number: v.string(), // K9-XXXXXX
    catalogId: v.id("catalog"),
    catalogKind: v.union(v.literal("service"), v.literal("product")),
    slug: v.string(),
    itemName: v.string(),
    category: v.string(),
    tierKey: v.optional(v.string()),
    tierName: v.optional(v.string()),
    requirements: v.string(),
    contactTelegram: v.optional(v.string()),
    referenceLinks: v.array(v.string()),
    priceUsd: v.number(),
    priceMmk: v.number(),
    currency: v.union(v.literal("MMK"), v.literal("USDT")),
    creditSpent: v.number(),
    paymentMethod: v.string(), // "k9_credit" | "manual"
    status: v.string(), // pending | payment_required | paid | in_progress | revision | completed | cancelled
    adminNote: v.optional(v.string()),
  })
    .index("by_user_time", ["userId"])
    .index("by_status_time", ["status"])
    .index("by_number", ["number"]),

  orderEvents: defineTable({
    orderId: v.id("orders"),
    kind: v.string(),
    note: v.string(),
    by: v.string(),
  }).index("by_order_time", ["orderId"]),

  projectRequests: defineTable({
    userId: v.optional(v.id("users")),
    description: v.string(),
    budget: v.string(),
    deadline: v.string(),
    references: v.string(),
    contactTelegram: v.string(),
    contactPref: v.string(),
    status: v.string(), // new | reviewing | quoted | accepted | declined
    adminNote: v.optional(v.string()),
    source: v.string(), // "custom_page" | "homepage" | "service_page"
  })
    .index("by_status_time", ["status"])
    .index("by_user_time", ["userId"]),

  supportMessages: defineTable({
    userId: v.optional(v.id("users")),
    name: v.string(),
    contact: v.string(),
    topic: v.string(),
    message: v.string(),
    status: v.string(), // new | resolved
  }).index("by_status_time", ["status"]),

  adminAudit: defineTable({
    actor: v.string(),
    action: v.string(),
    detail: v.string(),
  }),
});
