import { Link } from "react-router-dom";
import { PageHead, Reveal } from "../components/Reveal";
import { K9Mark } from "../brand/K9Mark";
import { ArrowRight } from "lucide-react";

const PRINCIPLES = [
  {
    title: "Outcome first",
    text: "You describe the result you want. We figure out the technical solution — that's the whole deal.",
  },
  {
    title: "Everyone welcome",
    text: "Sellers, students, gamers, founders, communities, creators. No jargon walls, no minimum project size, no condescension.",
  },
  {
    title: "Craft over noise",
    text: "Motion with purpose, glass with hierarchy, violet with restraint. If an effect doesn't help you understand or decide, it goes.",
  },
  {
    title: "Small studio, real systems",
    text: "K9 runs on its own platform: a real catalog, a real ledger, real order tracking. The same care we put into your project.",
  },
];

export default function About() {
  return (
    <>
      <PageHead
        eyebrow="About"
        title="A small studio with its own universe"
        sub="K = Kim. 9 = a favorite number, and a night-sky worth building around. K9 Studio is an independent digital studio building websites, bots, AI solutions, products and custom projects for everyone."
      />

      <section className="section-pad pt-12">
        <div className="shell grid items-start gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div className="glass-2 flex flex-col items-center rounded-3xl p-10 text-center">
              <K9Mark size={110} glowing />
              <p className="font-display mt-6 text-xl font-bold tracking-[0.3em]">K9 STUDIO</p>
              <p className="muted mt-2 text-sm tracking-[0.18em]">WE BUILD YOUR DIGITAL WORLD</p>
              <div className="hr-cosmic my-7 w-full" />
              <p className="soft text-sm leading-relaxed">
                Not a corporate agency. Not a freelancer listing page. A creative
                digital studio with its own technology culture — reachable on
                Telegram, and serious about craft.
              </p>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <h2 className="font-display text-2xl font-bold">How we work</h2>
              <div className="mt-6 space-y-4">
                {PRINCIPLES.map((p) => (
                  <div key={p.title} className="card-k9 p-6">
                    <h3 className="font-display font-bold">{p.title}</h3>
                    <p className="muted mt-2 text-sm leading-relaxed">{p.text}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-10">
                <h2 className="font-display text-2xl font-bold">What we build</h2>
                <p className="soft mt-3 leading-relaxed">
                  Websites and web applications. Telegram and Discord bots. AI
                  assistants with custom roles and knowledge. Prompt packs, AI role
                  systems and reusable code as instant products. And the strange,
                  wonderful custom projects that don't fit a category.
                </p>
                <Link to="/custom" className="btn-k9 btn-primary mt-6">
                  Start a Project <ArrowRight size={15} />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
