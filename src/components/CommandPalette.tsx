import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Atom, BookOpen, Info, LayoutGrid, Search, type LucideIcon } from "lucide-react";
import { navigate } from "../lib/router";
import { lessons } from "../data/curriculum";

interface Item {
  id: string;
  title: string;
  hint: string;
  href: string;
  icon: LucideIcon;
  group: string;
}

const PAGES: Item[] = [
  { id: "page:home", title: "Home", hint: "Start here", href: "/", icon: Atom, group: "Page" },
  { id: "page:theory", title: "How React works", hint: "All theory chapters and labs", href: "/theory", icon: BookOpen, group: "Page" },
  { id: "page:projects", title: "Projects", hint: "Every mini project", href: "/projects", icon: LayoutGrid, group: "Page" },
  { id: "page:about", title: "About", hint: "Credits, stack and your progress", href: "/about", icon: Info, group: "Page" },
];

export default function CommandPalette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo<Item[]>(
    () => [
      ...PAGES,
      ...lessons.map((l) => ({
        id: l.id,
        title: l.title,
        hint: l.tagline,
        href: l.href,
        icon: l.icon,
        group: l.kind === "theory" ? "Lab" : "Project",
      })),
    ],
    [],
  );

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? items.filter((i) => `${i.title} ${i.hint} ${i.group}`.toLowerCase().includes(s)) : items;
  }, [q, items]);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(item?: Item) {
    if (!item) return;
    navigate(item.href);
    onClose();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      go(results[active]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex animate-fade items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search lessons"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-xl animate-pop overflow-hidden rounded-2xl border border-line2 bg-solid shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={18} className="text-ink3" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search labs, projects, concepts…"
            className="h-14 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink3"
            aria-label="Search"
          />
          <span className="kbd">esc</span>
        </div>

        <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink3">Nothing matches “{q}”.</p>}
          {results.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                data-active={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  i === active ? "bg-surface2" : ""
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                    i === active ? "bg-brand text-onbrand" : "bg-surface2 text-ink2"
                  }`}
                >
                  <Icon size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{item.title}</span>
                  <span className="block truncate text-xs text-ink3">{item.hint}</span>
                </span>
                <span className="chip !text-[10px] uppercase tracking-wider">{item.group}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
