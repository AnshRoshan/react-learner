import { useEffect, useRef, type ReactNode } from "react";

export function LabLabel({ n, title, sub }: { n?: number; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      {n !== undefined && (
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-onbrand">
          {n}
        </span>
      )}
      <div>
        <p className="text-sm font-semibold leading-tight text-ink">{title}</p>
        {sub && <p className="text-xs text-ink3">{sub}</p>}
      </div>
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-bg/40 p-4 ${className}`}>{children}</div>;
}

/**
 * Counts how many times the calling component function has run.
 * (Demo only: mutating a ref while rendering is impure — never do this in real code.)
 */
export function useRenderCount() {
  const ref = useRef(0);
  ref.current += 1;
  return ref.current;
}

/** Flashes the returned element every time its component commits a new render. */
export function useFlash<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.animate !== "function") return;
    el.animate(
      [
        { boxShadow: "0 0 0 2px var(--brand), 0 0 22px var(--brand)" },
        { boxShadow: "0 0 0 0 transparent, 0 0 0 0 transparent" },
      ],
      { duration: 850, easing: "ease-out" },
    );
  });
  return ref;
}
