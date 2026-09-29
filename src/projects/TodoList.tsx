import { useEffect, useReducer, useState, type FormEvent } from "react";
import { Check, GripVertical, Plus, Trash } from "lucide-react";

interface Todo {
  id: string;
  text: string;
  done: boolean;
}
type Filter = "all" | "active" | "done";

type Action =
  | { type: "add"; id: string; text: string }
  | { type: "toggle"; id: string }
  | { type: "remove"; id: string }
  | { type: "edit"; id: string; text: string }
  | { type: "clear-done" }
  | { type: "move"; from: number; to: number };

// @region reducer
// A reducer is a PURE function: (state, action) => next state.
// No mutation, no random values, no fetching — that's what makes it easy to test.
function reducer(todos: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "add":
      return [{ id: action.id, text: action.text, done: false }, ...todos];
    case "toggle":
      return todos.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case "remove":
      return todos.filter((t) => t.id !== action.id);
    case "edit":
      return todos.map((t) => (t.id === action.id ? { ...t, text: action.text } : t));
    case "clear-done":
      return todos.filter((t) => !t.done);
    case "move": {
      const next = todos.slice();
      const [moved] = next.splice(action.from, 1);
      next.splice(action.to, 0, moved);
      return next;
    }
  }
}
// @endregion

// @region persist
// A custom hook: just a function that composes other hooks.
// Any component can now get a persistent reducer in one line.
function usePersistentReducer<S, A>(reducerFn: (state: S, action: A) => S, key: string, fallback: S) {
  const [state, dispatch] = useReducer(reducerFn, fallback, (initial: S) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as S) : initial; // read once, on first render
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state)); // sync to the outside world after every change
    } catch {
      /* storage unavailable */
    }
  }, [key, state]);

  return [state, dispatch] as const;
}
// @endregion

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const SEED: Todo[] = [
  { id: "s1", text: "Read the “State is a snapshot” chapter", done: true },
  { id: "s2", text: "Drag me by the handle to reorder", done: false },
  { id: "s3", text: "Double-click a task to edit it", done: false },
  { id: "s4", text: "Refresh the page — I'm saved in localStorage", done: false },
];

export default function TodoList() {
  const [todos, dispatch] = usePersistentReducer(reducer, "rp:todos:v1", SEED);
  const [filter, setFilter] = useState<Filter>("all");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  // @region derived
  // Filtered list and counters are computed, not stored.
  const visible = todos.filter((t) => filter === "all" || (filter === "done" ? t.done : !t.done));
  const remaining = todos.filter((t) => !t.done).length;
  const doneCount = todos.length - remaining;
  // @endregion

  // @region dnd
  function handleDrop(to: number) {
    if (dragFrom !== null && dragFrom !== to) dispatch({ type: "move", from: dragFrom, to });
    setDragFrom(null);
  }
  // Each <li> also needs onDragOver={e => e.preventDefault()} — otherwise the drop event never fires.
  // @endregion

  function submit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    dispatch({ type: "add", id: uid(), text }); // generate the id HERE so the reducer stays pure
    setDraft("");
  }

  const canDrag = filter === "all";

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <div className="card p-5 sm:p-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h4 className="font-display text-xl font-bold text-ink">Today</h4>
            <p className="text-sm text-ink3">
              {remaining} left · {doneCount} done
            </p>
          </div>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-line2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-brand2 transition-all duration-500"
              style={{ width: `${todos.length ? (doneCount / todos.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <form onSubmit={submit} className="flex gap-2">
          <input
            className="input"
            placeholder="What needs doing?"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="New task"
          />
          <button className="btn btn-primary !px-4" aria-label="Add task">
            <Plus size={18} />
          </button>
        </form>

        <div className="mt-4 flex gap-1.5">
          {(["all", "active", "done"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                filter === f ? "bg-brand/15 text-brand" : "text-ink3 hover:text-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <ul className="mt-3 space-y-2">
          {visible.map((todo, i) => (
            <li
              key={todo.id}
              draggable={canDrag && editing !== todo.id}
              onDragStart={() => setDragFrom(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              onDragEnd={() => setDragFrom(null)}
              className={`group flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 transition ${
                dragFrom === i ? "opacity-40" : "hover:border-line2"
              }`}
            >
              <GripVertical size={16} className={canDrag ? "cursor-grab text-ink3" : "text-line2"} />
              <button
                onClick={() => dispatch({ type: "toggle", id: todo.id })}
                aria-label={todo.done ? "Mark as not done" : "Mark as done"}
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${
                  todo.done ? "border-brand bg-brand text-onbrand" : "border-line2"
                }`}
              >
                {todo.done && <Check size={13} strokeWidth={3} />}
              </button>
              {editing === todo.id ? (
                <input
                  autoFocus
                  className="input !py-1"
                  defaultValue={todo.text}
                  aria-label="Edit task"
                  onBlur={(e) => {
                    const text = e.target.value.trim();
                    if (text) dispatch({ type: "edit", id: todo.id, text });
                    setEditing(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") setEditing(null);
                  }}
                />
              ) : (
                <span
                  onDoubleClick={() => setEditing(todo.id)}
                  className={`flex-1 cursor-text text-sm ${todo.done ? "text-ink3 line-through" : "text-ink"}`}
                >
                  {todo.text}
                </span>
              )}
              <button
                onClick={() => dispatch({ type: "remove", id: todo.id })}
                aria-label="Delete task"
                className="text-ink3 opacity-0 transition hover:text-bad focus:opacity-100 group-hover:opacity-100"
              >
                <Trash size={16} />
              </button>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="rounded-xl border border-dashed border-line py-8 text-center text-sm text-ink3">
              Nothing here. Enjoy the calm ✨
            </li>
          )}
        </ul>

        {doneCount > 0 && (
          <button
            onClick={() => dispatch({ type: "clear-done" })}
            className="mt-4 text-xs font-semibold text-ink3 transition hover:text-bad"
          >
            Clear {doneCount} completed
          </button>
        )}
      </div>
    </div>
  );
}
