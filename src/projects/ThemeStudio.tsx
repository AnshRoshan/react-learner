import { createContext, useContext, useMemo, useState, type CSSProperties } from "react";
import { Moon, ShoppingBag, Star, Sun } from "lucide-react";

type Mode = "light" | "dark";
type Currency = "USD" | "EUR" | "JPY";

interface ThemeValue {
  mode: Mode;
  accent: string;
  radius: number;
  currency: Currency;
}

// @region context
const ThemeContext = createContext<ThemeValue | null>(null);

// Wrap useContext in your own hook: one place for a helpful error (or to change the source later).
function useStoreTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useStoreTheme() must be used inside <ThemeContext.Provider>");
  return value;
}
// @endregion

const RATES: Record<Currency, number> = { USD: 1, EUR: 0.88, JPY: 157 };
const ACCENTS = ["#22d3ee", "#a78bfa", "#f472b6", "#fbbf24", "#34d399", "#fb7185"];

const PRODUCTS = [
  { name: "Aero Runner", usd: 129, art: "linear-gradient(135deg,#22d3ee,#6366f1)", tag: "New" },
  { name: "Cloud Knit", usd: 99, art: "linear-gradient(135deg,#f472b6,#fb923c)", tag: "Bestseller" },
  { name: "Terra Trail", usd: 149, art: "linear-gradient(135deg,#34d399,#0ea5e9)", tag: "" },
];

// @region consumer
// These components sit deep inside the storefront. None of them receive theme props —
// they simply ask the context, no matter how many levels are between them and the Provider.
function Price({ usd }: { usd: number }) {
  const { currency } = useStoreTheme();
  const text = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(usd * RATES[currency]);
  return <span>{text}</span>;
}

function BuyButton({ label }: { label: string }) {
  const { accent, radius } = useStoreTheme();
  return (
    <button
      className="px-4 py-2 text-sm font-bold transition hover:brightness-110 active:scale-95"
      style={{ background: accent, color: "#0b0f1a", borderRadius: radius }}
    >
      {label}
    </button>
  );
}
// @endregion

function ProductCard({ name, usd, art, tag }: (typeof PRODUCTS)[number]) {
  const { radius } = useStoreTheme();
  return (
    <div
      className="overflow-hidden border"
      style={{ borderRadius: radius, background: "var(--s-card)", borderColor: "var(--s-line)" }}
    >
      <div className="relative grid h-32 place-items-center" style={{ background: art }}>
        <span className="text-6xl drop-shadow-[0_8px_10px_rgba(0,0,0,0.3)]">👟</span>
        {tag && (
          <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] font-bold text-white">
            {tag}
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold" style={{ color: "var(--s-fg)" }}>
          {name}
        </p>
        <p className="mt-0.5 text-sm" style={{ color: "var(--s-mute)" }}>
          <Price usd={usd} />
        </p>
        <div className="mt-3">
          <BuyButton label="Add to bag" />
        </div>
      </div>
    </div>
  );
}

function Storefront() {
  const { mode, accent, radius } = useStoreTheme();
  const dark = mode === "dark";
  const vars = {
    "--s-bg": dark ? "#0b0f1a" : "#f8fafc",
    "--s-card": dark ? "#141a2a" : "#ffffff",
    "--s-fg": dark ? "#f1f5f9" : "#0f172a",
    "--s-mute": dark ? "#94a3b8" : "#64748b",
    "--s-line": dark ? "rgba(255,255,255,0.09)" : "rgba(15,23,42,0.1)",
  } as CSSProperties;

  return (
    <div
      className="overflow-hidden border"
      style={{ ...vars, background: "var(--s-bg)", borderColor: "var(--s-line)", borderRadius: radius + 8 }}
    >
      <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--s-line)" }}>
        <span className="font-display text-lg font-extrabold" style={{ color: "var(--s-fg)" }}>
          <span style={{ color: accent }}>◆</span> NIMBUS
        </span>
        <div className="flex items-center gap-5 text-sm" style={{ color: "var(--s-mute)" }}>
          <span className="hidden sm:inline">Shoes</span>
          <span className="hidden sm:inline">Sale</span>
          <ShoppingBag size={18} style={{ color: "var(--s-fg)" }} />
        </div>
      </div>

      <div className="px-6 pb-2 pt-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: accent }}>
          Spring collection
        </p>
        <h3 className="mx-auto mt-2 max-w-md font-display text-3xl font-extrabold leading-tight" style={{ color: "var(--s-fg)" }}>
          Run lighter. Look sharper.
        </h3>
        <p className="mx-auto mt-2 flex max-w-sm items-center justify-center gap-1 text-sm" style={{ color: "var(--s-mute)" }}>
          <Star size={14} fill={accent} style={{ color: accent }} /> Rated 4.9 by 12,000 runners
        </p>
        <div className="mt-4 flex justify-center">
          <BuyButton label="Shop the drop" />
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-3">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.name} {...p} />
        ))}
      </div>
    </div>
  );
}

export default function ThemeStudio() {
  const [mode, setMode] = useState<Mode>("dark");
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [radius, setRadius] = useState(14);
  const [currency, setCurrency] = useState<Currency>("USD");

  // @region value
  // useMemo keeps the object's identity stable until one of its inputs really changes,
  // so consumers don't re-render just because *this* component did.
  const theme = useMemo<ThemeValue>(() => ({ mode, accent, radius, currency }), [mode, accent, radius, currency]);
  // @endregion

  return (
    <ThemeContext.Provider value={theme}>
      <div className="mx-auto grid max-w-5xl gap-6 px-5 py-8 lg:grid-cols-[15rem_1fr]">
        <aside className="card h-fit space-y-5 p-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink3">Mode</p>
            <div className="grid grid-cols-2 gap-2">
              {(["light", "dark"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold capitalize transition ${
                    mode === m ? "border-brand bg-brand/15 text-brand" : "border-line bg-surface text-ink2 hover:border-line2"
                  }`}
                >
                  {m === "light" ? <Sun size={15} /> : <Moon size={15} />} {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink3">Accent</p>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAccent(c)}
                  aria-label={`Accent ${c}`}
                  className={`h-8 w-8 rounded-full border-2 transition hover:scale-110 ${
                    accent === c ? "border-ink" : "border-transparent"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-ink3">
              Corner radius <span className="font-mono normal-case text-brand">{radius}px</span>
            </label>
            <input
              type="range"
              min={0}
              max={28}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full"
              aria-label="Corner radius"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink3">Currency</p>
            <select
              className="input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              aria-label="Currency"
            >
              <option>USD</option>
              <option>EUR</option>
              <option>JPY</option>
            </select>
          </div>

          <p className="text-xs leading-relaxed text-ink3">
            <code className="font-mono text-brand">BuyButton</code> and <code className="font-mono text-brand">Price</code>{" "}
            live 3–4 levels deep, yet they react instantly — no props were drilled.
          </p>
        </aside>

        <Storefront />
      </div>
    </ThemeContext.Provider>
  );
}
