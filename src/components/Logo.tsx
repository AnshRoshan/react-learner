export function AtomLogo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="-12 -12 24 24" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id="atom-grad" x1="-10" y1="-10" x2="10" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--brand)" }} />
          <stop offset="1" style={{ stopColor: "var(--brand-2)" }} />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#atom-grad)" strokeWidth="1.15">
        <ellipse rx="10.5" ry="4.1" />
        <ellipse rx="10.5" ry="4.1" transform="rotate(60)" />
        <ellipse rx="10.5" ry="4.1" transform="rotate(120)" />
      </g>
      <circle r="2.1" fill="url(#atom-grad)" />
    </svg>
  );
}
