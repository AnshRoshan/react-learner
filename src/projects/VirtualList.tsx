import { useLayoutEffect, useRef, useState, type UIEvent } from "react";
import { Gauge, Rows3 } from "lucide-react";

const TOTAL = 10000;
const ROW = 56; // fixed row height in px — the maths below relies on it
const HEIGHT = 420; // height of the scroll viewport
const OVERSCAN = 4; // a few extra rows above/below so fast scrolling never shows blanks
const NAIVE_LIMIT = 2000; // the naive mode renders this many rows (all 10,000 could freeze a slow browser)

const FIRST = ["Ada", "Alan", "Grace", "Linus", "Margaret", "Dennis", "Barbara", "Ken", "Radia", "Tim", "Hedy", "Vint", "Katherine", "Guido", "Anders", "Sophie"];
const LAST = ["Lovelace", "Turing", "Hopper", "Torvalds", "Hamilton", "Ritchie", "Liskov", "Thompson", "Perlman", "Lee", "Lamarr", "Cerf", "Johnson", "Rossum", "Hejlsberg", "Wilson"];
const ROLES = ["Engineer", "Designer", "Product", "Research", "Support", "Data"];

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
  hue: number;
}

const PEOPLE: Person[] = Array.from({ length: TOTAL }, (_, i) => {
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 7 + Math.floor(i / 16)) % LAST.length];
  return {
    id: i,
    name: `${first} ${last}`,
    email: `${first}.${last}${i}@example.com`.toLowerCase(),
    role: ROLES[i % ROLES.length],
    hue: (i * 47) % 360,
  };
});

function Row({ p }: { p: Person }) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-4" style={{ height: ROW }}>
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
        style={{ background: `hsl(${p.hue} 60% 42%)` }}
      >
        {p.name
          .split(" ")
          .map((w) => w[0])
          .join("")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
        <p className="truncate text-xs text-ink3">{p.email}</p>
      </div>
      <span className="chip hidden sm:inline-flex">{p.role}</span>
      <span className="w-14 text-right font-mono text-xs text-ink3">#{p.id + 1}</span>
    </div>
  );
}

export default function VirtualList() {
  const [virtualized, setVirtualized] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const [jump, setJump] = useState("5000");
  const [ms, setMs] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);

  // @region window
  // Which rows are (almost) visible? Plain arithmetic on the scroll position — no DOM measuring.
  const first = virtualized ? Math.max(0, Math.floor(scrollTop / ROW) - OVERSCAN) : 0;
  const last = virtualized ? Math.min(TOTAL, Math.ceil((scrollTop + HEIGHT) / ROW) + OVERSCAN) : NAIVE_LIMIT;
  const rows = PEOPLE.slice(first, last);
  // @endregion

  // @region scroll
  // The browser owns the scroll position. We READ it from the event, and use a ref to WRITE it.
  function onScroll(e: UIEvent<HTMLDivElement>) {
    setScrollTop(e.currentTarget.scrollTop);
  }

  function jumpToRow() {
    const n = Math.min(Math.max(parseInt(jump, 10) || 1, 1), TOTAL) - 1;
    scroller.current?.scrollTo({ top: n * ROW, behavior: "smooth" });
  }
  // @endregion

  function toggle() {
    startedAt.current = performance.now();
    setVirtualized((v) => !v);
    setScrollTop(0);
    scroller.current?.scrollTo({ top: 0 });
  }

  // @region measure
  // useLayoutEffect runs right after React has updated the DOM (before paint) —
  // a good moment to measure how long that render + commit took.
  useLayoutEffect(() => {
    if (startedAt.current) {
      setMs(performance.now() - startedAt.current);
      startedAt.current = 0;
    }
  }, [virtualized]);
  // @endregion

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-5 py-8 lg:grid-cols-[1fr_16rem]">
      <div className="card overflow-hidden">
        <div
          ref={scroller}
          onScroll={virtualized ? onScroll : undefined}
          className="overflow-auto"
          style={{ height: HEIGHT }}
          aria-label="People list"
          tabIndex={0}
        >
          {virtualized ? (
            // A tall spacer gives the scrollbar its true size; only the visible slice is really rendered.
            <div style={{ height: TOTAL * ROW, position: "relative" }}>
              <div style={{ transform: `translateY(${first * ROW}px)` }}>
                {rows.map((p) => (
                  <Row key={p.id} p={p} />
                ))}
              </div>
            </div>
          ) : (
            rows.map((p) => <Row key={p.id} p={p} />)
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <Rows3 size={16} className="text-brand" /> Rows in the DOM
          </p>
          <p className="font-display text-4xl font-bold tabular-nums text-gradient">{rows.length.toLocaleString()}</p>
          <p className="mt-1 text-xs text-ink3">of {TOTAL.toLocaleString()} total rows</p>

          <label className="mt-5 flex cursor-pointer items-center justify-between rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm">
            <span className="font-semibold text-ink">Virtualise</span>
            <input type="checkbox" className="h-4 w-4" checked={virtualized} onChange={toggle} />
          </label>
          {!virtualized && (
            <p className="mt-2 text-xs leading-relaxed text-ink3">
              Naive mode renders the first {NAIVE_LIMIT.toLocaleString()} rows at once. Try scrolling — and imagine 10,000.
            </p>
          )}

          <p className="mt-4 flex items-center gap-2 text-xs text-ink3">
            <Gauge size={14} className="text-brand" />
            {ms === null ? "Toggle the switch to measure a render" : `Last switch rendered in ${ms.toFixed(1)} ms`}
          </p>
        </div>

        <div className="card p-5">
          <p className="mb-2 text-sm font-semibold text-ink">Jump to row</p>
          <div className="flex gap-2">
            <input
              className="input"
              inputMode="numeric"
              value={jump}
              onChange={(e) => setJump(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && jumpToRow()}
              aria-label="Row number"
            />
            <button className="btn btn-soft btn-sm" onClick={jumpToRow}>
              Go
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
