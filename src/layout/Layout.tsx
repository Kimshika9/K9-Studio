import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Sun, Moon, User2, Sparkles, ArrowUpRight } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTheme } from "../theme/ThemeProvider";
import { K9Wordmark } from "../brand/K9Mark";

const NAV = [
  { to: "/services", label: "Services" },
  { to: "/products", label: "Products" },
  { to: "/projects", label: "Projects" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/support", label: "Support" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const { isAuthenticated } = useConvexAuth();
  const balance = useQuery(api.credit.getBalance, isAuthenticated ? {} : "skip");
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-lg focus:bg-[var(--surface-solid)] focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <header
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "var(--nav-bg)" : "transparent",
          backdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
          borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        }}
      >
        <div className="shell flex h-16 items-center justify-between gap-4">
          <Link to="/" aria-label="K9 Studio home">
            <K9Wordmark compact />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive ? "soft font-semibold" : "muted hover:text-[var(--text-1)]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="btn-k9 btn-quiet h-10 w-10 !p-0"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {isAuthenticated ? (
              <Link to="/account" className="btn-k9 btn-ghost hidden sm:inline-flex">
                <User2 size={16} />
                {typeof balance === "number" ? `${balance.toFixed(2)} ⭐` : "Account"}
              </Link>
            ) : (
              <Link to="/auth" className="btn-k9 btn-ghost hidden sm:inline-flex">
                Sign in
              </Link>
            )}

            <Link to="/custom" className="btn-k9 btn-primary hidden sm:inline-flex">
              Start a Project
            </Link>

            <button
              className="btn-k9 btn-quiet h-10 w-10 !p-0 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="lg:hidden"
              style={{
                background: "var(--nav-bg)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid var(--border)",
              }}
              aria-label="Mobile"
            >
              <div className="shell flex flex-col gap-1 py-4">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2.5 text-[0.95rem] ${
                        isActive ? "bg-[var(--surface-2)] font-semibold soft" : "soft"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <div className="my-2 h-px" style={{ background: "var(--border)" }} />
                <Link to="/custom" className="btn-k9 btn-primary">
                  <Sparkles size={16} /> Start a Project
                </Link>
                <Link
                  to={isAuthenticated ? "/account" : "/auth"}
                  className="btn-k9 btn-ghost"
                >
                  <User2 size={16} />
                  {isAuthenticated ? "My Account" : "Sign in"}
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main id="main" className="flex-1 pt-16">
        {children}
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <K9Wordmark />
          <p className="muted mt-4 max-w-xs text-sm leading-relaxed">
            We build your digital world — websites, bots, AI solutions, digital
            products and custom projects, from one small studio with its own
            universe.
          </p>
          <a
            href="https://t.me/k9studio"
            target="_blank"
            rel="noreferrer"
            className="btn-k9 btn-ghost mt-6"
          >
            Telegram <ArrowUpRight size={15} />
          </a>
        </div>
        <FooterCol
          title="Studio"
          links={[
            { to: "/services", label: "Services" },
            { to: "/products", label: "Products" },
            { to: "/projects", label: "Projects" },
            { to: "/pricing", label: "Pricing" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { to: "/about", label: "About" },
            { to: "/support", label: "Support" },
            { to: "/custom", label: "Start a Project" },
            { to: "/account", label: "My Account" },
          ]}
        />
        <div>
          <p className="eyebrow">K9 Credit</p>
          <p className="muted mt-3 text-sm leading-relaxed">
            One balance for everything we build. Top up with KBZPay, WavePay,
            AYA, PayWell or crypto.
          </p>
        </div>
      </div>
      <div className="shell flex flex-col items-center justify-between gap-3 border-t py-6 text-xs sm:flex-row" style={{ borderColor: "var(--border)" }}>
        <p className="muted">© {new Date().getFullYear()} K9 Studio. We Build Your Digital World.</p>
        <p className="muted">K9 Credit ⭐ · MMK / USDT</p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-3 space-y-2.5">
        {links.map((l) => (
          <li key={l.to + l.label}>
            <Link to={l.to} className="muted text-sm transition-colors hover:text-[var(--text-1)]">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
