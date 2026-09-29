import { memo, useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { Cpu, Layers2, MousePointerClick } from "lucide-react";
import { useFlash, useRenderCount } from "./shared";

/* ---- a tiny external store that drives the slow-motion pipeline bar ---- */
type Phase = "idle" | "trigger" | "render" | "commit";
let phase: Phase = "idle";
let timers: number[] = [];
const subs = new Set<() => void>();

function setPhase(next: Phase) {
  phase = next;
  subs.forEach((fn) => fn());
}
function replay() {
  timers.forEach((id) => window.clearTimeout(id));
  setPhase("trigger");
  timers = [
    window.setTimeout(() => setPhase("render"), 550),
    window.setTimeout(() => setPhase("commit"), 1200),
    window.setTimeout(() => setPhase("idle"), 2100),
  ];
}
const usePhase = () =>
  useSyncExternalStore(
    (fn) => {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
    () => phase,
  );

const STEPS = [
  { id: "trigger", title: "1 · Trigger", text: "A state setter is called. React queues the update.", icon: MousePointerClick },
  { id: "render", title: "2 · Render", text: "React calls your components to build the new element tree.", icon: Cpu },
  { id: "commit", title: "3 · Commit", text: "React diffs old vs new and patches only what changed in the DOM.", icon: Layers2 },
] as const;

function PhaseBar() {
  const current = usePhase();
  useEffect(
    () => () => {
      timers.forEach((id) => window.clearTimeout(id));
      phase = "idle";
    },
    [],
  );
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {STEPS.map(({ id, title, text, icon: Icon }) => {
        const active = current === id;
        return (
          <div
            key={id}
            className={`rounded-2xl border p-4 transition duration-300 ${
              active
                ? "scale-[1.02] border-brand bg-brand/10 shadow-[0_0_34px_-10px_var(--brand)]"
                : "border-line bg-surface"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg ${active ? "bg-brand text-onbrand" : "bg-surface2 text-ink3"}`}
              >
                <Icon size={16} />
              </span>
              <p className="font-display text-sm font-semibold text-ink">{title}</p>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink3">{text}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ---- the component tree. Every <Box> counts its own renders ---- */
function Box({ name, hint, children }: { name: string; hint: string; children?: ReactNode }) {
  const ref = useFlash<HTMLDivElement>();
  const renders = useRenderCount();
  return (
    <div ref={ref} className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-ink">{`<${name} />`}</span>
        <span
          data-ignore
          className="rounded-full bg-brand/15 px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-brand"
        >
          {renders}× rendered
        </span>
      </div>
      <p className="mt-1 text-[11.5px] text-ink3">{hint}</p>
      {children && <div className="mt-2.5 space-y-2.5">{children}</div>}
    </div>
  );
}

// Custom comparison: skip the render only when the "memo" switch is on.
// (It behaves exactly like React.memo would for components whose props never change.)
const skipWhenOn = (prev: { memoOn: boolean }, next: { memoOn: boolean }) => prev.memoOn === next.memoOn && next.memoOn;

function Display({ count }: { count: number }) {
  return (
    <Box name="Display" hint="reads count → its output really changes">
      <span className="font-display text-3xl font-bold tabular-nums text-ink">{count}</span>
    </Box>
  );
}

function Leaf() {
  return <Box name="Leaf" hint="child of Sibling — static text" />;
}

const Sibling = memo(function Sibling(_props: { memoOn: boolean }) {
  return (
    <Box name="Sibling" hint="no props, no state — but still re-renders with its parent">
      <Leaf />
    </Box>
  );
}, skipWhenOn);

const Local = memo(function Local(_props: { memoOn: boolean }) {
  const [n, setN] = useState(0);
  return (
    <Box name="Local" hint="owns its own state — updating it renders only this subtree">
      <div className="flex items-center gap-3">
        <button
          className="btn btn-soft btn-sm"
          onClick={() => {
            setN((v) => v + 1);
            replay();
          }}
        >
          Local: setN(n + 1)
        </button>
        <span className="font-display text-xl font-bold tabular-nums text-ink">{n}</span>
      </div>
    </Box>
  );
}, skipWhenOn);

const Parent = memo(function Parent() {
  const [count, setCount] = useState(0);
  const [memoOn, setMemoOn] = useState(false);
  return (
    <Box name="Parent" hint="owns the count state">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setCount((c) => c + 1);
            replay();
          }}
        >
          Parent: setCount(count + 1)
        </button>
        <label className="chip cursor-pointer select-none">
          <input type="checkbox" checked={memoOn} onChange={(e) => setMemoOn(e.target.checked)} />
          memo(Sibling, Local)
        </label>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Display count={count} />
        <Sibling memoOn={memoOn} />
      </div>
      <Local memoOn={memoOn} />
    </Box>
  );
});

/* ---- counts REAL DOM mutations inside the tree (badges are ignored) ---- */
function Stats({ treeRef }: { treeRef: RefObject<HTMLDivElement | null> }) {
  const [mutations, setMutations] = useState(0);

  useEffect(() => {
    const el = treeRef.current;
    if (!el) return;
    const observer = new MutationObserver((records) => {
      const real = records.filter((r) => {
        const node = r.target instanceof Element ? r.target : r.target.parentElement;
        return !node?.closest("[data-ignore]");
      });
      if (real.length) setMutations((m) => m + real.length);
    });
    observer.observe(el, { subtree: true, childList: true, characterData: true, attributes: true });
    return () => observer.disconnect();
  }, [treeRef]);

  return (
    <div className="card flex flex-col justify-between gap-4 p-5">
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink3">Real DOM mutations</p>
        <p key={mutations} className="mt-2 animate-pop font-display text-5xl font-bold tabular-nums text-gradient">
          {mutations}
        </p>
        <p className="mt-1 text-xs text-ink3">counted by a MutationObserver watching this tree</p>
      </div>
      <p className="text-[12.5px] leading-relaxed text-ink3">
        Click the buttons and compare the two numbers: components can render again and again while the browser's DOM
        barely changes. <b className="text-ink2">Rendering ≠ updating the DOM.</b> Then tick{" "}
        <code className="font-mono text-brand">memo</code> and try again.
      </p>
    </div>
  );
}

function RenderLab() {
  const treeRef = useRef<HTMLDivElement>(null);
  return (
    <div className="space-y-5 p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink2">
          Press a button — the pipeline replays in <b className="text-ink">slow motion</b> while the real counters
          update.
        </p>
      </div>
      <PhaseBar />
      <div className="grid gap-5 lg:grid-cols-[1fr_270px]">
        <div ref={treeRef}>
          <Parent />
        </div>
        <Stats treeRef={treeRef} />
      </div>
    </div>
  );
}

export default memo(RenderLab);
