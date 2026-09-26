import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Globe,
  Bot,
  Sparkles,
  Wand2,
  Star,
  Zap,
  Send,
  Package,
  Layers,
  ShieldCheck,
  MessagesSquare,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { CosmicCanvas } from "../components/CosmicCanvas";
import { CatalogCard } from "../components/CatalogCard";
import { Reveal } from "../components/Reveal";
import { Badge } from "../components/Badge";
import { K9Mark } from "../brand/K9Mark";

const JOURNEY = [
  { icon: Layers, title: "Discover", text: "Browse services and products with real prices — no “contact us for a quote”." },
  { icon: MessagesSquare, title: "Describe", text: "Explain what you want in plain language. Technical detail is optional, never required." },
  { icon: Zap, title: "Purchase", text: "Pay instantly with K9 Credit, or request the order and pay manually." },
  { icon: ShieldCheck, title: "Track", text: "Every order has a status, a timeline and a direct line to the studio on Telegram." },
];

export default function Home() {
  const services = useQuery(api.catalogReads.listCatalog, { kind: "service", includeHidden: false }) ?? [];
  const products = useQuery(api.catalogReads.listCatalog, { kind: "product", includeHidden: false }) ?? [];

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: "92vh" }}>
        <CosmicCanvas />
        <div className="absolute inset-0 bg-veil" aria-hidden="true" />
        {/* orbiting accent rings */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-1/4 h-[34rem] w-[34rem] rounded-full border opacity-30"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        >
          <span
            className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "var(--accent)", boxShadow: "0 0 16px var(--glow)" }}
          />
        </motion.div>

        <div className="shell relative z-10 flex min-h-[92vh] flex-col justify-center py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <Badge accent className="mb-6">
              <Star size={11} /> Independent digital studio
            </Badge>
            <h1 className="font-display text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              We Build Your
              <br />
              <span className="gradient-text text-glow">Digital World</span>
            </h1>
            <p className="soft mt-6 max-w-xl text-lg leading-relaxed">
              K9 Studio builds websites, bots, AI solutions, digital products and
              custom projects. You describe the outcome — we figure out the
              technical solution.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/custom" className="btn-k9 btn-primary text-base">
                Start a Project <ArrowRight size={17} />
              </Link>
              <Link to="/services" className="btn-k9 btn-ghost text-base">
                Explore Services
              </Link>
            </div>
            <p className="muted mt-6 flex items-center gap-2 text-sm">
              <K9Mark size={16} /> From {pricesFrom(services)} — instant purchase with K9 Credit.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <section className="section-pad" id="services">
        <div className="shell">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">What we build</p>
                <h2 className="font-display mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
                  Services, first and foremost
                </h2>
              </div>
              <Link to="/services" className="btn-k9 btn-ghost">
                All services <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(services.length ? services : PLACEHOLDER_SERVICES).slice(0, 4).map((s: any, i: number) => (
              <CatalogCard key={s.slug} item={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── JOURNEY ──────────────────────────────────────────────────────── */}
      <section className="section-pad" style={{ background: "var(--bg-2)" }}>
        <div className="shell">
          <Reveal>
            <p className="eyebrow">How it works</p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              From idea to delivery, without the jargon
            </h2>
          </Reveal>
          <ol className="mt-12 grid gap-5 md:grid-cols-4">
            {JOURNEY.map((j, i) => (
              <Reveal key={j.title} delay={i * 0.08}>
                <li className="card-k9 h-full p-6">
                  <div className="flex items-center justify-between">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl border"
                      style={{
                        borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)",
                        background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                        color: "var(--accent)",
                      }}
                    >
                      <j.icon size={18} />
                    </span>
                    <span className="font-display muted text-2xl font-bold opacity-40">0{i + 1}</span>
                  </div>
                  <h3 className="font-display mt-4 font-bold">{j.title}</h3>
                  <p className="muted mt-2 text-sm leading-relaxed">{j.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── PRODUCTS ─────────────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="shell">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Digital products</p>
                <h2 className="font-display mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
                  Prompt packs, AI roles & code — instant delivery
                </h2>
              </div>
              <Link to="/products" className="btn-k9 btn-ghost">
                All products <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(products.length ? products : PLACEHOLDER_PRODUCTS).slice(0, 3).map((p: any, i: number) => (
              <CatalogCard key={p.slug} item={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CUSTOM PROJECT ───────────────────────────────────────────────── */}
      <section className="section-pad" style={{ background: "var(--bg-2)" }}>
        <div className="shell">
          <Reveal>
            <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-12">
              <div
                aria-hidden="true"
                className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
                style={{ background: "var(--glow)" }}
              />
              <div className="relative grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
                <div>
                  <p className="eyebrow">Custom projects</p>
                  <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    If you can describe it,
                    <br />
                    we can build it.
                  </h2>
                  <p className="soft mt-4 max-w-xl leading-relaxed">
                    Surprise projects, personalized experiences, unusual websites,
                    tools nobody has built yet. Plain language is enough — we reply
                    with a scope, a price and a timeline.
                  </p>
                </div>
                <div className="flex flex-col gap-3 lg:items-end">
                  <Link to="/custom" className="btn-k9 btn-primary text-base">
                    <Wand2 size={17} /> Describe your idea
                  </Link>
                  <Link to="/services/custom-projects" className="btn-k9 btn-quiet">
                    How custom projects work
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── K9 CREDIT ────────────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="shell grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">K9 Credit</p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              One balance for everything
            </h2>
            <p className="soft mt-4 leading-relaxed">
              K9 Credit is the studio's universal purchasing layer. Top up once,
              buy anything — services, products, custom projects — with instant
              checkout and a fully auditable transaction history.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Top up with KBZPay, WavePay, AYA, PayWell or crypto",
                "Every transaction recorded and refundable while pending",
                "Prices shown in MMK and USDT, always both",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm soft">
                  <Star size={15} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth?returnTo=%2Faccount%3Ftab%3Dcredit" className="btn-k9 btn-primary">
                <Star size={15} /> Get K9 Credit
              </Link>
              <Link to="/pricing" className="btn-k9 btn-ghost">
                See pricing
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="glass-2 rounded-3xl p-8">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Sample balance</p>
                <Badge>USDT · MMK</Badge>
              </div>
              <p className="font-display mt-4 text-5xl font-bold" style={{ color: "var(--accent)" }}>
                42.00 <Star size={22} className="inline -mt-2" />
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Top-up · KBZPay", amount: "+50.00", pos: true },
                  { label: "Website Development · Standard", amount: "−12.38", pos: false },
                  { label: "AI Role Library · download", amount: "−4.76", pos: false },
                ].map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm"
                    style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  >
                    <span className="soft">{r.label}</span>
                    <span className="font-semibold" style={{ color: r.pos ? "#4ade80" : "var(--text-1)" }}>
                      {r.amount} ⭐
                    </span>
                  </div>
                ))}
              </div>
              <p className="muted mt-5 text-xs">Illustration — your real ledger lives in your account.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CASE STUDY TEASER ────────────────────────────────────────────── */}
      <section className="section-pad" style={{ background: "var(--bg-2)" }}>
        <div className="shell">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Proof of work</p>
                <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Active projects, not just screenshots
                </h2>
              </div>
              <Link to="/projects" className="btn-k9 btn-ghost">
                Case studies <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <Link to="/projects/paywell" className="card-k9 mt-10 flex flex-wrap items-center justify-between gap-6 p-8">
              <div>
                <Badge accent>Case study</Badge>
                <h3 className="font-display mt-3 text-2xl font-bold">PayWell</h3>
                <p className="soft mt-2 max-w-xl text-sm leading-relaxed">
                  Payment orchestration for local wallets — one interface over
                  KBZPay, WavePay and AYA. In production and actively developed
                  with K9 Studio.
                </p>
              </div>
              <span className="btn-k9 btn-ghost">
                Read the case study <ArrowRight size={15} />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="shell">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border p-10 text-center sm:p-16" style={{ borderColor: "var(--border)" }}>
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    "radial-gradient(70% 90% at 50% 110%, var(--hero-veil-a) 0%, transparent 70%)",
                }}
              />
              <div className="relative">
                <Sparkles size={22} className="mx-auto" style={{ color: "var(--accent)" }} />
                <h2 className="font-display mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
                  I have an idea. K9 can build it.
                </h2>
                <p className="soft mx-auto mt-4 max-w-lg leading-relaxed">
                  Tell us what you want in your own words. We'll take it from there.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link to="/custom" className="btn-k9 btn-primary text-base">
                    Start a Project <ArrowRight size={17} />
                  </Link>
                  <a href="https://t.me/k9studio" target="_blank" rel="noreferrer" className="btn-k9 btn-ghost text-base">
                    <Send size={16} /> Ask on Telegram
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

const PLACEHOLDER_SERVICES = [
  { kind: "service", slug: "website-development", category: "Website Development", name: "Website Development", tagline: "From a sharp landing page to a full web application.", basePriceUsd: 9.52, basePriceMmk: 40000, pricingModel: "tiered", featured: true, icon: "globe", status: "active", order: 1, highlights: [] },
  { kind: "service", slug: "bot-creation", category: "Bot Creation", name: "Bot Creation", tagline: "Telegram & Discord bots that do real work.", basePriceUsd: 7.14, basePriceMmk: 30000, pricingModel: "tiered", featured: true, icon: "bot", status: "active", order: 2, highlights: [] },
  { kind: "service", slug: "ai-bots", category: "AI Bots", name: "AI Bots", tagline: "AI assistants with your rules and knowledge.", basePriceUsd: 11.9, basePriceMmk: 50000, pricingModel: "tiered", featured: true, icon: "sparkles", status: "active", order: 3, highlights: [] },
  { kind: "service", slug: "custom-projects", category: "Custom Projects", name: "Custom Projects", tagline: "If you can describe it, we can scope it.", basePriceUsd: 23.81, basePriceMmk: 100000, pricingModel: "fixed", featured: true, icon: "wand", status: "active", order: 4, highlights: [] },
] as never[];

const PLACEHOLDER_PRODUCTS = [
  { kind: "product", slug: "cinematic-photo-prompts", category: "Prompts", name: "Cinematic Photo Prompt Pack", tagline: "40 context-rich prompts for photo-realistic AI images.", basePriceUsd: 2.38, basePriceMmk: 10000, pricingModel: "fixed", featured: true, icon: "camera", status: "active", order: 1, highlights: [] },
  { kind: "product", slug: "ai-role-library", category: "AI Role Prompts", name: "AI Role Library", tagline: "12 specialist roles that make AI dramatically better.", basePriceUsd: 4.76, basePriceMmk: 20000, pricingModel: "fixed", featured: true, icon: "brain", status: "active", order: 3, highlights: [] },
  { kind: "product", slug: "glass-ui-kit", category: "Code", name: "Glass UI Kit — CSS Components", tagline: "The glass component CSS used on this very website.", basePriceUsd: 3.57, basePriceMmk: 15000, pricingModel: "fixed", featured: false, icon: "code", status: "active", order: 4, highlights: [] },
] as never[];

function pricesFrom(services: any[]): string {
  const mmks = services.map((s) => s?.basePriceMmk).filter((n: unknown) => typeof n === "number");
  if (!mmks.length) return "40,000 MMK";
  return `${Math.min(...mmks).toLocaleString()} MMK`;
}
