import { createContext, memo, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useFlash, useRenderCount } from "./shared";

const AccentContext = createContext({ accent: "cyan" });

function Card({ title, hint, children }: { title: string; hint: string; children?: ReactNode }) {
  const ref = useFlash<HTMLDivElement>();
  const renders = useRenderCount();
  return (
    <div ref={ref} className="rounded-xl border border-line bg-surface p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-xs font-semibold text-ink">{title}</p>
        <span className="shrink-0 rounded-full bg-brand/15 px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-brand">
          {renders}×
        </span>
      </div>
      <p className="mt-1 text-[11.5px] text-ink3">{hint}</p>
      {children}
    </div>
  );
}

function Plain() {
  return <Card title="<Plain />" hint="no memo — renders whenever Parent does" />;
}

const Memoized = memo(function Memoized() {
  return <Card title="memo(<Static />)" hint="no props → nothing to compare → skipped" />;
});

const WithCallback = memo(function WithCallback({ onAction }: { onAction: () => void }) {
  return (
    <Card title="memo(<WithFn onAction />)" hint="skipped only if onAction keeps its identity">
      <button className="chip mt-2 transition hover:text-ink" onClick={onAction}>
        call onAction()
      </button>
    </Card>
  );
});

const Consumer = memo(function Consumer() {
  const { accent } = useContext(AccentContext);
  return <Card title="memo(<Consumer />)" hint={`reads context → accent = ${accent}`} />;
});

function PerfLab() {
  const [count, setCount] = useState(0);
  const [stableFn, setStableFn] = useState(false);
  const [stableCtx, setStableCtx] = useState(false);

  const cachedFn = useCallback(() => {}, []); // same function every render
  const freshFn = () => {}; //                  brand-new function every render
  const cachedValue = useMemo(() => ({ accent: "cyan" }), []);
  const freshValue = { accent: "cyan" }; //     brand-new object every render

  return (
    <AccentContext.Provider value={stableCtx ? cachedValue : freshValue}>
      <div className="space-y-5 p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-primary" onClick={() => setCount((c) => c + 1)}>
            Re-render Parent · {count}
          </button>
          <label className="chip cursor-pointer select-none">
            <input type="checkbox" checked={stableFn} onChange={(e) => setStableFn(e.target.checked)} />
            useCallback(onAction)
          </label>
          <label className="chip cursor-pointer select-none">
            <input type="checkbox" checked={stableCtx} onChange={(e) => setStableCtx(e.target.checked)} />
            useMemo(context value)
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Plain />
          <Memoized />
          <WithCallback onAction={stableFn ? cachedFn : freshFn} />
          <Consumer />
        </div>

        <div className="grid gap-2.5 text-[13px] leading-relaxed text-ink2 sm:grid-cols-2">
          <p className="rounded-xl border border-line bg-surface p-3">
            <b className="text-ink">Plain</b> — re-renders every time. That's React's default and usually fine.
          </p>
          <p className="rounded-xl border border-line bg-surface p-3">
            <b className="text-ink">Static</b> — <code className="font-mono text-brand">memo</code> compared its (empty)
            props and bailed out.
          </p>
          <p className="rounded-xl border border-line bg-surface p-3">
            <b className="text-ink">WithFn</b> —{" "}
            {stableFn
              ? "the function keeps the same identity, so memo can skip it ✅"
              : "a new function is created every render, so props always look different — memo is defeated ❌"}
          </p>
          <p className="rounded-xl border border-line bg-surface p-3">
            <b className="text-ink">Consumer</b> —{" "}
            {stableCtx
              ? "the provider's value keeps its identity, so consumers stay put ✅"
              : "the Provider builds a new value object every render, so every consumer re-renders — even though memo wraps it ❌"}
          </p>
        </div>
      </div>
    </AccentContext.Provider>
  );
}

export default memo(PerfLab);
