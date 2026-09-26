import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { CatalogCard } from "../components/CatalogCard";
import { PageHead, Reveal } from "../components/Reveal";

export default function Services() {
  const services = useQuery(api.catalogReads.listCatalog, { kind: "service", includeHidden: false }) ?? [];

  const categories = ["Website Development", "Bot Creation", "AI Bots", "Custom Projects"];
  const byCategory = categories
    .map((c) => ({ category: c, items: services.filter((s) => s.category === c) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <PageHead
        eyebrow="Services"
        title="What can K9 build for you?"
        sub="Websites, bots, AI assistants and fully custom projects. Pick a category — or describe your idea and we'll point you to the right service."
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
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="card-k9 h-64 animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="pb-24">
        <div className="shell">
          <Reveal>
            <div className="glass rounded-3xl p-8 text-center sm:p-12">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Not sure which service fits?
              </h2>
              <p className="soft mx-auto mt-3 max-w-lg">
                Describe your idea in plain language — we'll recommend the right
                service and package, then quote it.
              </p>
              <Link to="/custom" className="btn-k9 btn-primary mt-6">
                Describe your idea
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
