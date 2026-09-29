import { useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";

const MIN = -99;
const MAX = 99;
const STEPS = [1, 5, 10];
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Counter() {
  // @region state
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  const [note, setNote] = useState("Press a button and watch what happens.");
  // @endregion

  // @region update
  // Updater form: React hands us the *latest* value, so rapid clicks can never lose an update.
  function change(delta: number) {
    setCount((c) => Math.min(MAX, Math.max(MIN, c + delta)));
    setNote(delta > 0 ? `Added ${delta}` : `Subtracted ${-delta}`);
  }
  // @endregion

  // @region snapshot
  function naiveTriple() {
    // ❌ Inside one render `count` is a constant. All three calls ask for the same next value.
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    setNote("Naive: setCount(count + 1) ×3 → only +1. All three calls used the same snapshot.");
  }

  function updaterTriple() {
    // ✅ Each updater receives the result of the previous one.
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    setNote("Updater: setCount(c => c + 1) ×3 → +3. Each call builds on the last.");
  }
  // @endregion

  // @region view
  const progress = (count - MIN) / (MAX - MIN);
  const atLimit = count === MIN || count === MAX;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-7 px-5 py-10">
      <div className="relative grid h-60 w-60 place-items-center">
        <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="6" className="stroke-line2" />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            className={`transition-all duration-500 ${atLimit ? "stroke-bad" : "stroke-brand"}`}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          />
        </svg>
        <div className="text-center">
          {/* Changing `key` remounts this node, which replays the CSS animation */}
          <div key={count} className="animate-pop font-display text-7xl font-bold tabular-nums text-ink">
            {count}
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-ink3">
            {atLimit ? "limit reached" : "count"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => change(-step)}
          aria-label={`Subtract ${step}`}
          className="grid h-14 w-14 place-items-center rounded-full border border-line bg-surface2 text-ink transition hover:border-line2 active:scale-90"
        >
          <Minus />
        </button>
        <button
          onClick={() => change(step)}
          aria-label={`Add ${step}`}
          className="grid h-16 w-16 place-items-center rounded-full bg-brand text-onbrand shadow-[0_10px_30px_-10px_var(--brand)] transition hover:brightness-110 active:scale-90"
        >
          <Plus size={28} />
        </button>
        <button
          onClick={() => {
            setCount(0);
            setNote("Reset to zero.");
          }}
          aria-label="Reset"
          className="grid h-14 w-14 place-items-center rounded-full border border-line bg-surface2 text-ink transition hover:border-line2 active:scale-90"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-ink3">Step</span>
        {STEPS.map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`h-9 min-w-9 rounded-lg border px-3 font-semibold transition ${
              step === s ? "border-brand bg-brand/15 text-brand" : "border-line bg-surface text-ink2 hover:border-line2"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-2">
        <button
          onClick={naiveTriple}
          className="rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-left text-sm transition hover:bg-bad/15"
        >
          <span className="block font-mono text-xs text-bad">❌ naive</span>
          <span className="font-semibold text-ink">setCount(count + 1) ×3</span>
        </button>
        <button
          onClick={updaterTriple}
          className="rounded-xl border border-ok/40 bg-ok/10 px-4 py-3 text-left text-sm transition hover:bg-ok/15"
        >
          <span className="block font-mono text-xs text-ok">✅ updater</span>
          <span className="font-semibold text-ink">setCount(c ⇒ c + 1) ×3</span>
        </button>
      </div>

      <p className="min-h-10 text-center text-sm leading-relaxed text-ink2" aria-live="polite">
        {note}
      </p>
    </div>
  );
  // @endregion
}
