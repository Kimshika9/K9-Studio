import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Admin area protection: requires sign-in AND membership in K9_ADMIN_EMAILS
 * (checked server-side — the client merely reacts to the verdict).
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const location = useLocation();
  const isAdmin = useQuery(api.admin.adminCheck, isAuthenticated ? {} : "skip");

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--accent)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (isAdmin === false) {
    return (
      <div className="shell section-pad">
        <div className="panel mx-auto max-w-md rounded-2xl p-8 text-center">
          <h1 className="font-display text-2xl font-bold">Admin area</h1>
          <p className="muted mt-3 text-sm">
            This account doesn't have admin access. Sign in with the studio account and try again.
          </p>
        </div>
      </div>
    );
  }
  if (isAdmin !== true) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--accent)]" />
      </div>
    );
  }
  return <>{children}</>;
}
