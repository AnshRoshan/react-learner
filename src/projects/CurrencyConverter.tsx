import { useEffect, useState } from "react";
import { ArrowLeftRight, RefreshCw, Wifi, WifiOff } from "lucide-react";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR", "CAD", "AUD", "CHF", "CNY", "BRL", "MXN", "SEK", "SGD", "KRW"];

// Offline sample rates (per 1 USD), used when the live API can't be reached
const SAMPLE: Record<string, number> = {
  USD: 1, EUR: 0.88, GBP: 0.75, JPY: 157, INR: 96, CAD: 1.42, AUD: 1.42,
  CHF: 0.83, CNY: 6.71, BRL: 5.2, MXN: 17.8, SEK: 9.95, SGD: 1.28, KRW: 1358,
};

// @region types
// A discriminated union: each status carries exactly the data that makes sense for it.
type RatesState =
  | { status: "loading" }
  | { status: "ready"; rates: Record<string, number>; date: string; source: "live" | "offline"; error?: string };
// @endregion

function rebase(base: string) {
  const k = SAMPLE[base];
  return Object.fromEntries(Object.entries(SAMPLE).map(([code, v]) => [code, v / k]));
}

// @region hook
// Data fetching lives in a custom hook, so the component only sees a tidy `state`.
function useRates(base: string) {
  const [state, setState] = useState<RatesState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    fetch(`https://api.frankfurter.dev/v1/latest?base=${base}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Server answered ${res.status}`);
        return res.json();
      })
      .then((data) =>
        setState({ status: "ready", rates: { ...data.rates, [base]: 1 }, date: data.date, source: "live" }),
      )
      .catch((err: Error) => {
        if (err.name === "AbortError") return; // we cancelled on purpose — not a real failure
        setState({ status: "ready", rates: rebase(base), date: "sample data", source: "offline", error: err.message });
      });

    // Cleanup: if `base` changes (or we unmount) cancel the old request,
    // so a slow, stale response can never overwrite a newer one.
    return () => controller.abort();
  }, [base, attempt]);

  return { state, retry: () => setAttempt((a) => a + 1) };
}
// @endregion

const money = (n: number, code: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: code === "JPY" || code === "KRW" ? 0 : 2,
  }).format(n);

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const { state, retry } = useRates(from);

  // @region derived
  // The converted value is derived — no extra state, no effect.
  const rate = state.status === "ready" ? state.rates[to] : undefined;
  const value = parseFloat(amount);
  const converted = rate !== undefined && Number.isFinite(value) ? value * rate : undefined;
  // @endregion

  const loading = state.status === "loading";
  const offline = state.status === "ready" && state.source === "offline";

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <div className="card p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <h4 className="font-display text-xl font-bold text-ink">Currency converter</h4>
          <span
            className={`chip ${loading ? "" : offline ? "!text-warn" : "!text-ok"}`}
            title={state.status === "ready" ? state.date : "fetching…"}
          >
            {loading ? <RefreshCw size={12} className="animate-spin" /> : offline ? <WifiOff size={12} /> : <Wifi size={12} />}
            {loading ? "loading rates" : offline ? "offline sample" : `live · ${state.status === "ready" ? state.date : ""}`}
          </span>
        </div>

        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-ink3">Amount</label>
        <input
          className="input !text-2xl !font-semibold"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-label="Amount"
        />

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-ink3">From</label>
            <select className="input" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From currency">
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
            aria-label="Swap currencies"
            className="mb-0.5 grid h-10 w-10 place-items-center rounded-full border border-line bg-surface2 text-brand transition hover:rotate-180 hover:border-line2"
            style={{ transitionDuration: "0.4s" }}
          >
            <ArrowLeftRight size={16} />
          </button>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-ink3">To</label>
            <select className="input" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To currency">
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-bg/50 p-5">
          {loading || converted === undefined ? (
            <div className="space-y-3">
              <div className="skeleton h-10 w-2/3 rounded-lg" />
              <div className="skeleton h-4 w-1/2 rounded" />
            </div>
          ) : (
            <>
              <p className="text-sm text-ink3">
                {Number.isFinite(value) ? money(value, from) : "—"} =
              </p>
              <p key={converted} className="animate-pop font-display text-4xl font-bold text-gradient sm:text-5xl">
                {money(converted, to)}
              </p>
              <p className="mt-2 font-mono text-xs text-ink3">
                1 {from} = {rate?.toFixed(4)} {to}
              </p>
            </>
          )}
        </div>

        {offline && state.status === "ready" && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-warn/40 bg-warn/10 p-3.5 text-[13px] text-ink2">
            <span>
              Couldn't reach the live API ({state.error}). Showing built-in sample rates so the app still works.
            </span>
            <button className="btn btn-soft btn-sm shrink-0" onClick={retry}>
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {state.status === "ready" && Number.isFinite(value) && (
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CURRENCIES.filter((c) => c !== from)
              .slice(0, 6)
              .map((c) => (
                <button
                  key={c}
                  onClick={() => setTo(c)}
                  className={`rounded-xl border px-3 py-2 text-left transition ${
                    c === to ? "border-brand bg-brand/10" : "border-line bg-surface hover:border-line2"
                  }`}
                >
                  <span className="block font-mono text-[11px] text-ink3">{c}</span>
                  <span className="text-sm font-semibold text-ink">{money(value * (state.rates[c] ?? 0), c)}</span>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
