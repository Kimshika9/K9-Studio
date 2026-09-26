import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@convex/_generated/api";
import { Moon, Sun, Loader2, Mail, Lock, User2 } from "lucide-react";
import { K9Mark } from "../brand/K9Mark";
import { useTheme } from "../theme/ThemeProvider";
import { Reveal } from "../components/Reveal";
import { toast } from "sonner";

/** Typed bridge to Convex Auth's signIn action (provided by ConvexAuthProvider). */
function useK9SignIn() {
  const { signIn } = useAuthActions();
  return signIn as unknown as (
    provider: string,
    args: Record<string, unknown>,
  ) => Promise<{ signingIn?: boolean; verificationCodeSent?: boolean; redirect?: string }>;
}

export default function Auth() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo") || "/account";
  const { theme, toggle } = useTheme();
  const signIn = useK9SignIn();

  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate(returnTo, { replace: true });
  }, [isAuthenticated, isLoading, navigate, returnTo]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (code !== null) {
        await signIn("password", { email, code, flow: "email-verification" });
        navigate(returnTo, { replace: true });
        return;
      }
      const result = await signIn("password", {
        email,
        password,
        flow: mode === "sign-up" ? "signUp" : "signIn",
        name: mode === "sign-up" ? name : undefined,
      });
      if (result?.verificationCodeSent) {
        setCode("");
        toast.info("Check your email for the 6-digit code.");
      } else {
        navigate(returnTo, { replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    try {
      await signIn("google", {});
      // redirect flow navigates away
    } catch {
      toast.error("Google sign-in is not configured yet. Use email for now.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden p-10 lg:flex" style={{ background: "var(--bg-2)" }}>
        <div className="absolute inset-0 bg-veil" aria-hidden="true" />
        <div className="relative"><K9Mark size={44} glowing /></div>
        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
            We Build Your
            <br />
            <span className="gradient-text text-glow">Digital World</span>
          </h1>
          <p className="soft mt-4 leading-relaxed">
            Your K9 account holds your credit balance, orders, downloads and
            project history — everything in one quiet place.
          </p>
        </div>
        <p className="muted relative text-xs">© {new Date().getFullYear()} K9 Studio</p>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-1 items-center justify-center p-6">
        <button
          onClick={toggle}
          className="btn-k9 btn-quiet absolute right-6 top-6 h-10 w-10 !p-0"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <Reveal className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><K9Mark size={34} /></div>

          <h2 className="font-display text-2xl font-bold">
            {code !== null ? "Enter the code" : mode === "sign-in" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="muted mt-2 text-sm">
            {code !== null
              ? `We sent a 6-digit code to ${email}.`
              : mode === "sign-in"
                ? "Sign in to your K9 Studio account."
                : "One account for orders, credit and downloads."}
          </p>

          <button onClick={google} disabled={busy} className="btn-k9 btn-ghost mt-7 w-full" type="button">
            <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="hr-cosmic flex-1" />
            <span className="muted text-xs uppercase tracking-widest">or email</span>
            <div className="hr-cosmic flex-1" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {code === null && mode === "sign-up" && (
              <label className="block">
                <span className="soft text-sm font-medium">Name</span>
                <div className="relative mt-1.5">
                  <User2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                  <input className="input-k9 !pl-10" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
                </div>
              </label>
            )}
            {code === null && (
              <>
                <label className="block">
                  <span className="soft text-sm font-medium">Email</span>
                  <div className="relative mt-1.5">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                    <input required type="email" className="input-k9 !pl-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                  </div>
                </label>
                <label className="block">
                  <span className="soft text-sm font-medium">Password</span>
                  <div className="relative mt-1.5">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                    <input required type="password" minLength={8} className="input-k9 !pl-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8+ characters" autoComplete={mode === "sign-up" ? "new-password" : "current-password"} />
                  </div>
                </label>
              </>
            )}
            {code !== null && (
              <label className="block">
                <span className="soft text-sm font-medium">6-digit code</span>
                <input required className="input-k9 mt-1.5 tracking-[0.4em]" value={code} onChange={(e) => setCode(e.target.value)} placeholder="••••••" inputMode="numeric" />
              </label>
            )}
            <button type="submit" disabled={busy} className="btn-k9 btn-primary w-full">
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              {code !== null ? "Verify code" : mode === "sign-up" ? "Create account" : "Sign in"}
            </button>
          </form>

          {code === null && (
            <p className="muted mt-6 text-center text-sm">
              {mode === "sign-in" ? "New to K9 Studio?" : "Already have an account?"}{" "}
              <button
                className="font-semibold"
                style={{ color: "var(--accent)" }}
                onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
              >
                {mode === "sign-in" ? "Create an account" : "Sign in"}
              </button>
            </p>
          )}
          <p className="muted mt-8 text-center text-xs">
            Telegram remains the fastest support channel. Google sign-in requires studio configuration.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
