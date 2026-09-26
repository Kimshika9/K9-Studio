interface MarkProps {
  size?: number;
  glowing?: boolean;
  className?: string;
}

/**
 * The K9 mark: a bold K whose arm reaches toward a ring — the "9" re-imagined
 * as a small body in orbit, with faint stars around it.
 */
export function K9Mark({ size = 40, glowing = false, className }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="K9 Studio"
      style={glowing ? { filter: "drop-shadow(0 0 18px rgba(139,92,246,0.55))" } : undefined}
    >
      <path
        d="M20 15v34M20 32l13.5-17M20 32l14.5 17"
        stroke="url(#k9g)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="45" cy="32" r="7.5" stroke="url(#k9g)" strokeWidth="5" />
      <circle cx="45" cy="32" r="2.2" fill="#c4b5fd" />
      <circle cx="52.5" cy="18.5" r="1.6" fill="#8b7cf6" opacity="0.9" />
      <circle cx="14" cy="44" r="1.4" fill="#a78bfa" opacity="0.8" />
      <circle cx="55" cy="45.5" r="1.2" fill="#c4b5fd" opacity="0.7" />
      <defs>
        <linearGradient id="k9g" x1="14" y1="14" x2="54" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Full wordmark for nav / footer. */
export function K9Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <K9Mark size={30} />
      <span
        className="font-display font-bold tracking-[0.18em]"
        style={{ fontSize: compact ? "0.95rem" : "1.05rem" }}
      >
        K9 STUDIO
      </span>
    </span>
  );
}
