import { useEffect, useReducer } from "react";
import { Delete } from "lucide-react";

type Op = "+" | "−" | "×" | "÷";

interface State {
  current: string; // what's on the display — a STRING, so users can type "0." or "1.50"
  previous: string | null; // the left-hand operand, once an operator was chosen
  op: Op | null;
  overwrite: boolean; // true → the next digit starts a new number instead of appending
  history: string[];
}

type Action =
  | { type: "digit"; digit: string }
  | { type: "op"; op: Op }
  | { type: "equals" }
  | { type: "clear" }
  | { type: "delete" }
  | { type: "negate" }
  | { type: "percent" };

const INITIAL: State = { current: "0", previous: null, op: null, overwrite: false, history: [] };

// @region reducer
function compute(a: number, b: number, op: Op) {
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? NaN : a / b; // never crash on divide-by-zero
  }
}

// Round away floating-point noise (0.1 + 0.2 → 0.3) and show "Error" for NaN/Infinity
const fmt = (n: number) => (Number.isFinite(n) ? String(parseFloat(n.toPrecision(12))) : "Error");

// The whole calculator is a small state machine: (state, action) → next state.
function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "digit": {
      if (s.overwrite) return { ...s, current: a.digit === "." ? "0." : a.digit, overwrite: false };
      if (a.digit === "." && s.current.includes(".")) return s;
      if (s.current === "0" && a.digit !== ".") return { ...s, current: a.digit };
      if (s.current.replace(/[-.]/g, "").length >= 12) return s;
      return { ...s, current: s.current + a.digit };
    }
    case "op": {
      if (s.current === "Error") return s;
      if (s.previous !== null && s.op && !s.overwrite) {
        // Chained operation: 2 + 3 + → evaluate 2 + 3 first
        const result = fmt(compute(parseFloat(s.previous), parseFloat(s.current), s.op));
        return { ...s, previous: result, current: result, op: a.op, overwrite: true };
      }
      return { ...s, previous: s.current, op: a.op, overwrite: true };
    }
    case "equals": {
      if (s.previous === null || !s.op) return s;
      const result = fmt(compute(parseFloat(s.previous), parseFloat(s.current), s.op));
      const line = `${s.previous} ${s.op} ${s.current} = ${result}`;
      return { current: result, previous: null, op: null, overwrite: true, history: [line, ...s.history].slice(0, 6) };
    }
    case "clear":
      return { ...INITIAL, history: s.history };
    case "delete": {
      if (s.overwrite) return s;
      const single = s.current.length === 1 || (s.current.length === 2 && s.current.startsWith("-"));
      return { ...s, current: single ? "0" : s.current.slice(0, -1) };
    }
    case "negate":
      if (s.current === "0" || s.current === "Error") return s;
      return { ...s, current: s.current.startsWith("-") ? s.current.slice(1) : "-" + s.current };
    case "percent":
      if (s.current === "Error") return s;
      return { ...s, current: fmt(parseFloat(s.current) / 100), overwrite: true };
  }
}
// @endregion

const show = (raw: string) => {
  if (raw === "Error") return raw;
  const [int, dec] = raw.split(".");
  const neg = int.startsWith("-");
  const whole = Number(int.replace("-", "")).toLocaleString("en-US");
  return `${neg ? "-" : ""}${whole}${dec !== undefined ? "." + dec : ""}`;
};

type KeyDef = { label: string; action: Action; tone: "num" | "fn" | "op" | "eq"; span?: boolean };
const num = (d: string, span?: boolean): KeyDef => ({ label: d, action: { type: "digit", digit: d }, tone: "num", span });
const op = (o: Op): KeyDef => ({ label: o, action: { type: "op", op: o }, tone: "op" });

const KEYS: KeyDef[] = [
  { label: "AC", action: { type: "clear" }, tone: "fn" },
  { label: "±", action: { type: "negate" }, tone: "fn" },
  { label: "%", action: { type: "percent" }, tone: "fn" },
  op("÷"),
  num("7"), num("8"), num("9"), op("×"),
  num("4"), num("5"), num("6"), op("−"),
  num("1"), num("2"), num("3"), op("+"),
  num("0", true), num("."),
  { label: "=", action: { type: "equals" }, tone: "eq" },
];

const TONE: Record<KeyDef["tone"], string> = {
  num: "bg-surface2 text-ink hover:bg-line2",
  fn: "bg-line2 text-ink hover:brightness-125",
  op: "bg-brand2/20 text-brand2 hover:bg-brand2/30",
  eq: "bg-brand text-onbrand hover:brightness-110",
};

export default function Calculator() {
  // @region state
  const [state, dispatch] = useReducer(reducer, INITIAL);
  // @endregion

  // @region keyboard
  useEffect(() => {
    const OPS: Record<string, Op> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) return;

      if (/^[0-9.]$/.test(e.key)) dispatch({ type: "digit", digit: e.key });
      else if (e.key in OPS) {
        e.preventDefault();
        dispatch({ type: "op", op: OPS[e.key] });
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        dispatch({ type: "equals" });
      } else if (e.key === "Backspace") dispatch({ type: "delete" });
      else if (e.key === "Escape") dispatch({ type: "clear" });
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown); // dispatch is stable, so this runs once
  }, []);
  // @endregion

  const text = show(state.current);
  const size = text.length > 13 ? "1.7rem" : text.length > 10 ? "2.2rem" : text.length > 8 ? "2.7rem" : "3.3rem";

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-5 py-10 md:flex-row md:items-start md:justify-center">
      <div className="card w-full max-w-[20rem] p-4">
        <div className="mb-3 rounded-2xl bg-bg/60 p-4 text-right">
          <div className="flex h-5 items-center justify-between text-xs text-ink3">
            <button
              onClick={() => dispatch({ type: "delete" })}
              aria-label="Delete last digit"
              className="rounded p-1 transition hover:text-ink"
            >
              <Delete size={16} />
            </button>
            <span className="font-mono">{state.previous !== null ? `${show(state.previous)} ${state.op ?? ""}` : "\u00A0"}</span>
          </div>
          <div
            className="mt-1 truncate font-display font-bold tabular-nums leading-tight text-ink"
            style={{ fontSize: size }}
            aria-live="polite"
          >
            {text}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {KEYS.map((k) => {
            const active = k.action.type === "op" && state.op === k.action.op && state.overwrite;
            return (
              <button
                key={k.label}
                onClick={(e) => {
                  e.currentTarget.blur(); // keep keyboard focus on the page so Enter isn't handled twice
                  dispatch(k.action);
                }}
                className={`h-14 rounded-2xl text-lg font-semibold transition active:scale-95 ${TONE[k.tone]} ${
                  k.span ? "col-span-2" : ""
                } ${active ? "ring-2 ring-brand2" : ""}`}
              >
                {k.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[11px] text-ink3">Keyboard works too: 0–9 · + − * / · Enter · Backspace · Esc</p>
      </div>

      <div className="w-full max-w-[20rem]">
        <p className="mb-3 text-sm font-semibold text-ink">History</p>
        {state.history.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line p-4 text-sm text-ink3">Finished calculations appear here.</p>
        ) : (
          <ul className="space-y-2">
            {state.history.map((h, i) => (
              <li key={h + i} className="animate-fade rounded-xl border border-line bg-surface px-3.5 py-2.5 font-mono text-xs text-ink2">
                {h}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
