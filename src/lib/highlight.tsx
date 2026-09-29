import { Fragment, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  A small regex tokenizer for JS / TS / JSX (no dependencies)        */
/* ------------------------------------------------------------------ */
type Tok = { c: string | null; t: string };

const RULES: [string, RegExp][] = [
  ["com", /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
  ["str", /`(?:\\[\s\S]|[^`\\])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/],
  ["tag", /(?<![\w$)\]])<\/?[A-Za-z][\w.]*/],
  ["hook", /\buse[A-Z]\w*/],
  [
    "kw",
    /\b(?:const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|typeof|instanceof|import|from|export|default|class|extends|async|await|try|catch|finally|throw|of|in|as|type|interface|null|undefined|true|false|void|this|satisfies)\b/,
  ],
  ["num", /\b\d[\d_]*(?:\.\d+)?\b/],
  ["attr", /\b[a-zA-Z][\w-]*(?==[{"'])/],
  ["fn", /\b[A-Za-z_$][\w$]*(?=\s*\()/],
  ["type", /\b[A-Z][A-Za-z0-9]*\b/],
];

const MASTER = new RegExp(RULES.map(([, r]) => `(${r.source})`).join("|"), "g");

function tokenize(code: string): Tok[] {
  const out: Tok[] = [];
  let last = 0;
  for (const m of code.matchAll(MASTER)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ c: null, t: code.slice(last, i) });
    let group = 1;
    while (group < m.length && m[group] === undefined) group++;
    out.push({ c: RULES[group - 1]?.[0] ?? null, t: m[0] });
    last = i + m[0].length;
  }
  if (last < code.length) out.push({ c: null, t: code.slice(last) });
  return out;
}

function toLines(toks: Tok[]): Tok[][] {
  const lines: Tok[][] = [[]];
  for (const tok of toks) {
    const parts = tok.t.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ c: tok.c, t: part });
    });
  }
  return lines;
}

/* ------------------------------------------------------------------ */
/*  Region helpers: `// @region name` … `// @endregion`                */
/* ------------------------------------------------------------------ */
const MARKER = /^\s*\/\/ @(?:end)?region\b/;

export function stripRegions(src: string): string {
  return src
    .split("\n")
    .filter((line) => !MARKER.test(line))
    .join("\n");
}

export function getRegion(src: string, name: string): string | null {
  const lines = src.split("\n");
  const start = lines.findIndex((l) => l.trim() === `// @region ${name}`);
  if (start < 0) return null;
  let end = lines.findIndex((l, i) => i > start && l.trim() === "// @endregion");
  if (end < 0) end = lines.length;
  const body = lines.slice(start + 1, end).filter((l) => !MARKER.test(l));
  const indents = body.filter((l) => l.trim()).map((l) => (l.match(/^\s*/) as RegExpMatchArray)[0].length);
  const cut = indents.length ? Math.min(...indents) : 0;
  return body
    .map((l) => l.slice(cut))
    .join("\n")
    .replace(/\s+$/, "");
}

/* ------------------------------------------------------------------ */
/*  <CodeBlock />                                                      */
/* ------------------------------------------------------------------ */
interface CodeBlockProps {
  code: string;
  file?: string;
  maxHeight?: number | string;
  highlight?: number[];
  lineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({ code, file, maxHeight, highlight, lineNumbers = true, className = "" }: CodeBlockProps) {
  const clean = useMemo(() => stripRegions(code).replace(/\s+$/, ""), [code]);
  const lines = useMemo(() => toLines(tokenize(clean)), [clean]);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(clean);
    } catch {
      /* clipboard unavailable — still show feedback */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={`code-surface overflow-hidden rounded-2xl text-left shadow-[0_24px_50px_-30px_rgba(0,0,0,0.85)] ${className}`}>
      <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.03] px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          {file && <span className="font-mono text-xs text-slate-400">{file}</span>}
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="overflow-auto" style={{ maxHeight }}>
        <div className="min-w-max py-3 font-mono text-[13px] leading-[1.7]">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`flex px-4 ${highlight?.includes(i + 1) ? "bg-cyan-400/10 shadow-[inset_2px_0_0_#5ee0ff]" : ""}`}
            >
              {lineNumbers && (
                <span className="mr-4 w-6 shrink-0 select-none text-right text-slate-600">{i + 1}</span>
              )}
              <code className="whitespace-pre">
                {line.length
                  ? line.map((tk, j) =>
                      tk.c ? (
                        <span key={j} className={`tok-${tk.c}`}>
                          {tk.t}
                        </span>
                      ) : (
                        <Fragment key={j}>{tk.t}</Fragment>
                      ),
                    )
                  : " "}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
