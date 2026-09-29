import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { useRenderCount } from "./shared";

function Experiment({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="card flex flex-col gap-4 p-5">
      <div>
        <h4 className="font-display text-base font-semibold text-ink">{title}</h4>
        <p className="font-mono text-xs text-brand">{sub}</p>
      </div>
      {children}
    </div>
  );
}

function Readout({ label, value, tone }: { label: string; value: ReactNode; tone?: "ok" | "bad" }) {
  const color = tone === "ok" ? "text-ok" : tone === "bad" ? "text-bad" : "text-ink";
  return (
    <div className="rounded-xl border border-line bg-bg/40 p-3 text-center">
      <p key={String(value)} className={`animate-pop font-display text-3xl font-bold tabular-nums ${color}`}>
        {value}
      </p>
      <p className="mt-1 font-mono text-[10.5px] leading-tight text-ink3">{label}</p>
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="text-[12.5px] leading-relaxed text-ink3">{children}</p>;
}

/* 1 — a plain variable is not state ---------------------------------- */
function PlainVariable() {
  let clicks = 0; // recreated (back to 0) every time this function runs
  const ran = useRef(0);
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  return (
    <Experiment title="A plain variable" sub="let clicks = 0">
      <Readout label="clicks (what the screen shows)" value={clicks} tone="bad" />
      <div className="flex gap-2">
        <button
          className="btn btn-primary btn-sm flex-1"
          onClick={() => {
            clicks += 1;
            ran.current += 1;
          }}
        >
          clicks++
        </button>
        <button className="btn btn-soft btn-sm" onClick={rerender}>
          Re-render
        </button>
      </div>
      <Note>
        The handler ran <b className="text-ink2">{ran.current}×</b> but the screen still says{" "}
        <b className="text-ink2">{clicks}</b>. React wasn't told anything changed, and even if it re-renders, the
        function starts over with a fresh <code className="font-mono">clicks = 0</code>.
      </Note>
    </Experiment>
  );
}

/* 2 — batching & updater functions ----------------------------------- */
function Batching() {
  const [naive, setNaive] = useState(0);
  const [updater, setUpdater] = useState(0);
  const renders = useRenderCount();

  return (
    <Experiment title="Batching & updaters" sub="3 set calls → 1 render">
      <div className="grid grid-cols-2 gap-3">
        <Readout label="setN(n + 1) ×3" value={naive} tone="bad" />
        <Readout label="setN(n ⇒ n + 1) ×3" value={updater} tone="ok" />
      </div>
      <div className="flex gap-2">
        <button
          className="btn btn-soft btn-sm flex-1"
          onClick={() => {
            setNaive(naive + 1);
            setNaive(naive + 1);
            setNaive(naive + 1);
          }}
        >
          +3 naive
        </button>
        <button
          className="btn btn-primary btn-sm flex-1"
          onClick={() => {
            setUpdater((n) => n + 1);
            setUpdater((n) => n + 1);
            setUpdater((n) => n + 1);
          }}
        >
          +3 updater
        </button>
      </div>
      <Note>
        This component has rendered <b className="text-ink2">{renders}×</b>. Every click queued three updates but caused
        just <b className="text-ink2">one</b> render. In the naive version all three calls used the same snapshot value
        of <code className="font-mono">n</code>, so they all asked for "n + 1".
      </Note>
    </Experiment>
  );
}

/* 3 — event handlers see the snapshot they were created in ------------ */
function Snapshot() {
  const [count, setCount] = useState(0);
  const [report, setReport] = useState<string | null>(null);
  const latest = useRef(count);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    latest.current = count;
  });
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  function readLater() {
    setReport("…waiting 2.5 seconds…");
    const id = window.setTimeout(() => {
      // `count` here is the value from the render where this handler was created
      setReport(`The handler saw count = ${count}, but the screen now shows ${latest.current}.`);
    }, 2500);
    timers.current.push(id);
  }

  return (
    <Experiment title="Snapshots in time" sub="setTimeout(() => … count …)">
      <Readout label="count on screen" value={count} />
      <div className="flex gap-2">
        <button className="btn btn-primary btn-sm flex-1" onClick={() => setCount((c) => c + 1)}>
          +1
        </button>
        <button className="btn btn-soft btn-sm flex-1" onClick={readLater}>
          Read in 2.5s
        </button>
      </div>
      <Note>
        {report ?? (
          <>
            Click <b className="text-ink2">Read in 2.5s</b>, then hammer <b className="text-ink2">+1</b> a few times.
            Each render has its own props, state and handlers — the timer remembers the render it was born in.
          </>
        )}
      </Note>
    </Experiment>
  );
}

export default function SnapshotLab() {
  return (
    <div className="grid gap-5 p-5 sm:p-7 xl:grid-cols-3">
      <PlainVariable />
      <Batching />
      <Snapshot />
    </div>
  );
}
