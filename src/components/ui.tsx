import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import type { Level } from "../data/types";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Eyebrow({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold tracking-wide text-ink2 backdrop-blur">
      {icon}
      {children}
    </span>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-ink2 sm:text-lg">{subtitle}</p>}
    </div>
  );
}

const LEVEL_COLOR: Record<Level, string> = {
  Beginner: "var(--ok)",
  Intermediate: "var(--warn)",
  Advanced: "var(--bad)",
};

export function LevelBadge({ level }: { level: Level }) {
  const c = LEVEL_COLOR[level];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider"
      style={{
        color: c,
        borderColor: `color-mix(in oklab, ${c} 40%, transparent)`,
        background: `color-mix(in oklab, ${c} 12%, transparent)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {level}
    </span>
  );
}

export function ProgressRing({
  value,
  size = 40,
  stroke = 4,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-line2" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, value)))}
          className="stroke-brand transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center">{children}</div>}
    </div>
  );
}

/** A fake browser window that frames a live demo. */
export function DemoFrame({
  name,
  children,
  onReset,
  className = "",
}: {
  name: string;
  children: ReactNode;
  onReset?: () => void;
  className?: string;
}) {
  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="flex items-center gap-3 border-b border-line bg-surface2 px-4 py-2.5">
        <span className="hidden gap-1.5 sm:flex" aria-hidden="true">
          <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <div className="mx-auto flex min-w-0 max-w-md flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-bg/60 px-3 py-1 font-mono text-[11px] text-ink3">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ok" />
          <span className="truncate">localhost:5173/{name}</span>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="chip shrink-0 transition hover:text-ink"
            title="Remount the demo — changing a component's key resets all of its state"
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>
      <div className="dots relative">{children}</div>
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; icon?: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="tablist" className="glass inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl p-1.5">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
            value === t.id ? "bg-brand text-onbrand shadow-lg" : "text-ink2 hover:bg-surface2 hover:text-ink"
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}
