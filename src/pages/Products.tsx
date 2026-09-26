import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { CatalogCard } from "../components/CatalogCard";
import { PageHead, Reveal } from "../components/Reveal";

export default function Products() {
  const products = useQuery(api.catalogReads.listCatalog, { kind: "product", includeHidden: false }) ?? [];
  const categories = ["Prompts", "AI Role Prompts", "Code"];
  const byCategory = categories
    .map((c) => ({ category: c, items: products.filter((p) => p.category === c) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <PageHead
        eyebrow="Digital products"
        title="Instant, affordable, context-rich"
        sub="Prompt packs, AI role systems and reusable code — the same quality bar we hold in client work. Buy with K9 Credit and download immediately."
      />
      <section className="section-pad pt-12">
        <div className="shell space-y-16">
          {byCategory.map((g) => (
            <div key={g.category}>
              <Reveal>
                <div className="flex items-center gap-4">
                  <h2 className="font-display text-2xl font-bold">{g.category}</h2>
                  <div className="hr-cosmic flex-1" />
                </div>
              </Reveal>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((item, i) => (
                  <CatalogCard key={item._id} item={item} index={i} />
                ))}
              </div>
            </div>
          ))}
          {!byCategory.length && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card-k9 h-64 animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
