import type { LessonContent } from "./types";

export const beginner: Record<string, LessonContent> = {
  /* ------------------------------------------------------------ Counter */
  counter: {
    learn: [
      "Declare and update state with `useState`",
      "Why the **updater form** (`c => c + 1`) exists",
      "How a state change triggers a re-render — and why handlers see a snapshot",
      "Deriving visuals (ring, colour, labels) straight from state",
    ],
    lesson: [
      {
        t: "p",
        text: "A counter is the 'hello world' of React — and a perfect microscope for its most important idea: **state**. The number on screen isn't stored in the DOM. It lives in React, and the DOM is just its latest picture.",
      },
      {
        t: "callout",
        tone: "key",
        title: "The loop",
        text: "Event → call the setter → React re-renders your component with the new state → React updates only what changed in the DOM. You never touch the DOM yourself.",
      },
      { t: "h", text: "Two ways to set state" },
      {
        t: "ul",
        items: [
          "`setCount(5)` — replace with a value. Fine when the new value doesn't depend on the old one.",
          "`setCount(c => c + 1)` — an **updater**. React calls it with the latest queued value. Use it whenever the next state depends on the previous one.",
        ],
      },
      {
        t: "callout",
        tone: "info",
        title: "Try the red and green buttons",
        text: "In the demo, click **naive ×3**, then **updater ×3**. The code looks almost identical, yet the results differ — that's the snapshot rule from the State chapter, live.",
      },
    ],
    steps: [
      {
        title: "Declare state",
        region: "state",
        body: "`useState(0)` returns the current value and a setter. Every piece of data that changes over time *and* affects the screen becomes a state variable. Here: the count, the step size and a status note.",
      },
      {
        title: "Update with an updater function",
        region: "update",
        body: "The setter receives a function. React queues it and feeds it the latest value, so clicking fast can never lose an update. We also clamp with `Math.min` / `Math.max` so the count stays in range.",
      },
      {
        title: "The snapshot trap",
        region: "snapshot",
        body: "Inside one render `count` is a constant. `setCount(count + 1)` three times asks for the same next value three times. Updater functions chain instead — each one receives the previous result.",
      },
      {
        title: "Describe the UI",
        region: "view",
        body: "Everything visible is computed from state: the ring's progress, its colour at the limits, the label. No code 'updates the ring' — the whole view is simply re-described on every render.",
      },
    ],
    mistakes: [
      {
        title: "Mutating instead of setting",
        text: "`count++` or `count = count + 1` changes a local variable, not React's state. Nothing re-renders. Always go through the setter.",
      },
      {
        title: "Reading state right after setting it",
        text: "`setCount(5); console.log(count)` still logs the old value — you're holding the previous snapshot. Use the new value directly, or read it on the next render.",
      },
    ],
    challenges: [
      "Add a **Double** button using an updater: `setCount(c => c * 2)`.",
      "Persist the count in `localStorage` so it survives a refresh (hint: lazy initial state + `useEffect`).",
      "Add an undo button by keeping a `history` array — then notice `count` can be *derived* from it.",
    ],
    quiz: [
      {
        q: "After clicking 'naive ×3' once from count = 0, what will the count be?",
        options: ["3", "1", "0", "It depends on the step"],
        answer: 1,
        why: "All three `setCount(count + 1)` calls read the same snapshot (0) and all ask for 1.",
      },
      {
        q: "Why is the updater form safe for rapid clicks?",
        options: ["It runs synchronously", "React passes it the latest queued value", "It skips batching", "It mutates the DOM directly"],
        answer: 1,
        why: "Updaters are queued and applied in order, each receiving the result of the previous one.",
      },
    ],
    theory: ["state-snapshots", "render-commit"],
  },

  /* ------------------------------------------------------------ Accordion */
  accordion: {
    learn: [
      "**Lifting state up** so a parent coordinates its children",
      "Designing one state shape that supports single- and multi-open modes",
      "Conditional styling and CSS transitions driven by state",
      "Accessible disclosure widgets with `aria-expanded`",
    ],
    lesson: [
      {
        t: "p",
        text: "An accordion looks trivial, but it asks a key architectural question: **who owns the state?** If each item tracked its own `open` flag, 'only one open at a time' would be impossible — siblings can't see each other. The answer is to lift the state up to the parent.",
      },
      {
        t: "callout",
        tone: "key",
        title: "Lifting state up",
        text: "When several components need to agree on something, move the state to their closest common parent, pass it down as props, and pass callbacks down to change it.",
      },
      { t: "h", text: "One shape, two modes" },
      {
        t: "p",
        text: "We store `openIds: string[]`. In single mode the array holds at most one id; in multiple mode it can hold many. One state shape, no duplicated logic — only the toggle rule differs.",
      },
      {
        t: "callout",
        tone: "tip",
        title: "Accessibility is part of the code",
        text: "Each header is a real `<button>` with `aria-expanded`, and the panel points back with `aria-labelledby`. Keyboards and screen readers work for free.",
      },
    ],
    steps: [
      {
        title: "The item is purely presentational",
        region: "item",
        body: "`AccordionItem` owns no state. It receives `open` and `onToggle` from its parent. That makes it trivial to reuse — and to test. The `grid-rows` transition animates to the content's natural height without measuring anything in JavaScript.",
      },
      {
        title: "State lives in the parent",
        region: "state",
        body: "The parent knows about *all* items, so it owns the state. `openIds` is a list of ids rather than a single id, which lets both modes share one shape.",
      },
      {
        title: "One toggle function, two rules",
        region: "toggle",
        body: "Closing is the same in both modes. Opening either appends the id (multiple) or replaces the array (single). The updater form keeps it correct when clicks arrive quickly.",
      },
    ],
    mistakes: [
      {
        title: "State inside every item",
        text: "Giving each item its own `useState(false)` makes 'close the others' impossible without hacks. Ask: who needs to know? Then lift the state to that component.",
      },
      {
        title: "Using the array index as the id",
        text: "If the FAQ can be reordered or filtered, index-based ids point at different items over time. Use stable ids.",
      },
    ],
    challenges: [
      "Add an **Expand all / Collapse all** button.",
      "Support keyboard navigation with ↑ / ↓ between headers.",
      "Remember the open items in `localStorage`.",
    ],
    quiz: [
      {
        q: "Why must the open state live in the Accordion parent instead of each item?",
        options: ["It's faster", "Siblings need to coordinate (e.g. close the others)", "Hooks can't be used in children", "CSS requires it"],
        answer: 1,
        why: "Only a common parent can see and change the state of all its children.",
      },
      {
        q: "How does the same `openIds` array support both modes?",
        options: ["Two separate arrays", "In single mode the toggle rule just never lets it hold more than one id", "It doesn't", "By using useRef"],
        answer: 1,
        why: "The rule decides whether to append or replace, so one shape is enough.",
      },
    ],
    theory: ["declarative-ui", "jsx-elements"],
  },

  /* ------------------------------------------------------------ Tic-Tac-Toe */
  "tic-tac-toe": {
    learn: [
      "**Thinking in React**: find the minimal state, derive the rest",
      "**Immutability**: copy arrays instead of mutating them",
      "Deriving values (winner, next player) instead of storing them",
      "Time travel by keeping a history of snapshots",
    ],
    lesson: [
      {
        t: "p",
        text: "Tic-tac-toe is the classic from the official React tutorial, and for good reason: it packs the core habits of React thinking into about a hundred lines.",
      },
      {
        t: "ol",
        items: [
          "**Find the minimal state.** We need the board history and which move we're viewing. That's all.",
          "**Derive everything else.** Whose turn? `move % 2`. Who won? Check the current board. A draw? Check for empty squares. None of these deserve their own `useState`.",
          "**Never mutate.** Each move creates a *new* board array. That's why keeping a history is trivial — old boards are never touched.",
        ],
      },
      {
        t: "callout",
        tone: "key",
        title: "Derived state can't go out of sync",
        text: "If `winner` were stored in state, you'd have to remember to update it everywhere the board changes. Computing it during render makes a mismatch impossible.",
      },
      {
        t: "callout",
        tone: "tip",
        title: "Time travel is free",
        text: "Because every board is an immutable snapshot, 'go back to move 3' is just `setMove(3)`. Immutability isn't a chore — it's a superpower.",
      },
    ],
    steps: [
      {
        title: "Store only what can't be computed",
        region: "history",
        body: "`history` is an array of boards; `move` says which one we're looking at. Two pieces of state describe the entire game, including everything in the past.",
      },
      {
        title: "Derive the rest while rendering",
        region: "derived",
        body: "The current board, whose turn it is, the winner and the draw flag are ordinary variables recomputed on each render. They are always consistent with `history` and `move` because they come from them.",
      },
      {
        title: "Play a move immutably",
        region: "play",
        body: "`squares.slice()` makes a copy, we change the copy, and store a *new* history array. If we're looking at the past, `history.slice(0, move + 1)` discards the 'future' first — just like an undo stack.",
      },
      {
        title: "A pure winner function",
        region: "winner",
        body: "`calculateWinner` takes a board and returns the winning player and line (or `null`). No React involved — pure functions like this are the easiest code to test and reuse.",
      },
    ],
    mistakes: [
      {
        title: "Mutating the board",
        text: "`squares[i] = 'X'` edits the array in place. Every history entry sharing that array changes at once, and React can't detect the update. Copy first.",
      },
      {
        title: "Storing what you can compute",
        text: "A `winner` or `xIsNext` state variable is a bug waiting to happen — derive it from the state you already have.",
      },
    ],
    challenges: [
      "Highlight the last move that was played.",
      "Add a score tally that persists across games.",
      "Implement an unbeatable computer opponent (minimax) for player O.",
    ],
    quiz: [
      {
        q: "Which of these should NOT be its own state variable?",
        options: ["The history of boards", "The move currently viewed", "Who the winner is", "All of them should be state"],
        answer: 2,
        why: "The winner can be computed from the current board, so storing it only risks inconsistency.",
      },
      {
        q: "Why do we copy the squares array with `slice()` before changing it?",
        options: ["To make it faster", "So state is never mutated and the history stays intact", "Because arrays are read-only in JS", "To trigger useEffect"],
        answer: 1,
        why: "Mutation would alter every past board sharing that array, and React couldn't detect the change.",
      },
    ],
    theory: ["state-snapshots", "declarative-ui"],
  },

  /* ------------------------------------------------------------ Color palette */
  "color-palette": {
    learn: [
      "Rendering lists with `.map()` and stable `key`s",
      "Immutable updates of arrays of objects",
      "`useEffect` + **cleanup** for a global keyboard shortcut",
      "`useCallback` for a stable function identity in effect dependencies",
      "The Clipboard API with user feedback",
    ],
    lesson: [
      {
        t: "p",
        text: "Press **Space** and five new colours appear; lock the ones you love. Under the hood it's an array of objects in state — and every button is an immutable update of that array.",
      },
      { t: "h", text: "The immutable update patterns" },
      {
        t: "code",
        file: "patterns.js",
        code: `// Replace one item
items.map(item => item.id === id ? { ...item, locked: !item.locked } : item)

// Add
[...items, newItem]

// Remove
items.filter(item => item.id !== id)`,
      },
      {
        t: "callout",
        tone: "key",
        title: "Effects need cleanup",
        text: "Adding a `keydown` listener is a side effect. Without the cleanup function every re-render would stack another listener, and Space would fire several times.",
      },
      {
        t: "callout",
        tone: "info",
        title: "Why useCallback here?",
        text: "The effect depends on `generate`. If `generate` were re-created on every render, the effect would re-subscribe every render. `useCallback` keeps it stable until `harmony` changes.",
      },
    ],
    steps: [
      {
        title: "Pure colour maths",
        region: "generate",
        body: "Generating a palette is just functions: HSL → HEX conversion, harmony rules, and a luminance check that picks readable text. They don't touch React, so they're easy to reason about (and to unit test).",
      },
      {
        title: "State: swatches as objects",
        region: "state",
        body: "Each swatch has an `id`, a `hex` and a `locked` flag. The id becomes the list `key`, so React can tell swatches apart when their colours change.",
      },
      {
        title: "Update immutably",
        region: "update",
        body: "`generate` maps over the previous array and returns a *new* one, leaving locked swatches untouched. Toggling a lock replaces just one object. Nothing is ever mutated.",
      },
      {
        title: "Subscribe and clean up",
        region: "keys",
        body: "The effect attaches a window-level `keydown` listener. Returning a cleanup function removes it before the next effect and on unmount — so exactly one listener exists at any time.",
      },
    ],
    mistakes: [
      {
        title: "Forgetting cleanup",
        text: "`addEventListener` without `removeEventListener` leaks listeners, causing duplicated actions and memory leaks.",
      },
      {
        title: "Mutating the swatch",
        text: "`swatch.locked = true` changes an object React already rendered. Return a new object with the spread operator instead.",
      },
    ],
    challenges: [
      "Let users add and remove swatches (2–8).",
      "Show the WCAG contrast ratio between each colour and white/black.",
      "Save favourite palettes and let users re-apply them.",
    ],
    quiz: [
      {
        q: "What does the effect's cleanup function do in this project?",
        options: ["Removes the keyboard listener", "Clears the palette", "Unlocks all colours", "Nothing"],
        answer: 0,
        why: "It runs before the next effect and on unmount, preventing duplicate listeners.",
      },
      {
        q: "How do you toggle one swatch's `locked` flag without mutating state?",
        options: ["swatch.locked = !swatch.locked", "Map the array and return a new object for that id", "Use a global variable", "Call forceUpdate"],
        answer: 1,
        why: "Copy-on-write updates give React a new array and a new object, so it knows to re-render.",
      },
    ],
    theory: ["reconciliation", "effects"],
  },

  /* ------------------------------------------------------------ Password generator */
  "password-generator": {
    learn: [
      "Controlled inputs: range sliders and checkboxes",
      "**Derived state**: strength and crack-time computed during render",
      "Lazy state initialisation with `useState(() => …)`",
      "Doing work in **event handlers** instead of effects",
      "Secure randomness with `crypto.getRandomValues`",
    ],
    lesson: [
      {
        t: "p",
        text: "A password generator is a lovely lesson in *where code belongs*. Logic can live in three places in React: during **render** (derive things), in **event handlers** (respond to the user) and in **effects** (sync with the outside world). Choose the earliest one that works.",
      },
      {
        t: "ol",
        items: [
          "The password itself is *state* — random output can't be derived from anything.",
          "Strength, entropy and crack time are **derived** — computed from the options during render.",
          "Regenerating when an option changes happens in the **change handler**, not in a `useEffect` that watches the options.",
        ],
      },
      {
        t: "callout",
        tone: "warn",
        title: "The effect trap",
        text: "`useEffect(() => setPassword(generate(options)), [options])` works, but renders twice on every change (once with the old password, once with the new). Doing it in the handler gives the right result in a single render.",
      },
      {
        t: "callout",
        tone: "tip",
        title: "Math.random is not for secrets",
        text: "Use `crypto.getRandomValues` for anything security-related. The code also avoids *modulo bias* with rejection sampling, so every character is equally likely.",
      },
    ],
    steps: [
      {
        title: "Pure generation helpers",
        region: "generate",
        body: "`randomInt` draws unbiased secure integers, `pool` builds the character set from the options, and `generate` picks characters. All plain functions — no React.",
      },
      {
        title: "State, with a lazy initialiser",
        region: "state",
        body: "`useState(() => generate(options))` passes a *function*, so the expensive/random work runs only on the first render. `useState(generate(options))` would re-run it on every render and throw the result away.",
      },
      {
        title: "Respond in the event handler",
        region: "handlers",
        body: "`update` merges the change, guards against an empty character set, then sets *both* `options` and `password` in one go. React batches the two updates into a single render.",
      },
      {
        title: "Derive strength during render",
        region: "derived",
        body: "Pool size and length give entropy in bits, which gives the strength level and colour. None of this is state — it's just arithmetic on `options`, always in sync.",
      },
    ],
    mistakes: [
      {
        title: "Syncing state with effects",
        text: "Copying one state into another inside an effect creates extra renders and flicker. Compute the value, or update both in the handler.",
      },
      {
        title: "Storing strength in state",
        text: "It would need updating everywhere the options change. Derive it: it's just maths on `options`.",
      },
    ],
    challenges: [
      "Guarantee at least one character from every enabled set.",
      "Add a passphrase mode that picks random dictionary words.",
      "Keep a history of the last 5 generated passwords.",
    ],
    quiz: [
      {
        q: "Where should 'regenerate the password when an option changes' happen?",
        options: ["In a useEffect watching options", "In the option's change handler", "During render", "In a ref"],
        answer: 1,
        why: "It's a response to a user action, so the event handler is the right place — with no extra render.",
      },
      {
        q: "Why is `strength` not stored in state?",
        options: ["State is slow", "It can be computed from options, so storing it risks it going stale", "Strings can't be state", "Hooks forbid it"],
        answer: 1,
        why: "Derived values should be calculated while rendering.",
      },
    ],
    theory: ["state-snapshots", "effects"],
  },
};
