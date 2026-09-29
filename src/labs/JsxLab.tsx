import { createElement, isValidElement, useState, type ReactElement } from "react";
import { CodeBlock } from "../lib/highlight";
import { LabLabel } from "./shared";

function Badge({ label, tone }: { label: string; tone: string }) {
  const color = tone === "pink" ? "var(--brand-3)" : "var(--brand)";
  return (
    <span
      className="inline-flex items-center rounded-full px-3.5 py-1 text-sm font-semibold"
      style={{ background: `color-mix(in oklab, ${color} 20%, transparent)`, color }}
    >
      {label}
    </span>
  );
}
Badge.displayName = "Badge";

type PresetId = "element" | "nested" | "component";

interface Preset {
  id: PresetId;
  label: string;
  flag: string;
  jsx: (text: string, flag: boolean) => string;
  compiled: (text: string, flag: boolean) => string;
  build: (text: string, flag: boolean) => ReactElement;
}

const NOTE = "Nested elements become nested objects";

const PRESETS: Preset[] = [
  {
    id: "element",
    label: "A DOM element",
    flag: "disabled",
    jsx: (t, f) => `<button className="btn btn-primary" disabled={${f}}>\n  ${t}\n</button>`,
    compiled: (t, f) =>
      `jsx("button", {\n  className: "btn btn-primary",\n  disabled: ${f},\n  children: ${JSON.stringify(t)}\n})`,
    build: (t, f) => createElement("button", { className: "btn btn-primary", disabled: f }, t),
  },
  {
    id: "nested",
    label: "Nested elements",
    flag: "highlight",
    jsx: (t, f) =>
      `<div className=${f ? '"card p-4 ring-2 ring-brand"' : '"card p-4"'}>\n  <h3>${t}</h3>\n  <p>${NOTE}</p>\n</div>`,
    compiled: (t, f) =>
      `jsxs("div", {\n  className: ${f ? '"card p-4 ring-2 ring-brand"' : '"card p-4"'},\n  children: [\n    jsx("h3", { children: ${JSON.stringify(t)} }),\n    jsx("p", { children: ${JSON.stringify(NOTE)} })\n  ]\n})`,
    build: (t, f) =>
      createElement(
        "div",
        { className: f ? "card p-4 ring-2 ring-brand" : "card p-4" },
        createElement("h3", null, t),
        createElement("p", null, NOTE),
      ),
  },
  {
    id: "component",
    label: "A component",
    flag: "tone = pink",
    jsx: (t, f) => `<Badge label="${t}" tone="${f ? "pink" : "cyan"}" />`,
    compiled: (t, f) => `jsx(Badge, { label: ${JSON.stringify(t)}, tone: "${f ? "pink" : "cyan"}" })`,
    build: (t, f) => createElement(Badge, { label: t, tone: f ? "pink" : "cyan" }),
  },
];

/** Turn an element tree into plain data so we can print it (no fibers, no cycles). */
function plain(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(plain);
  if (isValidElement(node)) {
    const el = node as ReactElement<Record<string, unknown>> & { $$typeof: symbol };
    const { children, ...rest } = el.props;
    return {
      $$typeof: el.$$typeof,
      type: el.type,
      key: el.key,
      props: children === undefined ? rest : { ...rest, children: plain(children) },
    };
  }
  return node;
}

function dump(el: ReactElement): string {
  return JSON.stringify(
    plain(el),
    (_k, v) => {
      if (typeof v === "symbol") return String(v);
      if (typeof v === "function") {
        const fn = v as { displayName?: string; name: string };
        return `ƒ ${fn.displayName ?? fn.name}()`;
      }
      return v;
    },
    2,
  );
}

export default function JsxLab() {
  const [presetId, setPresetId] = useState<PresetId>("component");
  const [text, setText] = useState("Hello React");
  const [flag, setFlag] = useState(false);

  const preset = PRESETS.find((p) => p.id === presetId) as Preset;
  const element = preset.build(text, flag);

  return (
    <div className="grid gap-6 p-5 sm:p-7 xl:grid-cols-2">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPresetId(p.id)}
              className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                presetId === p.id
                  ? "border-brand bg-brand/15 text-brand"
                  : "border-line bg-surface text-ink2 hover:border-line2"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Text content"
            placeholder="Edit the text…"
          />
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-ink2">
            <input type="checkbox" checked={flag} onChange={(e) => setFlag(e.target.checked)} />
            <span className="font-mono">{preset.flag}</span>
          </label>
        </div>

        <LabLabel n={1} title="You write JSX" sub="looks like HTML, is really JavaScript" />
        <CodeBlock code={preset.jsx(text, flag)} lineNumbers={false} />

        <LabLabel n={2} title="The compiler outputs" sub="one function call per tag" />
        <CodeBlock code={preset.compiled(text, flag)} lineNumbers={false} />
      </div>

      <div className="min-w-0 space-y-4">
        <LabLabel n={3} title="React receives an element" sub="a plain object — printed from the real thing" />
        <CodeBlock code={dump(element)} lineNumbers={false} maxHeight={330} />
        {presetId === "component" && (
          <p className="rounded-xl border border-brand/30 bg-brand/10 p-3 text-[13px] leading-relaxed text-ink2">
            Notice <code className="font-mono text-brand">type</code> is your function itself. React hasn't called{" "}
            <code className="font-mono text-brand">Badge</code> yet — it will, later, during the render phase.
          </p>
        )}

        <LabLabel n={4} title="…which becomes real DOM" sub="the rendered result" />
        <div className="grid min-h-[110px] place-items-center rounded-2xl border border-line bg-bg/40 p-5">
          {element}
        </div>
      </div>
    </div>
  );
}
