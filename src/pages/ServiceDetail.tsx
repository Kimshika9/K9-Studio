import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { ArrowLeft, Clock, FileText, ListChecks, Users } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { TierSwitcher, TierFeatures, type Tier } from "../components/TierSwitcher";
import { PurchasePanel } from "../components/PurchasePanel";
import { Reveal } from "../components/Reveal";
import { Badge } from "../components/Badge";
import { formatMmk } from "../lib/utils";
import NotFound from "./NotFound";

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const item = useQuery(api.catalogReads.getCatalogItem, {
    kind: "service",
    slug: slug ?? "",
  });

  const tiers = (item?.tiers ?? []) as unknown as Tier[];
  const defaultIdx = useMemo(() => {
    const i = tiers.findIndex((t) => t.defaults);
    return i === -1 ? 0 : i;
  }, [tiers]);
  const [active, setActive] = useState<number | null>(null);
  const current = tiers[active ?? defaultIdx] ?? tiers[0];

  if (item === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--accent)]" />
      </div>
    );
  }
  if (item === null) return <NotFound />;

  const priceUsd = item.basePriceUsd + (current?.priceDelta ?? 0);
  const priceMmk = item.basePriceMmk + (current?.priceDeltaMmk ?? 0);

  return (
    <>
      <section className="section-pad pb-10 pt-14">
        <div className="shell">
          <Link to="/services" className="muted inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--text-1)]">
            <ArrowLeft size={15} /> All services
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
            {/* Left: value first (spec §11) */}
            <div>
              <Reveal>
                <p className="eyebrow">{item.category}</p>
                <h1 className="font-display mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                  {item.name}
                </h1>
                <p className="soft mt-4 text-lg leading-relaxed">{item.description}</p>
              </Reveal>

              <Reveal delay={0.08}>
                <ul className="mt-8 grid gap-3 sm:grid-cols-3">
                  {item.highlights.map((h) => (
                    <li key={h} className="card-k9 p-4 text-sm soft">{h}</li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="panel mt-10 rounded-2xl p-7">
                  <h2 className="font-display text-xl font-bold">Who this is for</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(item.audience ?? ["Anyone with an idea"]).map((a) => (
                      <Badge key={a}>{a}</Badge>
                    ))}
                  </div>
                  <h2 className="font-display mt-8 text-xl font-bold">What's included</h2>
                  <ul className="mt-4 space-y-2.5">
                    {(item.included ?? []).map((inc) => (
                      <li key={inc} className="flex items-start gap-2.5 text-sm soft">
                        <ListChecks size={15} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
                        {inc}
                      </li>
                    ))}
                  </ul>
                  {item.deliveryNote && (
                    <p className="muted mt-5 flex items-start gap-2 text-sm">
                      <Clock size={15} className="mt-0.5 shrink-0" /> {item.deliveryNote}
                    </p>
                  )}
                </div>
              </Reveal>

              <Reveal delay={0.16}>
                <div className="mt-10">
                  <h2 className="font-display text-2xl font-bold">What we need from you</h2>
                  <ul className="mt-4 space-y-2.5">
                    {(item.requirements ?? []).map((r) => (
                      <li key={r} className="flex items-start gap-2.5 text-sm soft">
                        <FileText size={15} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              {item.longDescription && (
                <Reveal delay={0.2}>
                  <div className="mt-10 max-w-2xl">
                    <h2 className="font-display text-2xl font-bold">The details</h2>
                    <p className="soft mt-4 leading-relaxed">{item.longDescription}</p>
                  </div>
                </Reveal>
              )}

              {item.faq && item.faq.length > 0 && (
                <Reveal delay={0.24}>
                  <div className="mt-10">
                    <h2 className="font-display text-2xl font-bold">FAQ</h2>
                    <div className="mt-4 space-y-3">
                      {item.faq.map((f) => (
                        <details key={f.q} className="card-k9 group p-5">
                          <summary className="cursor-pointer list-none font-semibold">
                            <span className="mr-2" style={{ color: "var(--accent)" }}>＋</span>
                            {f.q}
                          </summary>
                          <p className="muted mt-3 text-sm leading-relaxed">{f.a}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}
            </div>

            {/* Right: sticky purchase panel */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              {item.pricingModel === "tiered" && current ? (
                <div className="glass rounded-2xl p-6">
                  <h2 className="font-display text-lg font-bold">Choose your package</h2>
                  <div className="mt-4">
                    <TierSwitcher tiers={tiers} active={active ?? defaultIdx} onChange={setActive} />
                  </div>
                  <div className="mt-5 rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                    <p className="font-display font-bold" style={{ color: "var(--accent)" }}>{current.name}</p>
                    <p className="muted mt-1 text-sm">{current.description}</p>
                    <p className="muted mt-2 flex items-center gap-1.5 text-xs">
                      <Clock size={12} /> Delivery ~{current.deliveryDays} days
                    </p>
                    <div className="mt-4">
                      <TierFeatures tier={current} compact />
                    </div>
                  </div>
                  <div className="mt-5">
                    <PurchasePanel item={item} tierKey={current.tier} priceUsd={priceUsd} priceMmk={priceMmk} />
                  </div>
                </div>
              ) : (
                <PurchasePanel item={item} priceUsd={item.basePriceUsd} priceMmk={item.basePriceMmk} />
              )}
              <p className="muted mt-3 text-center text-xs">
                Starting at {formatMmk(item.basePriceMmk)} MMK · {item.basePriceUsd} USDT
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
