import { Link, useParams } from "react-router-dom";
import { PageHead, Reveal } from "../components/Reveal";
import { Badge } from "../components/Badge";
import { ArrowRight, CheckCircle2, Target, Puzzle, Rocket } from "lucide-react";
import { PROJECTS_SEED } from "@convex/seedData";

export default function Projects() {
  return (
    <>
      <PageHead
        eyebrow="Projects"
        title="Proof, in case-study form"
        sub="Real projects with their problem, goal and solution spelled out — no invented metrics, no stock testimonials."
      />
      <section className="section-pad pt-12">
        <div className="shell grid gap-5 md:grid-cols-2">
          {PROJECTS_SEED.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06}>
              <Link to={`/projects/${p.slug}`} className="card-k9 block p-7">
                <div className="flex items-center justify-between gap-4">
                  <Badge accent>{p.category}</Badge>
                  <span className="muted text-xs">{p.period}</span>
                </div>
                <h2 className="font-display mt-4 text-2xl font-bold">{p.name}</h2>
                <p className="soft mt-2 leading-relaxed">{p.summary}</p>
                <p className="muted mt-4 flex items-center gap-1.5 text-sm">
                  {p.role} <ArrowRight size={14} />
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const p = PROJECTS_SEED.find((x) => x.slug === slug);
  if (!p) {
    return (
      <section className="section-pad">
        <div className="shell">
          <h1 className="font-display text-3xl font-bold">Project not found</h1>
          <Link to="/projects" className="btn-k9 btn-ghost mt-6">← All projects</Link>
        </div>
      </section>
    );
  }
  return (
    <article className="section-pad pt-14">
      <div className="shell max-w-3xl">
        <Link to="/projects" className="muted text-sm hover:text-[var(--text-1)]">← All projects</Link>
        <p className="eyebrow mt-8">{p.category} · {p.period}</p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{p.name}</h1>
        <p className="soft mt-4 text-lg leading-relaxed">{p.summary}</p>

        <div className="mt-10 space-y-8">
          <Section icon={Puzzle} title="Overview" text={p.overview} />
          <Section icon={Target} title="The problem" text={p.problem} />
          <Section icon={Rocket} title="The goal" text={p.goal} />
          <Section icon={CheckCircle2} title="The solution" text={p.solution} />
        </div>

        <div className="panel mt-10 rounded-2xl p-7">
          <h2 className="font-display text-xl font-bold">Features</h2>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm soft">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
                {f}
              </li>
            ))}
          </ul>
          <h2 className="font-display mt-8 text-xl font-bold">Technologies</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.stack.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
          <p className="muted mt-6 flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full" style={{ background: "#4ade80", boxShadow: "0 0 10px rgba(74,222,128,0.5)" }} />
            Status: {p.status}
          </p>
        </div>
      </div>
    </article>
  );
}

function Section({ icon: Icon, title, text }: { icon: typeof Target; title: string; text: string }) {
  return (
    <div>
      <h2 className="font-display flex items-center gap-2.5 text-xl font-bold">
        <Icon size={18} style={{ color: "var(--accent)" }} /> {title}
      </h2>
      <p className="soft mt-3 leading-relaxed">{text}</p>
    </div>
  );
}
