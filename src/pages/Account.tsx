import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import {
  LayoutDashboard, Package, Download, Star, Settings2, LogOut,
  ExternalLink, Send, Loader2, Copy, XCircle,
} from "lucide-react";
import { useConvexAuth, useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { K9Mark } from "../brand/K9Mark";
import { Badge } from "../components/Badge";
import { formatMmk, formatUsd } from "../lib/utils";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "orders", label: "Orders", icon: Package },
  { key: "downloads", label: "Downloads", icon: Download },
  { key: "credit", label: "K9 Credit", icon: Star },
  { key: "settings", label: "Profile", icon: Settings2 },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Account() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as TabKey) || "overview";
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const profile = useQuery(api.users.getMyProfile);
  const orders = useQuery(api.orders.getMyOrders) ?? [];
  const credit = useQuery(api.credit.getBalanceAndHistory);
  const saveTelegram = useMutation(api.public.saveMyTelegram);
  const cancelOrder = useMutation(api.orders.cancelMyOrder);

  const [telegram, setTelegram] = useState<string | null>(null);
  const [busyTopup, setBusyTopup] = useState<number | null>(null);

  const balance = credit?.balance ?? 0;

  function setTab(t: TabKey) {
    setParams({ tab: t });
  }

  async function doSignOut() {
    try {
      await signOut();
    } catch {
      /* navigating anyway */
    }
    location.href = "/";
  }

  async function saveTg() {
    if (telegram === null) return;
    try {
      await saveTelegram({ telegramUsername: telegram });
      toast.success("Telegram username saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    }
  }

  async function requestTopup(usd: number) {
    setBusyTopup(usd);
    try {
      void usd; // top-ups currently route through Telegram (CreditTab)
    } finally {
      setBusyTopup(null);
    }
  }

  return (
    <div className="section-pad pt-10">
      <div className="shell">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <K9Mark size={44} glowing />
            <div>
              <h1 className="font-display text-2xl font-bold">
                {profile?.name || profile?.email || "Your account"}
              </h1>
              <p className="muted text-sm">{profile?.email}</p>
            </div>
          </div>
          <div className="glass rounded-2xl px-5 py-3">
            <p className="eyebrow">K9 Credit</p>
            <p className="font-display text-2xl font-bold" style={{ color: "var(--accent)" }}>
              {balance.toFixed(2)} <Star size={16} className="inline -mt-1" />
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 overflow-x-auto rounded-xl border p-1" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm transition-colors ${
                tab === t.key ? "font-semibold" : "muted hover:text-[var(--text-1)]"
              }`}
              style={tab === t.key ? { background: "color-mix(in srgb, var(--accent) 16%, transparent)", color: "var(--accent)" } : undefined}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "overview" && <Overview orders={orders} balance={balance} setTab={setTab} />}
          {tab === "orders" && (
            <OrdersTab orders={orders} onCancel={async (id) => {
              try {
                await cancelOrder({ orderId: id });
                toast.success("Order cancelled");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Could not cancel");
              }
            }} />
          )}
          {tab === "downloads" && <DownloadsTab orders={orders} />}
          {tab === "credit" && <CreditTab credit={credit} busyTopup={busyTopup} />}
          {tab === "settings" && (
            <ProfileTab
              profile={profile}
              telegram={telegram ?? profile?.profile?.telegramUsername ?? ""}
              setTelegram={setTelegram}
              onSaveTg={saveTg}
              onSignOut={doSignOut}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Overview({ orders, balance, setTab }: any) {
  const active = orders.filter((o: any) => !["completed", "cancelled"].includes(o.status));
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="panel rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold">Active orders</h2>
        {active.length === 0 ? (
          <Empty text="No active orders yet." cta={{ label: "Browse services", to: "/services" }} />
        ) : (
          <ul className="mt-4 space-y-3">
            {active.slice(0, 4).map((o: any) => <OrderRow key={o._id} o={o} />)}
          </ul>
        )}
      </div>
      <div className="panel rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold">At a glance</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            { label: "K9 Credit", value: `${balance.toFixed(2)} ⭐` },
            { label: "Total orders", value: String(orders.length) },
            { label: "Products owned", value: String(orders.filter((o: any) => o.catalogKind === "product" && o.status !== "cancelled").length) },
            { label: "Completed", value: String(orders.filter((o: any) => o.status === "completed").length) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <p className="muted text-xs uppercase tracking-wider">{s.label}</p>
              <p className="font-display mt-1.5 text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setTab("credit")} className="btn-k9 btn-ghost mt-4 w-full">Manage K9 Credit</button>
      </div>
    </div>
  );
}

function OrdersTab({ orders, onCancel }: { orders: any[]; onCancel: (id: any) => void }) {
  if (!orders.length) {
    return <Empty text="No orders yet — your first project is one description away." cta={{ label: "Explore services", to: "/services" }} />;
  }
  return (
    <div className="space-y-3">
      {orders.map((o) => <OrderCard key={o._id} o={o} onCancel={onCancel} />)}
    </div>
  );
}

function OrderCard({ o, onCancel }: { o: any; onCancel: (id: any) => void }) {
  const [open, setOpen] = useState(false);
  const cancellable = ["pending", "payment_required"].includes(o.status);
  return (
    <div className="panel rounded-2xl">
      <button onClick={() => setOpen(!open)} className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-display font-bold">{o.number}</span>
            <span className={`status-chip status-${o.status}`}>{o.status.replace(/_/g, " ")}</span>
          </div>
          <p className="soft mt-1 text-sm">
            {o.itemName}{o.tierName ? ` · ${o.tierName}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display font-bold">{formatUsd(o.priceUsd)} USDT</p>
          <p className="muted text-xs">{formatMmk(o.priceMmk)} MMK</p>
        </div>
      </button>
      {open && (
        <div className="border-t p-5" style={{ borderColor: "var(--border)" }}>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Row k="Category" v={o.category} />
            <Row k="Payment" v={o.creditSpent > 0 ? `K9 Credit (${formatUsd(o.creditSpent)} ⭐)` : "Manual — pending arrangement"} />
            <Row k="Your Telegram" v={o.contactTelegram ? `@${o.contactTelegram}` : "—"} />
            <Row k="Placed" v={new Date(o._creationTime).toLocaleString()} />
          </dl>
          {o.requirements && (
            <div className="mt-4">
              <p className="muted text-xs uppercase tracking-wider">Your requirements</p>
              <p className="soft mt-1 text-sm whitespace-pre-wrap">{o.requirements}</p>
            </div>
          )}
          {o.referenceLinks?.length > 0 && (
            <div className="mt-3">
              <p className="muted text-xs uppercase tracking-wider">References</p>
              <ul className="mt-1 space-y-1">
                {o.referenceLinks.map((l: string) => (
                  <li key={l}><a href={l} target="_blank" rel="noreferrer" className="text-sm underline decoration-dotted" style={{ color: "var(--accent)" }}>{l} <ExternalLink size={11} className="inline" /></a></li>
                ))}
              </ul>
            </div>
          )}
          {cancellable && (
            <button onClick={() => onCancel(o._id)} className="btn-k9 btn-quiet mt-5 text-xs" style={{ color: "#f87171" }}>
              <XCircle size={13} /> Cancel order
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function OrderRow({ o }: { o: any }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border p-3.5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{o.number} · {o.itemName}</p>
        <p className="muted text-xs">{o.tierName ?? o.category}</p>
      </div>
      <span className={`status-chip status-${o.status}`}>{o.status.replace(/_/g, " ")}</span>
    </li>
  );
}

function DownloadsTab({ orders }: { orders: any[] }) {
  const products = orders.filter((o) => o.catalogKind === "product" && o.status !== "cancelled");
  if (!products.length) {
    return <Empty text="Purchased products appear here with their download links." cta={{ label: "Browse products", to: "/products" }} />;
  }
  return (
    <div className="space-y-3">
      {products.map((o) => (
        <div key={o._id} className="panel flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
          <div>
            <p className="font-display font-bold">{o.itemName}</p>
            <p className="muted text-sm">{o.number} · {new Date(o._creationTime).toLocaleDateString()}</p>
          </div>
          {o.status === "paid" || o.status === "completed" ? (
            <button
              className="btn-k9 btn-primary"
              onClick={() => toast.info("Your file link is sent to your Telegram and email by the studio.")}
            >
              <Download size={15} /> Download
            </button>
          ) : (
            <Badge>awaiting payment</Badge>
          )}
        </div>
      ))}
    </div>
  );
}

function CreditTab({ credit, busyTopup }: { credit: any; busyTopup: number | null }) {
  void busyTopup;
  const tiers = [10, 25, 50, 100];
  const telegram = useTelegramLinkSafe();
  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="panel rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold">Transaction history</h2>
        {!credit?.transactions?.length ? (
          <p className="muted mt-3 text-sm">No transactions yet.</p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {credit.transactions.map((t: any) => (
              <li key={t._id} className="flex items-center justify-between gap-3 rounded-xl border p-3.5 text-sm" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <div>
                  <p className="font-semibold capitalize">{t.kind.replace(/_/g, " ")}</p>
                  <p className="muted text-xs">{t.note ?? t.paymentMethod ?? ""} · {new Date(t._creationTime).toLocaleString()}</p>
                </div>
                <span className="font-display font-bold" style={{ color: t.direction === "credit" ? "#4ade80" : "var(--text-1)" }}>
                  {t.direction === "credit" ? "+" : "−"}{formatUsd(t.amount)} ⭐
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="glass-2 rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold">Top up K9 Credit</h2>
        <p className="muted mt-2 text-sm">
          Choose an amount, then complete payment via KBZPay, WavePay, AYA, PayWell
          or USDT. The studio confirms and your balance updates.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {tiers.map((usd) => (
            <a
              key={usd}
              href={telegram}
              target="_blank"
              rel="noreferrer"
              className="card-k9 flex items-center justify-center p-4 font-display font-bold"
            >
              ${usd} <Star size={13} className="ml-1" />
            </a>
          ))}
        </div>
        <a href={telegram} target="_blank" rel="noreferrer" className="btn-k9 btn-primary mt-4 w-full">
          <Send size={15} /> Request a top-up
        </a>
        <p className="muted mt-3 text-xs">
          Payments are confirmed manually by the studio today; card & auto top-up arrive with the next release.
        </p>
      </div>
    </div>
  );
}

function ProfileTab({ profile, telegram, setTelegram, onSaveTg, onSignOut }: any) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="panel rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold">Profile</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <Row k="Name" v={profile?.name ?? "—"} />
          <Row k="Email" v={profile?.email ?? "—"} />
        </dl>
        <label className="mt-5 block">
          <span className="soft text-sm font-medium">Telegram username</span>
          <div className="mt-1.5 flex gap-2">
            <input className="input-k9" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username" />
            <button onClick={onSaveTg} className="btn-k9 btn-ghost">Save</button>
          </div>
        </label>
        <p className="muted mt-2 text-xs">Used for delivery updates and support on every order.</p>
      </div>
      <div className="panel rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold">Session</h2>
        <p className="muted mt-2 text-sm">Signed in with your K9 Studio account.</p>
        <button onClick={onSignOut} className="btn-k9 btn-ghost mt-5" style={{ color: "#f87171" }}>
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="muted">{k}</dt>
      <dd className="soft text-right">{v}</dd>
    </div>
  );
}

function Empty({ text, cta }: { text: string; cta?: { label: string; to: string } }) {
  return (
    <div className="panel rounded-2xl p-10 text-center">
      <p className="muted">{text}</p>
      {cta && <Link to={cta.to} className="btn-k9 btn-ghost mt-5">{cta.label}</Link>}
    </div>
  );
}

function useTelegramLinkSafe(): string {
  const settings = useQuery(api.catalogReads.getPublicSettings) ?? {};
  return typeof settings.supportTelegram === "string" ? settings.supportTelegram : "https://t.me/k9studio";
}
