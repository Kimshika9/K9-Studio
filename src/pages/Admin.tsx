import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import {
  Star, RefreshCcw, ArrowUpRight, XCircle, Copy, Wallet,
} from "lucide-react";
import { api } from "@convex/_generated/api";
import { formatMmk, formatUsd } from "../lib/utils";
import { K9Mark } from "../brand/K9Mark";

type TabKey = "orders" | "requests" | "support" | "catalog" | "customers" | "settings";

export default function Admin() {
  const [tab, setTab] = useState<TabKey>("orders");
  const stats = useQuery(api.admin.adminStats);
  const orders = useQuery(api.admin.adminListOrders, {});
  const requests = useQuery(api.admin.adminListRequests, {});
  const support = useQuery(api.admin.adminListSupport, {});
  const catalog = useQuery(api.admin.adminListCatalog, {});
  const customers = useQuery(api.admin.adminListCustomers, {});
  const settings = useQuery(api.catalogReads.getPublicSettings) ?? {};

  const setStatus = useMutation(api.admin.adminSetOrderStatus);
  const setReqStatus = useMutation(api.admin.adminSetRequestStatus);
  const setSupStatus = useMutation(api.admin.adminSetSupportStatus);
  const grantCredit = useMutation(api.admin.adminGrantCredit);
  const upsertCatalog = useMutation(api.admin.adminUpsertCatalog);
  const setSetting = useMutation(api.admin.adminSetSetting);

  const [rate, setRate] = useState<string | null>(null);
  const [supportTg, setSupportTg] = useState<string | null>(null);

  const TABS: { key: TabKey; label: string }[] = [
    { key: "orders", label: "Orders" },
    { key: "requests", label: "Requests" },
    { key: "support", label: "Support" },
    { key: "catalog", label: "Catalog" },
    { key: "customers", label: "Customers" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="section-pad pt-10">
      <div className="shell">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <K9Mark size={36} />
            <div>
              <h1 className="font-display text-2xl font-bold">Studio Control</h1>
              <p className="muted text-sm">K9 admin — the business runs from here</p>
            </div>
          </div>
          <div className="flex gap-3">
            {[
              { label: "Active orders", value: stats?.activeOrders },
              { label: "New requests", value: stats?.requests },
              { label: "New support", value: stats?.supportNew },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl px-4 py-2.5 text-center">
                <p className="muted text-[0.65rem] uppercase tracking-wider">{s.label}</p>
                <p className="font-display text-lg font-bold">{s.value ?? "–"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-1 overflow-x-auto rounded-xl border p-1" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm transition-colors ${
                tab === t.key ? "font-semibold" : "muted hover:text-[var(--text-1)]"
              }`}
              style={tab === t.key ? { background: "color-mix(in srgb, var(--accent) 16%, transparent)", color: "var(--accent)" } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "orders" && (
            <div className="space-y-3">
              {(orders ?? []).map((o) => (
                <div key={o._id} className="panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-display font-bold">{o.number}</span>
                      <span className={`status-chip status-${o.status}`}>{o.status.replace(/_/g, " ")}</span>
                      {o.creditSpent > 0 && <span className="badge-k9">{formatUsd(o.creditSpent)} ⭐</span>}
                    </div>
                    <p className="soft mt-1 text-sm">
                      {o.itemName}{o.tierName ? ` · ${o.tierName}` : ""} · {formatUsd(o.priceUsd)} USDT / {formatMmk(o.priceMmk)} MMK
                    </p>
                    {o.requirements && <p className="muted mt-1 max-w-2xl text-xs">📝 {o.requirements.slice(0, 160)}</p>}
                    {o.contactTelegram && <p className="muted text-xs">💬 @{o.contactTelegram}</p>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["paid", "in_progress", "revision", "completed", "cancelled"].map((s) => (
                      <button
                        key={s}
                        onClick={async () => {
                          try {
                            await setStatus({ orderId: o._id, status: s });
                            toast.success(`${o.number} → ${s}`);
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : "Failed");
                          }
                        }}
                        disabled={o.status === s}
                        className="badge-k9 cursor-pointer transition-colors hover:border-[color-mix(in_srgb,var(--accent)_50%,transparent)] disabled:opacity-40"
                      >
                        {s.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {orders && orders.length === 0 && <p className="muted">No orders yet.</p>}
            </div>
          )}

          {tab === "requests" && (
            <div className="space-y-3">
              {(requests ?? []).map((r) => (
                <div key={r._id} className="panel rounded-2xl p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`status-chip status-${r.status}`}>{r.status}</span>
                    <span className="muted text-xs">{new Date(r._creationTime).toLocaleString()} · via {r.source}</span>
                  </div>
                  <p className="soft mt-3 whitespace-pre-wrap text-sm">{r.description}</p>
                  <div className="muted mt-3 grid gap-1 text-xs sm:grid-cols-2">
                    {r.budget && <p>💰 Budget: {r.budget}</p>}
                    {r.deadline && <p>📅 Deadline: {r.deadline}</p>}
                    {r.references && <p className="sm:col-span-2">🔗 {r.references}</p>}
                    <p>💬 Telegram: @{r.contactTelegram || "—"} · prefers {r.contactPref}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {["reviewing", "quoted", "accepted", "declined"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setReqStatus({ requestId: r._id, status: s })}
                        disabled={r.status === s}
                        className="badge-k9 cursor-pointer disabled:opacity-40"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {requests && requests.length === 0 && <p className="muted">No custom project requests yet.</p>}
            </div>
          )}

          {tab === "support" && (
            <div className="space-y-3">
              {(support ?? []).map((m) => (
                <div key={m._id} className="panel rounded-2xl p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{m.topic} — {m.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`status-chip status-${m.status}`}>{m.status}</span>
                      <button
                        onClick={() => setSupStatus({ messageId: m._id, status: m.status === "new" ? "resolved" : "new" })}
                        className="badge-k9 cursor-pointer"
                      >
                        {m.status === "new" ? "resolve" : "reopen"}
                      </button>
                    </div>
                  </div>
                  <p className="soft mt-2 text-sm">{m.message}</p>
                  <p className="muted mt-2 text-xs">Contact: {m.contact} · {new Date(m._creationTime).toLocaleString()}</p>
                </div>
              ))}
              {support && support.length === 0 && <p className="muted">No support messages yet.</p>}
            </div>
          )}

          {tab === "catalog" && (
            <div className="space-y-3">
              <p className="muted text-sm">
                The storefront reads everything from this catalog — names, prices, packages and availability are data, not code.
              </p>
              {(catalog ?? []).map((c) => (
                <CatalogRow key={c._id} item={c} onSave={async (patch) => {
                  await upsertCatalog({ id: c._id, patch });
                  toast.success(`${c.name} updated`);
                }} />
              ))}
            </div>
          )}

          {tab === "customers" && (
            <div className="space-y-3">
              {(customers ?? []).map((c) => (
                <div key={String(c.userId)} className="panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
                  <div>
                    <p className="font-semibold">{c.name ?? c.email ?? "Customer"}</p>
                    <p className="muted text-sm">{c.email} {c.telegram ? `· @${c.telegram}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold" style={{ color: "var(--accent)" }}>
                      {formatUsd(c.balance ?? 0)} ⭐
                    </span>
                    <GrantButton onGrant={async (amount, note) => {
                      await grantCredit({ userId: c.userId as never, amount, note });
                      toast.success(`${amount > 0 ? "Granted" : "Deducted"} ${formatUsd(Math.abs(amount))} ⭐`);
                    }} />
                  </div>
                </div>
              ))}
              {customers && customers.length === 0 && <p className="muted">No customers yet.</p>}
            </div>
          )}

          {tab === "settings" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="panel rounded-2xl p-6">
                <h2 className="font-display text-lg font-bold">Currency conversion</h2>
                <p className="muted mt-2 text-sm">1 USDT = ? MMK (used for the ≈ secondary price display)</p>
                <div className="mt-4 flex gap-2">
                  <input
                    className="input-k9"
                    inputMode="numeric"
                    value={rate ?? String(settings.mmkPerUsd ?? 4200)}
                    onChange={(e) => setRate(e.target.value)}
                  />
                  <button
                    className="btn-k9 btn-primary"
                    onClick={async () => {
                      await setSetting({ key: "mmkPerUsd", value: Number(rate ?? 4200) });
                      toast.success("Conversion rate updated");
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
              <div className="panel rounded-2xl p-6">
                <h2 className="font-display text-lg font-bold">Support Telegram link</h2>
                <p className="muted mt-2 text-sm">Shown on Support, Credit and footer CTAs.</p>
                <div className="mt-4 flex gap-2">
                  <input
                    className="input-k9"
                    value={supportTg ?? String(settings.supportTelegram ?? "https://t.me/k9studio")}
                    onChange={(e) => setSupportTg(e.target.value)}
                  />
                  <button
                    className="btn-k9 btn-primary"
                    onClick={async () => {
                      await setSetting({ key: "supportTelegram", value: supportTg ?? "https://t.me/k9studio" });
                      toast.success("Support link updated");
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
              <div className="panel rounded-2xl p-6 lg:col-span-2">
                <h2 className="font-display text-lg font-bold">Telegram notifications</h2>
                <p className="muted mt-2 text-sm leading-relaxed">
                  Set <code className="badge-k9">K9_TELEGRAM_BOT_TOKEN</code> and{" "}
                  <code className="badge-k9">K9_TELEGRAM_ADMIN_CHAT_ID</code> in the environment to receive
                  instant alerts for new orders, custom project requests and support messages.
                  Admin notifications never expose customer secrets.
                </p>
                <p className="muted mt-2 text-xs">
                  Admin accounts are the emails listed in <code className="badge-k9">K9_ADMIN_EMAILS</code>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CatalogRow({ item, onSave }: { item: any; onSave: (patch: any) => Promise<void> }) {
  const [name, setName] = useState(item.name);
  const [usd, setUsd] = useState(String(item.basePriceUsd));
  const [mmk, setMmk] = useState(String(item.basePriceMmk));
  const [hidden, setHidden] = useState(item.status !== "active");
  const [open, setOpen] = useState(false);

  return (
    <div className="panel rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="badge-k9">{item.kind}</span>
        <span className="font-semibold">{item.name}</span>
        <span className="muted text-sm">{item.category}</span>
        {hidden && <span className="status-chip status-cancelled">hidden</span>}
        <button onClick={() => setOpen(!open)} className="btn-k9 btn-quiet ml-auto text-xs">
          {open ? "Close" : "Edit"}
        </button>
      </div>
      {open && (
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <label className="block sm:col-span-2">
            <span className="muted text-xs">Name</span>
            <input className="input-k9 mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block">
            <span className="muted text-xs">Price USDT</span>
            <input className="input-k9 mt-1" inputMode="decimal" value={usd} onChange={(e) => setUsd(e.target.value)} />
          </label>
          <label className="block">
            <span className="muted text-xs">Price MMK</span>
            <input className="input-k9 mt-1" inputMode="numeric" value={mmk} onChange={(e) => setMmk(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
            Hidden from storefront
          </label>
          <button
            className="btn-k9 btn-primary sm:col-span-3 sm:w-auto sm:justify-self-end"
            onClick={() =>
              onSave({
                name,
                basePriceUsd: Number(usd),
                basePriceMmk: Number(mmk),
                status: hidden ? "hidden" : "active",
              })
            }
          >
            Save changes
          </button>
        </div>
      )}
    </div>
  );
}

function GrantButton({ onGrant }: { onGrant: (amount: number, note: string) => Promise<void> }) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-1.5">
      <input
        className="input-k9 w-24 !py-1.5 text-sm"
        placeholder="±10"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        className="btn-k9 btn-ghost !px-3 !py-1.5 text-xs"
        disabled={busy || !amount}
        onClick={async () => {
          setBusy(true);
          try {
            await onGrant(Number(amount), `Manual adjustment (${amount})`);
            setAmount("");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Star size={12} /> Adjust
      </button>
    </div>
  );
}
