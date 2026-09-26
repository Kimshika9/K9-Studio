import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

/**
 * Telegram notifications (spec §19).
 * Admin notifications flow through this action using a bot token read from
 * server-side env. The token is never exposed to the client.
 */
const html = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const STATUS_EMOJI: Record<string, string> = {
  pending: "🆕",
  payment_required: "💳",
  paid: "💰",
  in_progress: "🛠",
  revision: "♻️",
  completed: "✅",
  cancelled: "✖️",
};

export const sendOrderNotification = action({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const token = process.env.K9_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.K9_TELEGRAM_ADMIN_CHAT_ID;
    if (!token || !chatId) return; // not configured — skip silently
    const order = await ctx.runQuery(api.notifyQueries.getOrderForNotify, { orderId: args.orderId });
    if (!order) return;
    const lines = [
      `${STATUS_EMOJI[order.status] ?? "🆕"} <b>Order ${order.number} — ${order.status.replace(/_/g, " ")}</b>`,
      ``,
      `📦 <b>${order.itemName}</b>${order.tierName ? ` — ${order.tierName}` : ""}`,
      `🏷 ${order.category}`,
      `💰 <b>${order.priceUsd.toFixed(2)} USDT</b> · ${order.priceMmk.toLocaleString()} MMK`,
      order.creditSpent > 0
        ? `⭐ Paid with K9 Credit (${order.creditSpent.toFixed(2)} ⭐)`
        : `📩 Manual payment requested`,
      order.requirements ? `📝 <i>${html(order.requirements.slice(0, 400))}</i>` : "",
      order.contactTelegram ? `💬 @${order.contactTelegram}` : "",
    ].filter(Boolean);
    await send(lines.join("\n"), token, chatId);
  },
});

export const sendProjectRequestNotification = action({
  args: { requestId: v.id("projectRequests") },
  handler: async (ctx, args) => {
    const cfg = cfgOf();
    if (!cfg) return;
    const doc = await ctx.runQuery(api.notifyQueries.getNotifyDoc, {
      table: "projectRequests",
      id: args.requestId,
    });
    if (!doc) return;
    const r = doc as Doc<"projectRequests">;
    const lines = [
      `🧭 <b>Custom project request</b>`,
      ``,
      `📝 ${html(String(r.description).slice(0, 600))}`,
      r.budget ? `💰 Budget: ${html(r.budget)}` : "",
      r.deadline ? `📅 Deadline: ${html(r.deadline)}` : "",
      r.references ? `🔗 References: ${html(r.references.slice(0, 200))}` : "",
      r.contactTelegram ? `💬 Contact: @${r.contactTelegram}` : "",
    ].filter(Boolean);
    await send(lines.join("\n"), cfg.token, cfg.chatId);
  },
});

export const sendSupportMessageNotification = action({
  args: { messageId: v.id("supportMessages") },
  handler: async (ctx, args) => {
    const cfg = cfgOf();
    if (!cfg) return;
    const doc = await ctx.runQuery(api.notifyQueries.getNotifyDoc, {
      table: "supportMessages",
      id: args.messageId,
    });
    if (!doc) return;
    const s = doc as Doc<"supportMessages">;
    const lines = [
      `💬 <b>Support message</b>`,
      ``,
      `👤 ${html(s.name)} (${html(s.contact)})`,
      `🏷 ${html(s.topic)}`,
      `📝 ${html(s.message.slice(0, 600))}`,
    ];
    await send(lines.join("\n"), cfg.token, cfg.chatId);
  },
});

export const sendCustomNotification = action({
  args: { text: v.string() },
  handler: async (_ctx, args) => {
    const cfg = cfgOf();
    if (!cfg) return;
    await send(args.text, cfg.token, cfg.chatId);
  },
});

function cfgOf(): { token: string; chatId: string } | null {
  const token = process.env.K9_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.K9_TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chatId) return null;
  return { token, chatId };
}

async function send(text: string, token: string, chatId: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch {
    // notification failure must never block business operations
  }
}
