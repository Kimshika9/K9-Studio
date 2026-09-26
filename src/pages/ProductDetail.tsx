import { Link, useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { ArrowLeft, Download, ListChecks, Clock } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { PurchasePanel } from "../components/PurchasePanel";
import { Reveal } from "../components/Reveal";
import { Badge } from "../components/Badge";
import NotFound from "./NotFound";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const item = useQuery(api.catalogReads.getCatalogItem, {
    kind: "product",
    slug: slug ?? "",
  });

  if (item === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--accent)]" />
      </div>
    );
  }
  if (item === null) return <NotFound />;

  return (
    <section className="section-pad pb-10 pt-14">
      <div className="shell">
        <Link to="/products" className="muted inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--text-1)]">
          <ArrowLeft size={15} /> All products
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <Reveal>
              <p className="eyebrow">{item.category}</p>
              <h1 className="font-display mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                {item.name}
              </h1>
              <p className="soft mt-4 text-lg leading-relaxed">{item.description}</p>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="panel mt-8 rounded-2xl p-7">
                <h2 className="font-display text-xl font-bold">Who it's for</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(item.audience ?? []).map((a) => (
                    <Badge key={a}>{a}</Badge>
                  ))}
                </div>
                <h2 className="font-display mt-8 text-xl font-bold">What you receive</h2>
                <ul className="mt-4 space-y-2.5">
                  {(item.included ?? []).map((inc) => (
                    <li key={inc} className="flex items-start gap-2.5 text-sm soft">
                      <ListChecks size={15} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
                      {inc}
                    </li>
                  ))}
                </ul>
                <p className="muted mt-5 flex items-center gap-2 text-sm">
                  <Clock size={15} /> {item.deliveryNote ?? "Instant download after purchase."}
                </p>
              </div>
            </Reveal>

            {item.longDescription && (
              <Reveal delay={0.12}>
                <div className="mt-10 max-w-2xl">
                  <h2 className="font-display text-2xl font-bold">Why these work</h2>
                  <p className="soft mt-4 leading-relaxed">{item.longDescription}</p>
                </div>
              </Reveal>
            )}

            {item.downloadable && item.downloadable.length > 0 && (
              <Reveal delay={0.16}>
                <div className="mt-10">
                  <h2 className="font-display text-2xl font-bold">Files</h2>
                  <ul className="mt-4 space-y-2">
                    {item.downloadable.map((f) => (
                      <li key={f.title} className="card-k9 flex items-center gap-3 p-4 text-sm">
                        <Download size={16} style={{ color: "var(--accent)" }} />
                        <span className="soft">{f.title}</span>
                        <Badge className="ml-auto uppercase">{f.kind}</Badge>
                      </li>
                    ))}
                  </ul>
                  <p className="muted mt-3 text-xs">
                    Downloads unlock in your account the moment payment is confirmed.
                  </p>
                </div>
              </Reveal>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <PurchasePanel item={item} priceUsd={item.basePriceUsd} priceMmk={item.basePriceMmk} />
          </div>
        </div>
      </div>
    </section>
  );
}
