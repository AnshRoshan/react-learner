import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ = [
  {
    id: "vdom",
    q: "What is the virtual DOM?",
    a: "It's not a separate technology — just the tree of plain objects (React elements) your components return. React compares the previous and next trees and applies only the differences to the real DOM.",
  },
  {
    id: "rerender",
    q: "Why does my component re-render?",
    a: "Because its state changed, its parent re-rendered, or a context it reads changed. Re-rendering means calling your function again — it doesn't necessarily touch the DOM.",
  },
  {
    id: "hooks",
    q: "What is a hook?",
    a: "A function whose name starts with 'use' that lets a function component tap into React features — state, effects, refs, context — by remembering values in numbered slots between renders.",
  },
  {
    id: "effect",
    q: "Do I always need useEffect?",
    a: "No. Derive values during render and respond to user actions in event handlers. Use effects only to synchronise with something outside React: timers, subscriptions, the network, the DOM.",
  },
  {
    id: "keys",
    q: "Why do lists need keys?",
    a: "Keys give each item a stable identity so React can match old and new children even when the list is reordered, filtered or inserted into.",
  },
];

type FaqItem = (typeof FAQ)[number];

// @region item
// A purely presentational component: it owns NO state.
// It receives `open` and `onToggle` from its parent.
function AccordionItem({ item, open, onToggle }: { item: FaqItem; open: boolean; onToggle: () => void }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
        open ? "border-brand/50 bg-brand/[0.06]" : "border-line bg-surface"
      }`}
    >
      <h3>
        <button
          id={`trigger-${item.id}`}
          aria-expanded={open}
          aria-controls={`panel-${item.id}`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <span className="font-display text-[15px] font-semibold text-ink">{item.q}</span>
          <ChevronDown
            size={18}
            className={`shrink-0 text-brand transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      {/* Animating 0fr → 1fr lets the browser animate to the content's natural height */}
      <div
        id={`panel-${item.id}`}
        role="region"
        aria-labelledby={`trigger-${item.id}`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-ink2">{item.a}</p>
        </div>
      </div>
    </div>
  );
}
// @endregion

export default function Accordion() {
  // @region state
  const [multiple, setMultiple] = useState(false);
  const [openIds, setOpenIds] = useState<string[]>(["vdom"]);
  // @endregion

  // @region toggle
  function toggle(id: string) {
    setOpenIds((ids) => {
      if (ids.includes(id)) return ids.filter((x) => x !== id); // close it
      return multiple ? [...ids, id] : [id]; // open it (and close the rest in single mode)
    });
  }

  function switchMode(next: boolean) {
    setMultiple(next);
    if (!next) setOpenIds((ids) => ids.slice(0, 1)); // single mode keeps at most one open
  }
  // @endregion

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-display text-xl font-bold text-ink">React, quickly answered</h4>
          <p className="text-sm text-ink3">
            {openIds.length} of {FAQ.length} open
          </p>
        </div>
        <div className="glass inline-flex rounded-xl p-1 text-sm font-semibold">
          {[
            { v: false, label: "Single" },
            { v: true, label: "Multiple" },
          ].map((m) => (
            <button
              key={m.label}
              onClick={() => switchMode(m.v)}
              className={`rounded-lg px-4 py-1.5 transition ${
                multiple === m.v ? "bg-brand text-onbrand" : "text-ink2 hover:text-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {FAQ.map((item) => (
          <AccordionItem key={item.id} item={item} open={openIds.includes(item.id)} onToggle={() => toggle(item.id)} />
        ))}
      </div>

      <p className="mt-5 text-center font-mono text-xs text-ink3">openIds = {JSON.stringify(openIds)}</p>
    </div>
  );
}
