import { useState } from "react";
import { Check, Copy, RefreshCw, ShieldCheck } from "lucide-react";

interface Options {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  noAmbiguous: boolean;
}

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?",
};

// @region generate
// Secure randomness with no modulo bias (rejection sampling).
function randomInt(max: number) {
  const buf = new Uint32Array(1);
  const limit = Math.floor(2 ** 32 / max) * max;
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

function pool(o: Options) {
  let chars =
    (o.lower ? SETS.lower : "") + (o.upper ? SETS.upper : "") + (o.digits ? SETS.digits : "") + (o.symbols ? SETS.symbols : "");
  if (o.noAmbiguous) chars = chars.replace(/[O0oIl1|]/g, "");
  return chars;
}

function generate(o: Options) {
  const chars = pool(o);
  return Array.from({ length: o.length }, () => chars[randomInt(chars.length)]).join("");
}
// @endregion

function crackTime(bits: number) {
  const s = 2 ** bits / 2e10; // average time at 10 billion guesses per second
  if (s < 1) return "instantly";
  if (s < 60) return `${Math.round(s)} seconds`;
  if (s < 3600) return `${Math.round(s / 60)} minutes`;
  if (s < 86400) return `${Math.round(s / 3600)} hours`;
  if (s < 31536000) return `${Math.round(s / 86400)} days`;
  const y = s / 31536000;
  if (y < 1e3) return `${Math.round(y)} years`;
  if (y < 1e6) return `${Math.round(y / 1e3)} thousand years`;
  if (y < 1e9) return `${Math.round(y / 1e6)} million years`;
  return "billions of years";
}

const TOGGLES: { key: keyof Omit<Options, "length">; label: string; hint: string }[] = [
  { key: "lower", label: "Lowercase", hint: "a–z" },
  { key: "upper", label: "Uppercase", hint: "A–Z" },
  { key: "digits", label: "Numbers", hint: "0–9" },
  { key: "symbols", label: "Symbols", hint: "!@#$" },
  { key: "noAmbiguous", label: "No look-alikes", hint: "O 0 l 1 I" },
];

export default function PasswordGenerator() {
  // @region state
  const [options, setOptions] = useState<Options>({
    length: 18,
    lower: true,
    upper: true,
    digits: true,
    symbols: true,
    noAmbiguous: false,
  });
  // Lazy initialiser: the function runs once, not on every render
  const [password, setPassword] = useState(() => generate(options));
  const [copied, setCopied] = useState(false);
  // @endregion

  // @region handlers
  // Change an option AND regenerate in the same event handler — no useEffect needed.
  function update(patch: Partial<Options>) {
    const next = { ...options, ...patch };
    if (!next.lower && !next.upper && !next.digits && !next.symbols) return; // keep at least one set
    setOptions(next);
    setPassword(generate(next));
    setCopied(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(password);
    } catch {
      /* clipboard may be blocked */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  // @endregion

  // @region derived
  // Nothing below is stored in state — it's all computed from `options` during render.
  const poolSize = pool(options).length;
  const bits = Math.round(options.length * Math.log2(poolSize));
  const level = bits < 45 ? 0 : bits < 65 ? 1 : bits < 95 ? 2 : 3;
  const strength = [
    { label: "Weak", color: "var(--bad)" },
    { label: "Fair", color: "var(--warn)" },
    { label: "Strong", color: "var(--ok)" },
    { label: "Excellent", color: "var(--brand)" },
  ][level];
  // @endregion

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="card p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <div
            className="min-h-[5.5rem] flex-1 break-all rounded-2xl border border-line bg-bg/50 p-4 font-mono text-xl font-medium leading-relaxed tracking-wide sm:text-2xl"
            aria-live="polite"
          >
            {password.split("").map((ch, i) => (
              <span
                key={i}
                className={/\d/.test(ch) ? "text-brand" : /[a-zA-Z]/.test(ch) ? "text-ink" : "text-brand3"}
              >
                {ch}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={copy}
              aria-label="Copy password"
              className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-onbrand transition hover:brightness-110 active:scale-95"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
            <button
              onClick={() => update({})}
              aria-label="Generate a new password"
              className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface2 text-ink transition hover:border-line2 active:scale-95"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-semibold" style={{ color: strength.color }}>
              <ShieldCheck size={16} /> {strength.label}
            </span>
            <span className="text-ink3">
              {bits} bits · cracked in ~{crackTime(bits)}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-colors duration-300"
                style={{ background: i <= level ? strength.color : "var(--line-2)" }}
              />
            ))}
          </div>
        </div>

        <div className="mt-7">
          <label className="mb-2 flex items-center justify-between text-sm font-semibold text-ink">
            Length
            <span className="rounded-lg bg-surface2 px-2.5 py-0.5 font-mono text-brand">{options.length}</span>
          </label>
          <input
            type="range"
            min={6}
            max={48}
            value={options.length}
            onChange={(e) => update({ length: Number(e.target.value) })}
            className="w-full"
            aria-label="Password length"
          />
        </div>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {TOGGLES.map((t) => (
            <label
              key={t.key}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm transition hover:border-line2"
            >
              <span>
                <span className="font-semibold text-ink">{t.label}</span>
                <span className="ml-2 font-mono text-xs text-ink3">{t.hint}</span>
              </span>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={options[t.key]}
                onChange={(e) => update({ [t.key]: e.target.checked })}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
