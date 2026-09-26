import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Send, Loader2, MessagesSquare, Package, CreditCard, Bug } from "lucide-react";
import { api } from "@convex/_generated/api";
import { PageHead, Reveal } from "../components/Reveal";
import { TelegramCTA, useTelegramLink } from "../components/TelegramCTA";

const TOPICS = ["General question", "Project discussion", "Order issue", "Payments & K9 Credit"];

export default function Support() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const telegram = useTelegramLink();
  const submit = useMutation(api.public.submitSupportMessage);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await submit({ name, contact, topic, message });
      toast.success("Message sent — we'll reply on your contact channel.");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        eyebrow="Support"
        title="Talk to a human, fast"
        sub="Telegram is the fastest way to reach the studio. Prefer writing here? Your message lands in the same place."
      />

      <section className="section-pad pt-12">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div className="space-y-4">
              <a href={telegram} target="_blank" rel="noreferrer" className="card-k9 block p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }}>
                    <Send size={18} />
                  </span>
                  <div>
                    <h2 className="font-display font-bold">Telegram — primary</h2>
                    <p className="muted text-sm">Ask a question, discuss a project, resolve an order issue.</p>
                  </div>
                </div>
              </a>
              {[
                { icon: MessagesSquare, t: "Ask a question", d: "Anything about services, products, pricing or process." },
                { icon: Package, t: "Order help", d: "Status questions, revisions, delivery — have your order number ready." },
                { icon: CreditCard, t: "Payments & K9 Credit", d: "Top-ups, refunds while pending, and manual payment arrangements." },
                { icon: Bug, t: "Something broken", d: "Tell us what happened and where — we fix fast." },
              ].map((x) => (
                <div key={x.t} className="panel flex items-start gap-3 rounded-2xl p-5">
                  <x.icon size={17} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
                  <div>
                    <h3 className="font-semibold">{x.t}</h3>
                    <p className="muted mt-1 text-sm">{x.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <form onSubmit={go} className="glass rounded-3xl p-7 sm:p-8">
              <h2 className="font-display text-xl font-bold">Send a message</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="soft text-sm font-medium">Your name</span>
                  <input required className="input-k9 mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </label>
                <label className="block">
                  <span className="soft text-sm font-medium">Contact (Telegram or email)</span>
                  <input required className="input-k9 mt-1.5" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="@username or you@mail.com" />
                </label>
              </div>
              <label className="mt-4 block">
                <span className="soft text-sm font-medium">Topic</span>
                <select className="input-k9 mt-1.5" value={topic} onChange={(e) => setTopic(e.target.value)}>
                  {TOPICS.map((t) => (
                    <option key={t} value={t} style={{ color: "#111" }}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="mt-4 block">
                <span className="soft text-sm font-medium">Message</span>
                <textarea required className="input-k9 mt-1.5 min-h-32" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" />
              </label>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button type="submit" disabled={busy} className="btn-k9 btn-primary">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send message
                </button>
                <TelegramCTA label="Or message on Telegram" className="btn-k9 btn-ghost" />
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
