import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Lock, LockOpen, RefreshCw } from "lucide-react";

interface Swatch {
  id: number;
  hex: string;
  locked: boolean;
}
type Harmony = "random" | "analogous" | "monochrome" | "complementary";

const HARMONIES: { id: Harmony; label: string }[] = [
  { id: "analogous", label: "Analogous" },
  { id: "complementary", label: "Complementary" },
  { id: "monochrome", label: "Monochrome" },
  { id: "random", label: "Random" },
];

// @region generate
const rand = (min: number, max: number) => min + Math.random() * (max - min);

function hslToHex(h: number, s: number, l: number) {
  const hue = ((h % 360) + 360) % 360;
  const sat = s / 100;
  const light = l / 100;
  const k = (n: number) => (n + hue / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const hex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${hex(f(0))}${hex(f(8))}${hex(f(4))}`.toUpperCase();
}

function makePalette(harmony: Harmony): string[] {
  const base = rand(0, 360);
  return Array.from({ length: 5 }, (_, i) => {
    switch (harmony) {
      case "analogous":
        return hslToHex(base + (i - 2) * 20, rand(60, 82), rand(42, 68));
      case "complementary":
        return hslToHex(base + (i % 2 ? 180 : 0) + rand(-10, 10), rand(58, 80), 34 + i * 8);
      case "monochrome":
        return hslToHex(base, rand(45, 75), 20 + i * 15);
      default:
        return hslToHex(rand(0, 360), rand(55, 85), rand(35, 72));
    }
  });
}

// Pick black or white text depending on the swatch's perceived luminance
function readableOn(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.42 ? "#0b1020" : "#ffffff";
}
// @endregion

export default function ColorPalette() {
  // @region state
  const [harmony, setHarmony] = useState<Harmony>("analogous");
  const [swatches, setSwatches] = useState<Swatch[]>(() =>
    makePalette("analogous").map((hex, id) => ({ id, hex, locked: false })),
  );
  const [copied, setCopied] = useState<string | null>(null);
  // @endregion

  // @region update
  // useCallback keeps `generate` stable, so the keyboard effect below only re-subscribes when `harmony` changes.
  const generate = useCallback(() => {
    const fresh = makePalette(harmony);
    // Immutable update: map to a NEW array; locked swatches are returned untouched.
    setSwatches((prev) => prev.map((s, i) => (s.locked ? s : { ...s, hex: fresh[i] })));
  }, [harmony]);

  function toggleLock(id: number) {
    setSwatches((prev) => prev.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s)));
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard may be blocked — still show feedback */
    }
    setCopied(text);
    setTimeout(() => setCopied(null), 1300);
  }
  // @endregion

  // @region keys
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (e.code !== "Space" || ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(tag)) return;
      e.preventDefault(); // stop the page from scrolling
      generate();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown); // cleanup: no duplicate listeners
  }, [generate]);
  // @endregion

  const css = `:root {\n${swatches.map((s, i) => `  --color-${i + 1}: ${s.hex};`).join("\n")}\n}`;

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="input !w-auto"
            value={harmony}
            onChange={(e) => setHarmony(e.target.value as Harmony)}
            aria-label="Colour harmony"
          >
            {HARMONIES.map((h) => (
              <option key={h.id} value={h.id}>
                {h.label}
              </option>
            ))}
          </select>
          <button className="btn btn-primary btn-sm" onClick={generate}>
            <RefreshCw size={14} /> Generate
          </button>
          <span className="hidden items-center gap-1.5 text-xs text-ink3 sm:flex">
            or press <span className="kbd">Space</span>
          </span>
        </div>
        <button className="btn btn-soft btn-sm" onClick={() => copy(css)}>
          {copied === css ? <Check size={14} className="text-ok" /> : <Copy size={14} />}
          {copied === css ? "Copied!" : "Copy CSS"}
        </button>
      </div>

      <div className="flex h-[420px] flex-col overflow-hidden rounded-3xl border border-line shadow-2xl sm:h-[360px] sm:flex-row">
        {swatches.map((s) => {
          const ink = readableOn(s.hex);
          return (
            <div
              key={s.id}
              className="group relative flex flex-1 items-center justify-between px-5 transition-[background-color] duration-500 sm:flex-col sm:justify-end sm:gap-4 sm:px-2 sm:pb-6"
              style={{ backgroundColor: s.hex, color: ink }}
            >
              <div className="flex gap-1.5 sm:order-2 sm:flex-col">
                <button
                  onClick={() => toggleLock(s.id)}
                  aria-label={s.locked ? "Unlock colour" : "Lock colour"}
                  className={`grid h-9 w-9 place-items-center rounded-full transition hover:bg-black/15 ${
                    s.locked ? "bg-black/15" : "opacity-60 group-hover:opacity-100"
                  }`}
                >
                  {s.locked ? <Lock size={17} /> : <LockOpen size={17} />}
                </button>
                <button
                  onClick={() => copy(s.hex)}
                  aria-label={`Copy ${s.hex}`}
                  className="grid h-9 w-9 place-items-center rounded-full opacity-60 transition hover:bg-black/15 group-hover:opacity-100"
                >
                  {copied === s.hex ? <Check size={17} /> : <Copy size={17} />}
                </button>
              </div>
              <span className="font-mono text-base font-bold tracking-wider sm:order-1 sm:text-sm">{s.hex}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
