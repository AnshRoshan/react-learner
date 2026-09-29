import { Fragment, type CSSProperties, type ReactNode } from "react";
import { Info, Lightbulb, Sparkles, TriangleAlert } from "lucide-react";
import type { Block } from "../data/types";
import { CodeBlock } from "../lib/highlight";

/** Tiny inline markup: `code` and **bold**. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.length > 1 && p.startsWith("`") && p.endsWith("`") ? (
          <code
            key={i}
            className="rounded-md border border-line bg-surface2 px-1.5 py-0.5 text-[0.84em] font-medium text-brand"
          >
            {p.slice(1, -1)}
          </code>
        ) : p.length > 4 && p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

const TONES = {
  tip: { icon: Lightbulb, color: "var(--ok)" },
  warn: { icon: TriangleAlert, color: "var(--warn)" },
  info: { icon: Info, color: "var(--brand)" },
  key: { icon: Sparkles, color: "var(--brand-2)" },
} as const;

export function Callout({ tone, title, text }: { tone: keyof typeof TONES; title: string; text: string }) {
  const { icon: Icon, color } = TONES[tone];
  return (
    <div className="callout flex gap-3.5 p-4 sm:p-5" style={{ "--tone": color } as CSSProperties}>
      <span
        className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl"
        style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
      >
        <Icon size={17} />
      </span>
      <div className="min-w-0">
        <p className="font-display text-[15px] font-semibold text-ink">{title}</p>
        <p className="mt-1 text-[14.5px] leading-relaxed text-ink2">
          <Inline text={text} />
        </p>
      </div>
    </div>
  );
}

export function Prose({ blocks, lab }: { blocks: Block[]; lab?: ReactNode }) {
  return (
    <div className="space-y-5 text-[15.5px] leading-7 text-ink2">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "p":
            return (
              <p key={i}>
                <Inline text={b.text} />
              </p>
            );
          case "h":
            return (
              <h3 key={i} className="pt-4 font-display text-xl font-semibold text-ink">
                {b.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-2.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span>
                      <Inline text={it} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-3">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3.5">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/15 font-mono text-xs font-bold text-brand">
                      {j + 1}
                    </span>
                    <span>
                      <Inline text={it} />
                    </span>
                  </li>
                ))}
              </ol>
            );
          case "code":
            return <CodeBlock key={i} code={b.code} file={b.file} />;
          case "callout":
            return <Callout key={i} tone={b.tone} title={b.title} text={b.text} />;
          case "lab":
            return <Fragment key={i}>{lab}</Fragment>;
          default:
            return null;
        }
      })}
    </div>
  );
}
