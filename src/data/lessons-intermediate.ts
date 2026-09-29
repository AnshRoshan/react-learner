import type { LessonContent } from "./types";

export const intermediate: Record<string, LessonContent> = {
  /* ------------------------------------------------------------ Todo */
  "todo-list": {
    learn: [
      "`useReducer` for state with many kinds of updates",
      "Pure reducers: `(state, action) → next state`",
      "Building a **custom hook** that composes `useReducer` + `useEffect`",
      "Derived data: filtered lists and counters",
      "Native drag & drop events in React",
    ],
    lesson: [
      {
        t: "p",
        text: "When a component has several related `useState`s and many handlers that update them in similar ways, the logic gets scattered. A **reducer** consolidates every possible change into one pure function.",
      },
      {
        t: "code",
        file: "reducer.js",
        code: `// (state, action) => nextState — pure, testable, no React needed
function reducer(todos, action) {
  switch (action.type) {
    case 'add':    return [newTodo, ...todos];
    case 'toggle': return todos.map(t => t.id === action.id ? { ...t, done: !t.done } : t);
    case 'remove': return todos.filter(t => t.id !== action.id);
  }
}`,
      },
      {
        t: "callout",
        tone: "key",
        title: "Components say what happened; reducers decide what changes",
        text: "The UI dispatches `{ type: 'toggle', id }`. It has no idea how state changes. That separation keeps components small and logic testable.",
      },
      {
        t: "callout",
        tone: "info",
        title: "Custom hooks",
        text: "`usePersistentReducer` is just a function that calls `useReducer` and `useEffect`. Extracting it means any component can gain persistence in one line.",
      },
    ],
    steps: [
      {
        title: "Write the reducer",
        region: "reducer",
        body: "Every way the list can change is one `case`. It never mutates: `map`, `filter` and the spread operator return new arrays. Even 'move' copies the array before splicing.",
      },
      {
        title: "Compose hooks into your own",
        region: "persist",
        body: "`useReducer`'s third argument is a lazy initialiser that reads localStorage once. An effect then writes the state back after every change. Wrapping both in `usePersistentReducer` gives every component persistence for free.",
      },
      {
        title: "Derive the visible list",
        region: "derived",
        body: "The filtered list and the counters are calculated on every render from `todos` and `filter`. There's no `visibleTodos` state to keep in sync.",
      },
      {
        title: "Drag and drop with plain events",
        region: "dnd",
        body: "Remember the dragged index in state, and dispatch a `move` action on drop. The browser requires `preventDefault()` on `dragover`, otherwise `drop` never fires.",
      },
    ],
    mistakes: [
      {
        title: "Mutating inside the reducer",
        text: "`todos.push(x)` returns the same array reference; React bails out and nothing re-renders. Always return new arrays and objects.",
      },
      {
        title: "Side effects in reducers",
        text: "Reducers must be pure — no fetch, no random ids, no `Date.now()`. Generate the id before dispatching and pass it in the action.",
      },
    ],
    challenges: [
      "Add due dates and sort by them.",
      "Add an **Undo delete** toast using another reducer action.",
      "Sync todos across browser tabs with the `storage` event.",
    ],
    quiz: [
      {
        q: "What must a reducer never do?",
        options: ["Return a new array", "Use a switch statement", "Mutate state or cause side effects", "Take an action argument"],
        answer: 2,
        why: "Reducers must be pure: the same inputs always give the same output, with no mutation.",
      },
      {
        q: "Why generate the todo `id` before calling dispatch?",
        options: ["It's faster", "Reducers must be pure, and random ids are a side effect", "dispatch requires it", "Keys must be numbers"],
        answer: 1,
        why: "React may call reducers twice in development; an impure reducer would give inconsistent results.",
      },
    ],
    theory: ["hooks-internals", "reconciliation"],
  },

  /* ------------------------------------------------------------ Pomodoro */
  pomodoro: {
    learn: [
      "`useEffect` with **cleanup** for timers",
      "The `useInterval` custom hook and the **latest-ref** pattern",
      "**Deriving time from timestamps** instead of counting ticks",
      "Syncing `document.title` — a real outside-world effect",
    ],
    lesson: [
      {
        t: "p",
        text: "Timers are the classic effect: start something when a value changes, stop it when it changes again. This project shows the *correct* way — and two subtle traps.",
      },
      {
        t: "callout",
        tone: "warn",
        title: "Trap 1 — stale closures",
        text: "`setInterval(() => setCount(count + 1), 1000)` inside an effect captures the `count` from the render it was created in. Use the updater form, or the latest-ref pattern used by `useInterval` here.",
      },
      {
        t: "callout",
        tone: "warn",
        title: "Trap 2 — drifting clocks",
        text: "Browsers throttle timers in background tabs, so counting 'ticks' makes the clock run slow. Store the **end timestamp** and derive the remaining time from `Date.now()` on every tick.",
      },
      {
        t: "callout",
        tone: "key",
        title: "Cleanup = undo",
        text: "Whatever the effect started, the cleanup must stop. Pausing, switching mode or leaving the page all run the cleanup.",
      },
    ],
    steps: [
      {
        title: "A reusable useInterval hook",
        region: "useInterval",
        body: "One effect keeps a ref pointing at the newest callback; a second creates the interval, depending only on `delay`. The interval never restarts because the callback changed, yet it always calls the freshest one.",
      },
      {
        title: "State: a timestamp, not a counter",
        region: "state",
        body: "While running we store `endAt` — the moment the timer will finish. While paused we store the milliseconds left. `now` exists only to trigger re-renders each tick.",
      },
      {
        title: "Derive everything else",
        region: "derived",
        body: "Remaining time is `endAt - now`. Progress and the mm:ss label come from it. Because we compare real timestamps, throttled timers only make the display update less often — never drift.",
      },
      {
        title: "Sync the tab title",
        region: "title",
        body: "An effect that mirrors the countdown into `document.title`. Its cleanup restores the previous title, so leaving the page (or pausing) leaves no trace behind.",
      },
    ],
    mistakes: [
      {
        title: "No cleanup",
        text: "Forgetting `clearInterval` leaves timers running after unmount or pause — the classic memory leak.",
      },
      {
        title: "Counting ticks",
        text: "`setSeconds(s => s - 1)` every second drifts when the tab is throttled. Derive from a timestamp instead.",
      },
    ],
    challenges: [
      "Play a sound when a session ends.",
      "Add a settings dialog for custom durations.",
      "Automatically start the next session after a 3-second countdown.",
    ],
    quiz: [
      {
        q: "What does the cleanup function of the interval effect do?",
        options: ["Restarts the timer", "Calls clearInterval so no timer outlives the effect", "Resets state", "Nothing"],
        answer: 1,
        why: "React runs it before re-running the effect and on unmount.",
      },
      {
        q: "Why store `endAt` (a timestamp) rather than decrementing a counter?",
        options: ["Timestamps are smaller", "Counters drift when timers are throttled; timestamps stay accurate", "It's required by useEffect", "React can't store numbers"],
        answer: 1,
        why: "The remaining time is computed from the real clock on every tick, so throttling doesn't matter.",
      },
    ],
    theory: ["effects", "hooks-internals"],
  },

  /* ------------------------------------------------------------ Currency */
  "currency-converter": {
    learn: [
      "Fetching in `useEffect` with **AbortController**",
      "Modelling async state: loading / ready / error",
      "Race conditions — and why cleanup fixes them",
      "Extracting a **custom hook** (`useRates`)",
      "Graceful fallback to offline data",
    ],
    lesson: [
      {
        t: "p",
        text: "Data fetching is where effects and state meet the network. The naive version works… until the user changes currency twice quickly and an *old* response arrives after the new one.",
      },
      {
        t: "callout",
        tone: "warn",
        title: "The race condition",
        text: "Request A (USD) starts, request B (EUR) starts, B finishes first, then A finishes and overwrites B's result. The screen shows USD rates while the dropdown says EUR.",
      },
      {
        t: "callout",
        tone: "key",
        title: "Cleanup cancels the past",
        text: "Each effect run creates an `AbortController`. When `base` changes, the cleanup aborts the previous request, so stale responses can never land.",
      },
      { t: "h", text: "Model the states explicitly" },
      {
        t: "code",
        file: "types.ts",
        code: `type RatesState =
  | { status: 'loading' }
  | { status: 'ready'; rates: Record<string, number>; source: 'live' | 'offline' };`,
      },
      {
        t: "p",
        text: "A discriminated union makes impossible states impossible: you can't be 'loading' *and* hold rates at the same time.",
      },
    ],
    steps: [
      {
        title: "Type the states",
        region: "types",
        body: "Each `status` carries exactly the data that makes sense for it. TypeScript then forces every consumer to check the status before touching `rates`.",
      },
      {
        title: "Fetch inside a custom hook",
        region: "hook",
        body: "The hook owns the request lifecycle: create an `AbortController`, fetch, store the result, and abort in cleanup. An `AbortError` is expected (we caused it), so it's ignored. Real failures fall back to sample rates.",
      },
      {
        title: "Derive the conversion",
        region: "derived",
        body: "The converted amount is just `amount × rate`, computed during render. No `useEffect` copying values into more state — fewer renders and no chance of stale numbers.",
      },
    ],
    mistakes: [
      {
        title: "Ignoring AbortError",
        text: "Aborting rejects the fetch promise with `AbortError`. Treat it as expected — it isn't a real failure.",
      },
      {
        title: "No loading or error UI",
        text: "Real networks are slow and flaky. Always render all the states, including 'loading' and 'failed, here's a fallback'.",
      },
    ],
    challenges: [
      "Cache rates for 10 minutes so switching back is instant.",
      "Add a 7-day trend sparkline using the `/v1/{start}..{end}` endpoint.",
      "Debounce the amount input and store recent conversions.",
    ],
    quiz: [
      {
        q: "What problem does AbortController solve here?",
        options: ["CORS errors", "Stale responses overwriting newer ones", "Slow networks", "JSON parsing"],
        answer: 1,
        why: "Aborting the old request in cleanup prevents an out-of-order response from updating state.",
      },
      {
        q: "Why use a discriminated union for the request state?",
        options: ["It's shorter", "It prevents impossible combinations like 'loading with data'", "TypeScript requires it", "It speeds up rendering"],
        answer: 1,
        why: "Each status carries exactly the data that makes sense for it.",
      },
    ],
    theory: ["effects"],
  },

  /* ------------------------------------------------------------ Calculator */
  calculator: {
    learn: [
      "Modelling UI as a **state machine** with `useReducer`",
      "Handling keyboard events with a global listener + cleanup",
      "Keeping numbers as strings to preserve what the user typed",
      "Avoiding `eval` — implementing arithmetic safely",
    ],
    lesson: [
      {
        t: "p",
        text: "A calculator seems like arithmetic, but it's really a small **state machine**: the meaning of a key press depends on the mode you're in — typing the first number, just chose an operator, just pressed equals…",
      },
      {
        t: "callout",
        tone: "key",
        title: "State = mode + data",
        text: "`overwrite` tells the reducer whether the next digit should replace the display (after an operator or equals) or append to it. One boolean encodes the whole machine.",
      },
      {
        t: "callout",
        tone: "warn",
        title: "Never eval user input",
        text: "`eval` would run arbitrary code. Parse and compute explicitly, as `compute()` does.",
      },
      {
        t: "callout",
        tone: "info",
        title: "Numbers as strings",
        text: "The display holds a *string* so users can type `0.` or `1.50` naturally. We only convert to numbers when computing.",
      },
    ],
    steps: [
      {
        title: "One reducer holds every rule",
        region: "reducer",
        body: "Each `case` describes a legal transition: typing digits, choosing operators (including chained ones like `2 + 3 +`), evaluating, clearing. `compute` guards divide-by-zero and `fmt` rounds floating-point noise.",
      },
      {
        title: "One line of state",
        region: "state",
        body: "`useReducer(reducer, INITIAL)` returns the whole machine's state and a `dispatch`. Buttons and the keyboard dispatch the very same actions — so they can never behave differently.",
      },
      {
        title: "A keyboard listener with cleanup",
        region: "keyboard",
        body: "A window `keydown` listener maps keys to the same actions. `dispatch` has a stable identity, so the effect runs once, and the cleanup removes the listener on unmount.",
      },
    ],
    mistakes: [
      {
        title: "Floating-point surprises",
        text: "`0.1 + 0.2` is `0.30000000000000004`. Round with `toPrecision(12)` before displaying.",
      },
      {
        title: "Handling Enter twice",
        text: "If a focused button and your global key listener both handle Enter, the action runs twice. Blur the button after clicking.",
      },
    ],
    challenges: [
      "Add parentheses and a full expression parser (shunting-yard).",
      "Add memory keys (M+, M−, MR).",
      "Make the history tape clickable so results can be reused.",
    ],
    quiz: [
      {
        q: "What does the `overwrite` flag represent?",
        options: ["An error state", "Whether the next digit should replace the display", "The current operator", "The theme"],
        answer: 1,
        why: "After choosing an operator or pressing equals, typing starts a new number.",
      },
      {
        q: "Why is `useReducer` a good fit for a calculator?",
        options: ["It's faster than useState", "Many actions transform related state in interdependent ways", "It supports keyboards", "It avoids re-renders"],
        answer: 1,
        why: "All the rules live in one pure function, making transitions easy to reason about.",
      },
    ],
    theory: ["hooks-internals", "effects"],
  },

  /* ------------------------------------------------------------ Quiz */
  quiz: {
    learn: [
      "Model a whole flow with one **status** and `useReducer`",
      "Make impossible states impossible",
      "Derive the score from stored answers (don't store it)",
      "Reset an entire flow with a single `restart` action",
    ],
    lesson: [
      {
        t: "p",
        text: "A quiz is a tiny flow: intro → questions → results. Beginners model it with a handful of booleans (`started`, `finished`, `showAnswer`…) and then fight combinations that shouldn't exist. Instead, use one **status** field and let the reducer decide which transitions are legal.",
      },
      {
        t: "callout",
        tone: "key",
        title: "Impossible states",
        text: "With `status: 'intro' | 'playing' | 'finished'` you can't be 'finished' and 'on question 3' at the same time — the model won't allow it.",
      },
      {
        t: "callout",
        tone: "tip",
        title: "Store the facts, derive the rest",
        text: "We store the answers the player picked. The score is computed by comparing them with the correct answers during render.",
      },
    ],
    steps: [
      {
        title: "A reducer with guard clauses",
        region: "reducer",
        body: "`pick` ignores repeat clicks (`s.picked !== null`), and `next` refuses to advance before an answer exists. The reducer is the single authority on what may happen when.",
      },
      {
        title: "Derive the score",
        region: "derived",
        body: "`answers` is the source of truth. The score is a `reduce` over it on every render — restart the quiz and the score resets by construction.",
      },
    ],
    mistakes: [
      {
        title: "A pile of booleans",
        text: "`isStarted`, `isFinished` and `isAnswered` can drift into contradictory combinations. One `status` value can't.",
      },
      {
        title: "Storing the score",
        text: "It must be updated in every place answers change. Derive it from `answers` instead.",
      },
    ],
    challenges: [
      "Add a 15-second countdown per question using an effect.",
      "Shuffle questions and options on every run.",
      "Save the best score in `localStorage`.",
    ],
    quiz: [
      {
        q: "Why prefer a single `status` value over several booleans?",
        options: ["It's shorter", "It prevents contradictory combinations", "Booleans are slow", "It avoids re-renders"],
        answer: 1,
        why: "A status holds exactly one value at a time, so impossible states can't be represented.",
      },
      {
        q: "Where should the score come from?",
        options: ["A useState updated on every answer", "Derived from the stored answers during render", "A ref", "localStorage"],
        answer: 1,
        why: "Derived values can't get out of sync with their source.",
      },
    ],
    theory: ["hooks-internals", "declarative-ui"],
  },

  /* ------------------------------------------------------------ Invoice */
  invoice: {
    learn: [
      "Controlled forms: every input's value comes from state",
      "Dynamic lists of inputs (add/remove rows) keyed by **id**",
      "Keeping **raw input strings** and deriving numbers",
      "Derived totals with no extra state",
      "`Intl.NumberFormat` and printing",
    ],
    lesson: [
      {
        t: "p",
        text: "Forms are where React apps spend most of their time. A **controlled input** takes its `value` from state and reports changes through `onChange` — state is the single source of truth.",
      },
      {
        t: "callout",
        tone: "key",
        title: "Store the string, derive the number",
        text: "If you store `Number(e.target.value)`, typing `1.` snaps to `1` and you can never enter decimals. Keep the raw string in state and convert when calculating.",
      },
      {
        t: "callout",
        tone: "tip",
        title: "Totals are not state",
        text: "Subtotal, discount, tax and total are all computed from `items`, `discount` and `taxRate` on every render. There's nothing to keep in sync.",
      },
      {
        t: "callout",
        tone: "warn",
        title: "Keys matter in forms",
        text: "Each row contains inputs. Keyed by `item.id`, removing a row keeps the remaining inputs' text and focus correct. Keyed by index, typed text jumps between rows.",
      },
    ],
    steps: [
      {
        title: "Every field is state",
        region: "state",
        body: "Text fields, the select, tax and discount, and the list of line items all live in state. `useState(() => […])` builds the initial rows once, with unique ids.",
      },
      {
        title: "Update rows by id",
        region: "update",
        body: "`updateItem` maps over the list and patches the row with the matching id. Adding and removing are just spread and filter. No index arithmetic, no mutation.",
      },
      {
        title: "Derive the totals",
        region: "totals",
        body: "Strings become numbers only here, with `|| 0` as a safety net for empty inputs. The preview reads these variables directly, so it always matches the form.",
      },
    ],
    mistakes: [
      {
        title: "Switching between uncontrolled and controlled",
        text: "Passing `value={undefined}` first and a string later makes React warn. Always initialise inputs with a string.",
      },
      {
        title: "Storing computed totals",
        text: "A `total` state variable will drift from the items. Compute it.",
      },
    ],
    challenges: [
      "Add per-line tax rates.",
      "Save invoices in localStorage and list them.",
      "Validate required fields and show inline errors.",
    ],
    quiz: [
      {
        q: "What makes an input 'controlled'?",
        options: ["It has a ref", "Its value comes from state and changes via onChange", "It's inside a form", "It uses defaultValue"],
        answer: 1,
        why: "React state drives the displayed value, so state is the single source of truth.",
      },
      {
        q: "Why keep qty and price as strings in state?",
        options: ["Strings are faster", "So partial input like '1.' isn't destroyed by early number conversion", "The DOM requires it", "For localStorage"],
        answer: 1,
        why: "Users type incrementally; converting eagerly loses the intermediate text.",
      },
    ],
    theory: ["reconciliation", "declarative-ui"],
  },
};
