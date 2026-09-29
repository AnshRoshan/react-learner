import { useState } from "react";
import { ArrowUp, Plus, RotateCcw, Shuffle, Trash } from "lucide-react";

interface Item {
  id: number;
  name: string;
}
type Strategy = "id" | "index";
interface Diff {
  reused: number;
  created: number;
  removed: number;
  swapped: number;
}

const INITIAL: Item[] = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Grace" },
  { id: 3, name: "Linus" },
  { id: 4, name: "Margaret" },
];
const EXTRA = ["Alan", "Barbara", "Dennis", "Hedy", "Ken", "Radia", "Tim", "Vint"];

let nextId = 100;
let instances = 0;

/** Each mounted Row gets a number, so you can SEE whether React reused or recreated it. */
function Row({ item }: { item: Item }) {
  const [instance] = useState(() => ++instances);
  return (
    <li className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
      <span className="w-[4.6rem] shrink-0 truncate text-sm font-semibold text-ink">{item.name}</span>
      <span className="chip shrink-0 font-mono" title="Which component instance is behind this row">
        instance #{instance}
      </span>
      <input className="input !py-1.5" placeholder="type a note…" aria-label={`Note for ${item.name}`} />
    </li>
  );
}

const keyed = (items: Item[], s: Strategy) => items.map((it, i) => ({ key: s === "id" ? it.id : i, itemId: it.id }));

function diffOf(prev: Item[], next: Item[], s: Strategy): Diff {
  const a = keyed(prev, s);
  const b = keyed(next, s);
  const reused = b.filter((n) => a.some((p) => p.key === n.key));
  return {
    reused: reused.length,
    created: b.length - reused.length,
    removed: a.length - reused.length,
    swapped: reused.filter((n) => a.find((p) => p.key === n.key)?.itemId !== n.itemId).length,
  };
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "bad" | "ok" }) {
  return (
    <div className="rounded-xl border border-line bg-bg/40 p-3 text-center">
      <p className={`font-display text-2xl font-bold tabular-nums ${tone === "bad" ? "text-bad" : tone === "ok" ? "text-ok" : "text-ink"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-ink3">{label}</p>
    </div>
  );
}

export default function KeysLab() {
  // Number the instances from #1 every time the lab (re)mounts
  useState(() => {
    instances = 0;
  });
  const [items, setItems] = useState<Item[]>(INITIAL);
  const [strategy, setStrategy] = useState<Strategy>("index");
  const [diff, setDiff] = useState<Diff | null>(null);
  const [run, setRun] = useState(0);

  function apply(next: Item[]) {
    setDiff(diffOf(items, next, strategy));
    setItems(next);
  }
  function reset(s: Strategy) {
    instances = 0;
    setStrategy(s);
    setItems(INITIAL);
    setDiff(null);
    setRun((r) => r + 1);
  }
  function shuffle() {
    apply(
      items
        .map((v) => ({ v, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .map((x) => x.v),
    );
  }
  function addTop() {
    const name = EXTRA[nextId % EXTRA.length];
    apply([{ id: nextId++, name }, ...items]);
  }

  return (
    <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.45fr_1fr]">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-ink">Give each row</span>
          {(["index", "id"] as const).map((s) => (
            <button
              key={s}
              onClick={() => reset(s)}
              className={`rounded-xl border px-3 py-1.5 font-mono text-[13px] font-semibold transition ${
                strategy === s ? "border-brand bg-brand/15 text-brand" : "border-line bg-surface text-ink2 hover:border-line2"
              }`}
            >
              key={s === "index" ? "{index}" : "{item.id}"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="btn btn-soft btn-sm" onClick={() => apply([...items].reverse())}>
            <ArrowUp size={14} /> Reverse
          </button>
          <button className="btn btn-soft btn-sm" onClick={shuffle}>
            <Shuffle size={14} /> Shuffle
          </button>
          <button className="btn btn-primary btn-sm" onClick={addTop}>
            <Plus size={14} /> Add to top
          </button>
          <button className="btn btn-soft btn-sm" onClick={() => apply(items.slice(1))} disabled={!items.length}>
            <Trash size={14} /> Remove first
          </button>
          <button className="btn btn-soft btn-sm" onClick={() => reset(strategy)}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        <ul key={`${strategy}-${run}`} className="space-y-2">
          {items.map((item, i) => (
            <Row key={strategy === "id" ? item.id : i} item={item} />
          ))}
        </ul>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <p className="font-display text-base font-semibold text-ink">What React just did</p>
          {diff ? (
            <>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <Stat label="rows reused" value={diff.reused} />
                <Stat label="rows created" value={diff.created} />
                <Stat label="rows removed" value={diff.removed} />
                <Stat label="reused, but now a different item" value={diff.swapped} tone={diff.swapped ? "bad" : "ok"} />
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-ink2">
                {diff.swapped > 0 ? (
                  <>
                    <b className="text-bad">Bug!</b> React matched rows by <i>position</i>. Those rows kept their DOM
                    node and their typed text, but now show someone else's name.
                  </>
                ) : (
                  <>
                    <b className="text-ok">Correct.</b> Keys follow the data, so each row's instance and typed text
                    moved with its item.
                  </>
                )}
              </p>
            </>
          ) : (
            <p className="mt-3 text-[13px] leading-relaxed text-ink3">
              Type something in a couple of rows, then press <b className="text-ink2">Add to top</b> or{" "}
              <b className="text-ink2">Shuffle</b>. Watch where your text goes — and switch the key strategy to
              compare.
            </p>
          )}
        </div>
        <p className="text-[12.5px] leading-relaxed text-ink3">
          Each row shows an <b className="text-ink2">instance #</b>: the identity of the component behind it. The text
          box is <i>uncontrolled</i>, so its content lives in the DOM node React decides to reuse.
        </p>
      </aside>
    </div>
  );
}
