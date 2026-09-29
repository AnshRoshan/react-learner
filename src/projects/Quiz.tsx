import { useReducer } from "react";
import { Award, Check, RotateCcw, X } from "lucide-react";

interface Question {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

const QUESTIONS: Question[] = [
  {
    q: "Which hook stores a value that survives re-renders WITHOUT causing a re-render when it changes?",
    options: ["useState", "useRef", "useMemo", "useContext"],
    answer: 1,
    why: "Mutating ref.current doesn't notify React, so nothing re-renders — ideal for timers, DOM nodes and other 'instance variables'.",
  },
  {
    q: "What is the best value to use as a `key` in a list that can be re-ordered?",
    options: ["The array index", "Math.random()", "A stable unique id from your data", "The item's text"],
    answer: 2,
    why: "Stable ids follow the item; indexes belong to the slot and random keys remount everything every render.",
  },
  {
    q: "When does `useEffect(fn, [])` run its setup function?",
    options: ["Before every render", "After the first commit (mount)", "Only when props change", "Never in production"],
    answer: 1,
    why: "An empty dependency array means 'synchronise once': after mount, with cleanup on unmount.",
  },
  {
    q: "What does `React.memo` compare to decide whether to skip a re-render?",
    options: ["State", "The rendered output", "Props, shallowly with Object.is", "The component's name"],
    answer: 2,
    why: "If every prop is identical (by Object.is) to last time, React reuses the previous result.",
  },
  {
    q: "Which is the correct way to add an item to an array held in state?",
    options: ["items.push(x)", "setItems([...items, x])", "items[items.length] = x", "setItems(items.push(x))"],
    answer: 1,
    why: "Create a new array. Mutating the existing one leaves the same reference, so React may not notice the change.",
  },
  {
    q: "Which React 19 hook shows an instant UI update that rolls back automatically if the action fails?",
    options: ["useTransition", "useDeferredValue", "useOptimistic", "useSyncExternalStore"],
    answer: 2,
    why: "useOptimistic layers a temporary value over real state for the duration of an Action.",
  },
  {
    q: "What happens when a parent re-renders and its (non-memo) child receives identical props?",
    options: ["The child is skipped", "The child re-renders too", "The child unmounts", "React throws a warning"],
    answer: 1,
    why: "Re-rendering cascades down the tree by default. memo is how you opt out.",
  },
  {
    q: "Where should you respond to a button click by fetching or saving data?",
    options: ["Inside the render body", "In the event handler", "In a useMemo", "In a class constructor"],
    answer: 1,
    why: "Handlers are for reacting to user actions; render must stay pure.",
  },
];

interface State {
  status: "intro" | "playing" | "finished";
  index: number;
  picked: number | null; // the option chosen for the CURRENT question
  answers: number[]; // every option chosen so far — the score is derived from this
}

type Action = { type: "start" } | { type: "pick"; option: number } | { type: "next" } | { type: "restart" };

const INITIAL: State = { status: "intro", index: 0, picked: null, answers: [] };

// @region reducer
// One `status` field instead of a pile of booleans: impossible combinations
// (finished AND on question 3) simply can't be represented.
function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "start":
      return { ...INITIAL, status: "playing" };
    case "pick":
      if (s.status !== "playing" || s.picked !== null) return s; // ignore double clicks
      return { ...s, picked: a.option, answers: [...s.answers, a.option] };
    case "next":
      if (s.picked === null) return s;
      return s.index + 1 >= QUESTIONS.length
        ? { ...s, status: "finished" }
        : { ...s, index: s.index + 1, picked: null };
    case "restart":
      return INITIAL;
  }
}
// @endregion

export default function Quiz() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const question = QUESTIONS[state.index];

  // @region derived
  // The score is never stored — it's calculated from the answers on every render.
  const score = state.answers.reduce((n, choice, i) => n + (choice === QUESTIONS[i].answer ? 1 : 0), 0);
  // @endregion

  if (state.status === "intro") {
    return (
      <div className="mx-auto max-w-lg px-5 py-12 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand/15 text-3xl">🧠</span>
        <h4 className="mt-5 font-display text-2xl font-bold text-ink">How well do you know React?</h4>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink2">
          {QUESTIONS.length} questions on state, rendering, hooks and React 19. Instant feedback after every answer.
        </p>
        <button className="btn btn-primary mt-7" onClick={() => dispatch({ type: "start" })}>
          Start the quiz
        </button>
      </div>
    );
  }

  if (state.status === "finished") {
    const pct = score / QUESTIONS.length;
    return (
      <div className="mx-auto max-w-xl px-5 py-10">
        <div className="card p-6 text-center sm:p-8">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/15 text-brand">
            <Award size={28} />
          </span>
          <p className="mt-4 font-display text-4xl font-bold text-gradient">
            {score} / {QUESTIONS.length}
          </p>
          <p className="mt-1 text-sm text-ink2">
            {pct === 1 ? "Flawless. You think in React." : pct >= 0.6 ? "Solid! Review the ones you missed." : "Good start — the theory labs will help."}
          </p>
          <button className="btn btn-primary btn-sm mt-5" onClick={() => dispatch({ type: "restart" })}>
            <RotateCcw size={14} /> Play again
          </button>
        </div>
        <ul className="mt-5 space-y-2">
          {QUESTIONS.map((item, i) => {
            const ok = state.answers[i] === item.answer;
            return (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
                <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${ok ? "bg-ok/20 text-ok" : "bg-bad/20 text-bad"}`}>
                  {ok ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                </span>
                <span className="text-ink2">{item.q}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-ink3">
          <span>
            Question {state.index + 1} of {QUESTIONS.length}
          </span>
          <span>Score {score}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-brand2 transition-all duration-500"
            style={{ width: `${((state.index + (state.picked !== null ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <p className="font-display text-lg font-semibold leading-snug text-ink">{question.q}</p>
        <div className="mt-5 grid gap-2.5">
          {question.options.map((opt, i) => {
            const answered = state.picked !== null;
            const isAnswer = i === question.answer;
            const isPicked = i === state.picked;
            const style = !answered
              ? "border-line bg-surface hover:border-line2 hover:bg-surface2"
              : isAnswer
                ? "border-ok/60 bg-ok/10"
                : isPicked
                  ? "border-bad/60 bg-bad/10"
                  : "border-line bg-surface opacity-50";
            return (
              <button
                key={opt}
                disabled={answered}
                onClick={() => dispatch({ type: "pick", option: i })}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm text-ink transition ${style}`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-surface2 font-mono text-xs font-bold text-ink2">
                  {answered && isAnswer ? <Check size={14} className="text-ok" /> : answered && isPicked ? <X size={14} className="text-bad" /> : "ABCD"[i]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {state.picked !== null && (
          <div className="mt-5 animate-fade">
            <p className="rounded-xl bg-surface2 p-3.5 text-sm leading-relaxed text-ink2">
              <span className="font-semibold text-ink">{state.picked === question.answer ? "Correct. " : "Not quite. "}</span>
              {question.why}
            </p>
            <button className="btn btn-primary btn-sm mt-4" onClick={() => dispatch({ type: "next" })}>
              {state.index + 1 >= QUESTIONS.length ? "See results" : "Next question"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
