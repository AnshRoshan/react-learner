import { useEffect, useReducer, useState } from "react";
import { RotateCcw } from "lucide-react";
import { CodeBlock } from "../lib/highlight";
import { LabLabel } from "./shared";

/* ------------------------------------------------------------------ */
/*  A miniature React: a list of state slots + a cursor that restarts   */
/*  at 0 on every render. This is the core idea behind real hooks.      */
/* ------------------------------------------------------------------ */
interface Call {
  slot: number;
  label: string;
}

function createRuntime() {
  const slots: unknown[] = [];
  const owners: string[] = [];
  let cursor = 0;
  let calls: Call[] = [];
  let notify: () => void = () => {};

  return {
    subscribe(fn: () => void) {
      notify = fn;
    },
    reset() {
      slots.length = 0;
      owners.length = 0;
    },
    useState<T>(label: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
      const i = cursor++; // ← the "hook order" trick
      calls.push({ slot: i, label });
      if (!(i in slots)) {
        slots[i] = initial;
        owners[i] = label;
      }
      const set = (next: T | ((prev: T) => T)) => {
        slots[i] = typeof next === "function" ? (next as (prev: T) => T)(slots[i] as T) : next;
        notify(); // schedule a re-render
      };
      return [slots[i] as T, set];
    },
    render<R>(component: () => R) {
      cursor = 0;
      calls = [];
      const output = component();
      return { output, calls: [...calls], slots: [...slots], owners: [...owners] };
    },
  };
}
type Runtime = ReturnType<typeof createRuntime>;

function profile(rt: Runtime, callFlagHook: boolean) {
  const [count, setCount] = rt.useState("count", 0);
  let flag = "—";
  if (callFlagHook) {
    const [f] = rt.useState("flag", "🚩");
    flag = f;
  }
  const [name, setName] = rt.useState("name", "Ada");
  return { count, setCount, flag, name, setName };
}

const CODE = `function Profile() {
  const [count, setCount] = useState(0);

  if (callFlagHook) {          // ❌ conditional
    const [flag] = useState('🚩');
  }

  const [name, setName] = useState('Ada');
  // …
}`;

export default function HooksLab() {
  const [rt] = useState(createRuntime);
  const [, force] = useReducer((n: number) => n + 1, 0);
  const [callFlagHook, setCallFlagHook] = useState(true);

  useEffect(() => {
    rt.subscribe(force);
  }, [rt]);

  const { output, calls, slots, owners } = rt.render(() => profile(rt, callFlagHook));
  const broken = calls.some((c) => owners[c.slot] !== c.label);

  return (
    <div className="grid gap-6 p-5 sm:p-7 xl:grid-cols-[1.1fr_1fr]">
      <div className="min-w-0 space-y-4">
        <LabLabel n={1} title="The component" sub="a mini-React runs it; every hook call takes the next slot" />
        <CodeBlock code={CODE} highlight={callFlagHook ? [] : [4, 5]} />

        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3">
          <span className="text-sm text-ink2">
            <b className="text-ink">callFlagHook</b> — the <code className="font-mono text-brand">if</code> condition
          </span>
          <input
            type="checkbox"
            checked={callFlagHook}
            onChange={(e) => setCallFlagHook(e.target.checked)}
            className="h-4 w-4"
          />
        </label>

        <LabLabel n={2} title="What the component returned" sub="rendered from the slots" />
        <div className="grid gap-3 rounded-2xl border border-line bg-bg/40 p-4 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[11px] text-ink3">count</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="font-display text-2xl font-bold tabular-nums text-ink">{String(output.count)}</span>
              <button className="btn btn-soft btn-sm !px-3" onClick={() => output.setCount((c) => c + 1)}>
                +1
              </button>
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] text-ink3">name</p>
            <input
              className="input mt-1.5 !py-1.5"
              value={String(output.name)}
              onChange={(e) => output.setName(e.target.value)}
              aria-label="name"
            />
          </div>
          <div>
            <p className="font-mono text-[11px] text-ink3">flag</p>
            <p className="mt-1.5 font-display text-2xl">{String(output.flag)}</p>
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-4">
        <LabLabel n={3} title="Slots (stored outside your function)" sub="each slot remembers which hook created it" />
        <div className="space-y-2">
          {slots.map((value, i) => {
            const reader = calls.find((c) => c.slot === i);
            const bad = reader !== undefined && reader.label !== owners[i];
            const unused = reader === undefined;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition ${
                  bad ? "border-bad/60 bg-bad/10" : unused ? "border-dashed border-line opacity-60" : "border-line bg-surface"
                }`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface2 font-mono text-xs font-bold text-brand">
                  {i}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[13px] text-ink">
                    {owners[i]} = <span className="tok-str">{JSON.stringify(value)}</span>
                  </p>
                  <p className={`text-[11px] ${bad ? "text-bad" : "text-ink3"}`}>
                    {unused ? "not read this render (orphaned)" : `read by useState("${reader.label}")`}
                    {bad && ` — but it belongs to "${owners[i]}"!`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className={`rounded-xl border p-3.5 text-[13px] leading-relaxed ${
            broken ? "border-bad/50 bg-bad/10 text-ink2" : "border-line bg-surface text-ink3"
          }`}
        >
          {broken ? (
            <>
              <b className="text-bad">Hook order changed!</b> With one hook skipped, <code className="font-mono">name</code>{" "}
              reads the slot that belongs to <code className="font-mono">flag</code>. Real React detects this and throws
              "Rendered fewer hooks than expected".
            </>
          ) : (
            <>Same hooks, same order, every render → every hook finds its own slot. Now untick the box…</>
          )}
        </div>

        <button
          className="btn btn-soft btn-sm"
          onClick={() => {
            rt.reset();
            setCallFlagHook(true);
            force();
          }}
        >
          <RotateCcw size={14} /> Reset runtime
        </button>
      </div>
    </div>
  );
}
