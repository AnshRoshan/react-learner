import { memo, useDeferredValue, useState } from "react";
import { Loader } from "lucide-react";

const WORDS = [
  "nebula", "quasar", "photon", "orbit", "comet", "pulsar", "galaxy", "eclipse", "aurora", "meteor",
  "cosmos", "zenith", "stellar", "lunar", "solar", "vector", "plasma", "fusion", "gravity", "horizon",
];
const ITEMS = Array.from({ length: 200 }, (_, i) => `${WORDS[i % WORDS.length]}-${i + 1}`);

/** Makes a component deliberately slow (0.5 ms), like an expensive real-world row. */
function burn(ms: number) {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    /* simulate heavy rendering work */
  }
}

function SlowRow({ text }: { text: string }) {
  burn(0.5);
  return <li className="truncate rounded-lg border border-line bg-surface px-2.5 py-1.5 font-mono text-xs text-ink2">{text}</li>;
}

const SlowList = memo(function SlowList({ query }: { query: string }) {
  const q = query.trim().toLowerCase();
  const rows = q ? ITEMS.filter((x) => x.includes(q)) : ITEMS;
  return (
    <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map((t) => (
        <SlowRow key={t} text={t} />
      ))}
    </ul>
  );
});

export default function ConcurrentLab() {
  const [query, setQuery] = useState("");
  const [deferOn, setDeferOn] = useState(true);
  const deferred = useDeferredValue(query);
  const shown = deferOn ? deferred : query;
  const stale = shown !== query;

  return (
    <div className="space-y-5 p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="input max-w-sm"
          placeholder="Type quickly: nebula, comet, 1…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter the slow list"
        />
        <label className="chip cursor-pointer select-none">
          <input type="checkbox" checked={deferOn} onChange={(e) => setDeferOn(e.target.checked)} />
          useDeferredValue(query)
        </label>
        <span className={`chip transition ${stale ? "text-warn" : "text-ink3"}`}>
          <Loader size={12} className={stale ? "animate-spin" : ""} />
          {stale ? "list is catching up…" : "list is up to date"}
        </span>
      </div>

      <p className="text-[13px] leading-relaxed text-ink3">
        Every row takes ~0.5&nbsp;ms to render <i>on purpose</i>, so re-rendering the list costs ~100&nbsp;ms.{" "}
        {deferOn ? (
          <>
            With deferral <b className="text-ok">on</b>, typing stays instant: React renders the urgent update (the
            input) first, then works on the list in the background and throws that work away if you type again.
          </>
        ) : (
          <>
            With deferral <b className="text-bad">off</b>, each keystroke blocks the page until the whole list has
            rendered — type fast and feel the lag.
          </>
        )}
      </p>

      <div className={`transition-opacity duration-200 ${stale ? "opacity-50" : "opacity-100"}`}>
        <SlowList query={shown} />
      </div>
    </div>
  );
}
