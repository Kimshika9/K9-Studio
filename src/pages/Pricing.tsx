import { Link } from "react-router-dom";
import { PageHead, Reveal } from "../components/Reveal";
import { Badge } from "../components/Badge";
import { Star, ArrowRight, Wallet, Globe2, RefreshCcw } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatMmk } from "../lib/utils";

const PACKAGES = [
  {
    name: "Basic",
    desc: "The essential version of your idea — clean, fast, done.",
    mmk: "40,000",
    usd: "9.52",
    delta: "Base package",
  },
  {
    name: "Standard",
    desc: "More pages, more polish, more features — the sweet spot.",
    mmk: "50,000",
    usd: "11.90",
    delta: "+10,000 MMK over Basic",
  },
  {
    name: "Premium",
    desc: "Advanced UI, motion, priority handling and the full K9 treatment.",
    mmk: "60,000",
    usd: "14.29",
    delta: "+20,000 MMK over Basic",
  },
];

export default function Pricing() {
  const settings = useQuery(api.catalogReads.getPublicSettings) ?? {};
  const rate = typeof settings.mmkPerUsd === "number" ? settings.mmkPerUsd : 4200;

  return (
    <>
      <PageHead
        eyebrow="Pricing"
        title="Clear packages, honest currency"
        sub="Every service offers Basic, Standard and Premium. Prices are examples here — the live price on each service page is always the one that counts."
      />

      <section className="section-pad pt-12">
        <div className="shell">
          <div className="grid gap-5 lg:grid-cols-3">
            {PACKAGES.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.07}>
                <div className={`card-k9 h-full p-7 ${i === 1 ? "card-selected" : ""}`}>
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold">{p.name}</h2>
                    {i === 1 && <Badge accent>Most chosen</Badge>}
                  </div>
                  <p className="muted mt-2 text-sm leading-relaxed">{p.desc}</p>
                  <p className="font-display mt-6 text-4xl font-bold">
                    {p.mmk} <span className="text-base font-semibold" style={{ color: "var(--accent)" }}>MMK</span>
                  </p>
                  <p className="muted mt-1 text-sm">≈ {p.usd} USDT</p>
                  <p className="muted mt-3 text-xs uppercase tracking-wide">{p.delta}</p>
                  <Link to="/services" className={`btn-k9 mt-7 w-full ${i === 1 ? "btn-primary" : "btn-ghost"}`}>
                    Browse services <ArrowRight size={15} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            <Reveal>
              <div className="panel h-full rounded-2xl p-7">
                <Star size={20} style={{ color: "var(--accent)" }} />
                <h3 className="font-display mt-4 text-lg font-bold">K9 Credit first</h3>
                <p className="muted mt-2 text-sm leading-relaxed">
                  Credit is the fastest path: pick, pay, done — with a refundable
                  window while your order is pending.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="panel h-full rounded-2xl p-7">
                <Wallet size={20} style={{ color: "var(--accent)" }} />
                <h3 className="font-display mt-4 text-lg font-bold">Local payments</h3>
                <p className="muted mt-2 text-sm leading-relaxed">
                  KBZPay, WavePay, AYA and PayWell for MMK top-ups, handled by the
                  studio when you request an order or buy credit.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="panel h-full rounded-2xl p-7">
                <Globe2 size={20} style={{ color: "var(--accent)" }} />
                <h3 className="font-display mt-4 text-lg font-bold">International</h3>
                <p className="muted mt-2 text-sm leading-relaxed">
                  Crypto (USDT) and PayWell work worldwide. International visitors
                  see USDT as the primary currency.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="glass mt-16 rounded-3xl p-8 sm:p-10">
              <div className="flex items-center gap-3">
                <RefreshCcw size={18} style={{ color: "var(--accent)" }} />
                <h2 className="font-display text-xl font-bold">Currency, without the mystery</h2>
              </div>
              <p className="soft mt-4 max-w-3xl leading-relaxed">
                K9 stores prices in MMK and USDT. Today's configured conversion is{" "}
                <strong style={{ color: "var(--accent)" }}>{formatMmk(rate)} MMK = 1 USDT</strong>{" "}
                — managed in the studio's settings, not hardcoded. Both prices stay
                visible everywhere, with your local currency taking the lead.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/account?tab=credit" className="btn-k9 btn-primary">
                  <Star size={15} /> Get K9 Credit
                </Link>
                <Link to="/support" className="btn-k9 btn-ghost">
                  Ask about payments
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
