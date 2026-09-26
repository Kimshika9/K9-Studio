import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Loader2, Send, Lightbulb } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { Reveal } from "../components/Reveal";
import { useTelegramLink } from "../components/TelegramCTA";

const HEADINGS = ["Describe Your Idea", "What Do You Want Us To Build?"];

const EXAMPLES = [
  "I want a website for my clothing business.",
  "I need a Discord bot for my gaming community.",
  "Build me a portfolio with a 3D animation.",
  "I need a Next.js dashboard connected to Supabase.",
];

/**
 * Custom project intake (spec §13). The heading alternates between the two
 * brand phrases with a calm crossfade; the form starts simple and only
 * reveals advanced detail on request.
 */
export default function CustomProject() {
  const [idx, setIdx] = useState(0);
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [references, setReferences] = useState("");
  const [contactTelegram, setContactTelegram] = useState("");
  const [contactPref, setContactPref] = useState("telegram");
  const [advanced, setAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const { isAuthenticated } = useConvexAuth();
  const telegram = useTelegramLink();
  const submit = useMutation(api.public.submitProjectRequest);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % HEADINGS.length), 5200);
    return () => clearInterval(t);
  }, []);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await submit({
        description,
        budget,
        deadline,
        references,
        contactTelegram,
        contactPref,
        source: "custom_page",
      });
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section-pad pt-28">
      <div className="shell max-w-3xl">
        <Reveal>
          <p className="eyebrow">Custom projects</p>
          <div className="relative mt-3 h-[7.5rem] sm:h-[6rem]">
            <AnimatePresence mode="wait">
              <motion.h1
                key={idx}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                {HEADINGS[idx]}
              </motion.h1>
            </AnimatePresence>
          </div>
          <p className="soft mt-2 text-lg leading-relaxed">
            Plain language is perfect. Tell us the outcome you want — we'll reply
            with a scope, a price and a timeline.
          </p>
        </Reveal>

        {done ? (
          <Reveal>
            <div className="glass mt-10 rounded-3xl p-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)", color: "var(--accent)" }}>
                <Lightbulb size={24} />
              </span>
              <h2 className="font-display mt-5 text-2xl font-bold">Request received</h2>
              <p className="soft mx-auto mt-3 max-w-md leading-relaxed">
                The studio has been notified instantly. Expect a reply via{" "}
                {contactPref === "telegram" ? "Telegram" : "your contact channel"} — usually within a day.
              </p>
              <a href={telegram} target="_blank" rel="noreferrer" className="btn-k9 btn-primary mt-7">
                <Send size={15} /> Continue on Telegram
              </a>
            </div>
          </Reveal>
        ) : (
          <form onSubmit={go} className="glass mt-10 rounded-3xl p-7 sm:p-9">
            <label className="block">
              <span className="soft text-sm font-medium">Your idea <span className="muted">(this is the only required field)</span></span>
              <textarea
                required
                minLength={10}
                className="input-k9 mt-2 min-h-36 text-base"
                placeholder="I want a website for my clothing business where customers can browse the catalog and message me to order…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setDescription((d) => (d ? d : ex))}
                  className="badge-k9 transition-colors hover:border-[color-mix(in_srgb,var(--accent)_50%,transparent)] hover:text-[var(--text-1)]"
                >
                  {ex}
                </button>
              ))}
            </div>

            {!advanced ? (
              <button type="button" onClick={() => setAdvanced(true)} className="btn-k9 btn-quiet mt-5 text-sm">
                Add budget, deadline & references (optional)
              </button>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="soft text-sm font-medium">Budget <span className="muted">(MMK or USDT)</span></span>
                  <input className="input-k9 mt-1.5" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. around 150,000 MMK" />
                </label>
                <label className="block">
                  <span className="soft text-sm font-medium">Deadline</span>
                  <input className="input-k9 mt-1.5" value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="e.g. before Thingyan" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="soft text-sm font-medium">References <span className="muted">(links or descriptions)</span></span>
                  <textarea className="input-k9 mt-1.5 min-h-20" value={references} onChange={(e) => setReferences(e.target.value)} placeholder="Sites you like, screenshots, anything…" />
                </label>
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="soft text-sm font-medium">Your Telegram <span className="muted">(for the reply)</span></span>
                <input className="input-k9 mt-1.5" value={contactTelegram} onChange={(e) => setContactTelegram(e.target.value)} placeholder="@username" />
              </label>
              <label className="block">
                <span className="soft text-sm font-medium">Preferred contact</span>
                <select className="input-k9 mt-1.5" value={contactPref} onChange={(e) => setContactPref(e.target.value)}>
                  <option value="telegram" style={{ color: "#111" }}>Telegram</option>
                  <option value="email" style={{ color: "#111" }}>Email (if signed in)</option>
                </select>
              </label>
            </div>

            {!isAuthenticated && (
              <p className="muted mt-4 text-xs">
                Tip: sign in first and this request attaches to your account automatically.
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-k9 btn-primary mt-7 w-full text-base">
              {busy ? <Loader2 size={17} className="animate-spin" /> : <Send size={16} />}
              Send project request
            </button>
            <p className="muted mt-3 text-center text-xs">
              No payment happens here. We scope first, quote, and you decide.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
