import { Brain, CodeXml, Cpu, GitBranch, Gauge, Orbit, RefreshCw, Sparkles, Zap } from "lucide-react";
import type { Chapter } from "./types";
import DeclarativeLab from "../labs/DeclarativeLab";
import JsxLab from "../labs/JsxLab";
import SnapshotLab from "../labs/SnapshotLab";
import RenderLab from "../labs/RenderLab";
import KeysLab from "../labs/KeysLab";
import HooksLab from "../labs/HooksLab";
import EffectsLab from "../labs/EffectsLab";
import PerfLab from "../labs/PerfLab";
import ConcurrentLab from "../labs/ConcurrentLab";

export const chapters: Chapter[] = [
  /* ------------------------------------------------------------ 1 */
  {
    slug: "declarative-ui",
    n: 1,
    title: "UI is a function of state",
    tagline: "Stop telling the browser how to change. Describe what the screen should look like.",
    icon: Sparkles,
    minutes: 8,
    gradient: ["#22d3ee", "#3b82f6"],
    Lab: DeclarativeLab,
    blocks: [
      {
        t: "p",
        text: "Before React, most interfaces were built **imperatively**. You found a DOM node, changed its text, toggled a class, and later had to remember to undo it all. Every new feature multiplied the places that had to stay in sync — and every missed spot was a bug.",
      },
      {
        t: "code",
        file: "imperative.js",
        code: `// Imperative: you manage every DOM change by hand
const button = document.querySelector('#like');
let liked = false;

button.addEventListener('click', () => {
  liked = !liked;
  button.textContent = liked ? '♥ Liked' : '♡ Like';
  button.classList.toggle('active', liked);
});`,
      },
      {
        t: "p",
        text: "React flips the model. You **declare** what the UI should look like for a given state, and React works out which DOM operations get you there.",
      },
      {
        t: "code",
        file: "LikeButton.jsx",
        code: `function LikeButton() {
  const [liked, setLiked] = useState(false);

  return (
    <button className={liked ? 'active' : ''} onClick={() => setLiked(!liked)}>
      {liked ? '♥ Liked' : '♡ Like'}
    </button>
  );
}`,
      },
      {
        t: "callout",
        tone: "key",
        title: "UI = f(state)",
        text: "A component is a function. Give it the same state and it returns the same description of the screen. Event handlers exist only to change state — React does the rest.",
      },
      { t: "lab" },
      { t: "h", text: "Why this mental model wins" },
      {
        t: "ul",
        items: [
          "**Fewer bugs** — you never forget to update a corner of the screen, because you never update corners; you re-describe the whole thing.",
          "**Easier to read** — each state has one obvious result you can point at in the code.",
          "**React can optimise** — it knows the before and after descriptions, so it can compute the smallest set of DOM changes.",
        ],
      },
      {
        t: "callout",
        tone: "tip",
        title: "Think in states, not steps",
        text: "Before writing a component, list its visual states — empty, loading, error, success. Then decide which state variables drive them. The lab above is exactly that exercise.",
      },
    ],
    takeaways: [
      "A component describes the UI for a given state — it never edits the DOM itself.",
      "State changes → React calls your component again → compares the results → patches the DOM.",
      "Design by listing visual states first, then the state variables that drive them.",
    ],
    quiz: [
      {
        q: "In React's mental model, what is an event handler mainly for?",
        options: ["Editing the DOM directly", "Changing state so React can re-render", "Re-running the whole app", "Updating the virtual DOM by hand"],
        answer: 1,
        why: "Handlers set state; React re-runs your component and updates the DOM for you.",
      },
      {
        q: "Which statement describes *declarative* UI?",
        options: [
          "You list the exact DOM steps to reach the next screen",
          "You describe the screen for each state and let the library work out the steps",
          "You avoid using state",
          "You only use CSS",
        ],
        answer: 1,
        why: "Declarative means describing the result, not the procedure.",
      },
      {
        q: "What's a good first step when designing a component?",
        options: ["Write the CSS", "List its visual states (empty, loading, error, success)", "Add useEffect", "Split it into ten files"],
        answer: 1,
        why: "Knowing the states tells you which state variables you need.",
      },
    ],
  },

  /* ------------------------------------------------------------ 2 */
  {
    slug: "jsx-elements",
    n: 2,
    title: "JSX is just objects",
    tagline: "That HTML-looking syntax is JavaScript in disguise — and the objects it makes are React's raw material.",
    icon: CodeXml,
    minutes: 9,
    gradient: ["#a78bfa", "#6366f1"],
    Lab: JsxLab,
    blocks: [
      {
        t: "p",
        text: "JSX looks like HTML, but it is **syntax sugar for function calls**. Your build tool (Vite uses esbuild) compiles every tag into a call that returns a small plain object called a **React element**. It is not HTML and it is not the DOM — it's a lightweight *description* of what you'd like on screen.",
      },
      {
        t: "code",
        file: "compile.jsx",
        code: `// You write
const el = <h1 className="title">Hello</h1>;

// The compiler emits
const el = jsx('h1', { className: 'title', children: 'Hello' });

// React receives (roughly)
{ type: 'h1', key: null, props: { className: 'title', children: 'Hello' } }`,
      },
      { t: "lab" },
      { t: "h", text: "Components are functions that return elements" },
      {
        t: "p",
        text: "When you write `<Badge />`, the element's `type` is *your function*. React doesn't call it straight away — it calls it later, during **rendering**, passing the props as a single object. That's why component names must start with a capital letter: lowercase means a built-in DOM tag.",
      },
      {
        t: "code",
        file: "Badge.jsx",
        code: `function Badge({ label, tone }) {
  return <span className={'badge ' + tone}>{label}</span>;
}

// A parent only *describes* a Badge. Rendering happens later.
<Badge label="New" tone="pink" />`,
      },
      {
        t: "callout",
        tone: "info",
        title: "Props flow down",
        text: "Props are **read-only**. Data flows one way: parent → child. A child that wants something changed calls a function its parent passed down (for example `onSelect`).",
      },
      { t: "h", text: "JSX rules of thumb" },
      {
        t: "ul",
        items: [
          "Return **one root** — wrap siblings in a Fragment: `<>…</>`.",
          "Use `className` (not `class`) and camelCase attributes such as `onClick`.",
          "`{ }` embeds any JavaScript **expression** — variables, calls, ternaries — but not statements like `if`.",
          "Close every tag, including `<img />` and `<input />`.",
        ],
      },
      {
        t: "callout",
        tone: "tip",
        title: "Elements are immutable snapshots",
        text: "An element is never changed after it's created. To 'update' the UI you return a *new* element tree on the next render — and React compares the two.",
      },
    ],
    takeaways: [
      "JSX is syntax sugar: each tag becomes a function call that returns a plain object (an element).",
      "A component is a function; React calls it during rendering with props as its argument.",
      "Props are read-only and flow one way, from parent to child.",
    ],
    quiz: [
      {
        q: "What does `<Badge />` compile to?",
        options: ["An HTML string", "A DOM node", "A function call that returns a plain object describing the component", "A class instance"],
        answer: 2,
        why: "The element holds your function as its `type`; React calls it later during rendering.",
      },
      {
        q: "Why do component names start with a capital letter?",
        options: ["It's only a style convention", "Lowercase tags are treated as built-in DOM elements", "Capital letters are faster", "JSX requires PascalCase attributes"],
        answer: 1,
        why: "`<div />` means the DOM tag; `<Div />` means the variable named Div.",
      },
      {
        q: "Can a child component change the props it receives?",
        options: ["Yes, props are mutable", "No — props are read-only; ask the parent via a callback", "Only with useEffect", "Only in class components"],
        answer: 1,
        why: "Data flows down; changes flow up through callbacks the parent supplies.",
      },
    ],
  },

  /* ------------------------------------------------------------ 3 */
  {
    slug: "state-snapshots",
    n: 3,
    title: "State is a snapshot",
    tagline: "Why setCount(count + 1) three times only adds one — and how React remembers things between renders.",
    icon: Brain,
    minutes: 10,
    gradient: ["#f472b6", "#a855f7"],
    Lab: SnapshotLab,
    blocks: [
      {
        t: "p",
        text: "A component function runs from top to bottom every time it renders, and its local variables are recreated each time. So how does anything survive between renders? **React stores state outside your function** and hands you the current value while rendering — like a photograph of that moment.",
      },
      {
        t: "callout",
        tone: "key",
        title: "Every render is a snapshot",
        text: "Each render has its own props, its own state and its own event handlers. Calling a setter doesn't change the variable you're holding — it asks React for a **new render** with a new snapshot.",
      },
      { t: "lab" },
      {
        t: "code",
        file: "naive.js",
        code: `// ❌ Reads the same snapshot three times → count goes up by 1
setCount(count + 1);
setCount(count + 1);
setCount(count + 1);`,
      },
      {
        t: "code",
        file: "updater.js",
        code: `// ✅ Updater functions chain the latest value → count goes up by 3
setCount(c => c + 1);
setCount(c => c + 1);
setCount(c => c + 1);`,
      },
      { t: "h", text: "Batching" },
      {
        t: "p",
        text: "React groups all state updates from the same event into **one** re-render, so the screen never shows half-finished states. Since React 18, this *automatic batching* also applies inside timeouts, promises and native event handlers.",
      },
      {
        t: "callout",
        tone: "warn",
        title: "Never mutate state",
        text: "Objects and arrays in state are treated as read-only. Make a new copy — `[...items, item]`, `{ ...user, name }` — so React can see something changed. It compares old and new with `Object.is`, and a mutated object is still the same object.",
      },
    ],
    takeaways: [
      "State lives in React, not in your function — local variables reset every render.",
      "Each render is a snapshot: handlers see the values from the render that created them.",
      "Use updater functions when the next value depends on the previous one; never mutate state.",
    ],
    quiz: [
      {
        q: "You call `setCount(count + 1)` three times in one click handler (count is 0). What is count after the re-render?",
        options: ["3", "1", "0", "It throws an error"],
        answer: 1,
        why: "Every call closes over the same snapshot (count = 0), so each one asks for 1.",
      },
      {
        q: "What does React do with several state updates inside one event?",
        options: ["Renders once per update", "Batches them into a single render", "Ignores all but the first", "Runs them in a Web Worker"],
        answer: 1,
        why: "Batching avoids wasted renders and half-updated screens.",
      },
      {
        q: "Why shouldn't you `push` onto a state array directly?",
        options: ["Arrays can't hold objects", "React compares by identity, so a mutated array looks unchanged", "push is deprecated", "It's slower"],
        answer: 1,
        why: "Same array reference → React may bail out of re-rendering. Create a new array instead.",
      },
    ],
  },

  /* ------------------------------------------------------------ 4 */
  {
    slug: "render-commit",
    n: 4,
    title: "Render & commit",
    tagline: "Rendering isn't painting. Learn the three steps every single update goes through.",
    icon: RefreshCw,
    minutes: 10,
    gradient: ["#34d399", "#06b6d4"],
    Lab: RenderLab,
    blocks: [
      {
        t: "p",
        text: "Every screen update goes through three steps. Think of a restaurant: **Trigger** is the guest placing an order, **Render** is the kitchen preparing it, and **Commit** is the waiter putting the dish on the table.",
      },
      {
        t: "ol",
        items: [
          "**Trigger** — a state setter is called (or the app renders for the first time). React schedules work.",
          "**Render** — React calls your components to compute a new element tree. This must be *pure*: same inputs, same output, no side effects.",
          "**Commit** — React compares the new tree with the previous one and applies only the differences to the DOM. Then the browser paints.",
        ],
      },
      {
        t: "callout",
        tone: "key",
        title: "Rendering is not updating the DOM",
        text: "A component can render a hundred times without a single DOM change, if its output stays the same. React only touches the DOM in the commit step, and only where the trees differ.",
      },
      { t: "lab" },
      { t: "h", text: "When does a component re-render?" },
      {
        t: "ul",
        items: [
          "Its **own state** changed.",
          "Its **parent** re-rendered — even if the props are identical.",
          "A **context** it reads changed.",
        ],
      },
      {
        t: "p",
        text: "The second rule surprises many people: by default React re-renders the entire subtree below an updated component. That's usually fast enough. Optimise only when you can measure a problem (see chapter 8).",
      },
      {
        t: "callout",
        tone: "warn",
        title: "Render must be pure",
        text: "While rendering, don't write to outside variables, fetch data or touch the DOM. React may render a component more than once, pause, or throw the result away. Put side effects in event handlers or effects.",
      },
    ],
    takeaways: [
      "Every update is Trigger → Render → Commit.",
      "Render = calling your components (pure). Commit = patching the DOM (only what changed).",
      "Children re-render with their parent by default; a state change never re-renders ancestors or siblings.",
    ],
    quiz: [
      {
        q: "Which phase actually changes the DOM?",
        options: ["Trigger", "Render", "Commit", "All three"],
        answer: 2,
        why: "Render only calculates the next tree; commit applies the differences to the DOM.",
      },
      {
        q: "A parent re-renders and passes identical props to its (non-memo) child. What happens to the child?",
        options: ["It's skipped", "It re-renders too", "It's unmounted", "It's re-created from scratch"],
        answer: 1,
        why: "Without memo, children re-render whenever their parent does.",
      },
      {
        q: "Why must render functions be pure?",
        options: ["JSX requires it", "React may call them multiple times or discard the result", "To make CSS work", "Because hooks are async"],
        answer: 1,
        why: "Rendering can be repeated, paused or abandoned, so it must not have side effects.",
      },
    ],
  },

  /* ------------------------------------------------------------ 5 */
  {
    slug: "reconciliation",
    n: 5,
    title: "Reconciliation & keys",
    tagline: "How React decides what to keep, move, create or throw away.",
    icon: GitBranch,
    minutes: 9,
    gradient: ["#fbbf24", "#f97316"],
    Lab: KeysLab,
    blocks: [
      {
        t: "p",
        text: "After each render React holds two trees: the old one and the new one. Finding the minimal set of changes between two arbitrary trees is expensive, so React makes two smart assumptions that keep it fast.",
      },
      {
        t: "ol",
        items: [
          "Elements of **different types** produce different trees. Swap a `<div>` for a `<section>` (or `<A />` for `<B />`) and React destroys the old subtree — state included — and builds a new one.",
          "**Keys** tell React which child is which across renders. Same key → same item: React reuses it and only updates the props that changed.",
        ],
      },
      {
        t: "p",
        text: "Without keys, React matches list children by **position**. That's fine for a static list, and disastrous for one that can be reordered, filtered or inserted into.",
      },
      { t: "lab" },
      {
        t: "callout",
        tone: "warn",
        title: "Index keys are a trap",
        text: "Use a stable ID from your data (`item.id`) as the key. An index only works if the list never reorders, inserts or deletes — because the index belongs to the *slot*, not to the *item*.",
      },
      { t: "h", text: "Keys can also reset state on purpose" },
      {
        t: "code",
        file: "reset.jsx",
        code: `// Different key → React sees a different component → state is thrown away
<ProfileForm key={userId} userId={userId} />`,
      },
      {
        t: "callout",
        tone: "tip",
        title: "Rules of the game",
        text: "Keys must be unique **among siblings** (not globally), stable between renders, and never generated during render with `Math.random()` — that would remount every item on every update.",
      },
    ],
    takeaways: [
      "Same type at the same position → update in place and keep state; different type → tear down and rebuild.",
      "Lists are matched by `key`, not by position — use stable IDs from your data.",
      "Changing a component's key is the official way to reset its state.",
    ],
    quiz: [
      {
        q: "What does React use to match list items between renders?",
        options: ["Their position only", "Their `key`", "Their text content", "Their DOM id"],
        answer: 1,
        why: "Keys are the identity of list items.",
      },
      {
        q: "You use `key={index}` and prepend an item. What's the most likely symptom?",
        options: ["Nothing", "State (like typed input) ends up attached to the wrong item", "The page reloads", "React throws"],
        answer: 1,
        why: "Index 0 now refers to a different item, but React reuses the old instance at index 0.",
      },
      {
        q: "How can you deliberately reset a component's state?",
        options: ["Call setState(null)", "Change its `key`", "Wrap it in memo", "Use useEffect"],
        answer: 1,
        why: "A new key means a new identity, so React unmounts the old instance and mounts a fresh one.",
      },
    ],
  },

  /* ------------------------------------------------------------ 6 */
  {
    slug: "hooks-internals",
    n: 6,
    title: "Hooks from scratch",
    tagline: "How does useState remember things? Build a mini-React and see the trick with your own eyes.",
    icon: Cpu,
    minutes: 11,
    gradient: ["#60a5fa", "#8b5cf6"],
    Lab: HooksLab,
    blocks: [
      {
        t: "p",
        text: "Hooks look like magic. `useState()` returns different values in different components and remembers them between renders — and you never tell it *whose* state you want. How does React know?",
      },
      {
        t: "p",
        text: "The answer is mundane: React keeps a **list of slots** for every component instance and relies on **call order**. The first `useState` in a render reads slot 0, the second reads slot 1, and so on. The cursor resets to 0 at the start of every render.",
      },
      {
        t: "code",
        file: "mini-react.js",
        code: `// A working mini-React in ~20 lines
let slots = [];   // state lives OUTSIDE the component function
let cursor = 0;

function useState(initial) {
  const i = cursor++;                       // claim the next slot
  if (!(i in slots)) slots[i] = initial;    // first render: initialise it

  const setState = (next) => {
    slots[i] = typeof next === 'function' ? next(slots[i]) : next;
    render();                               // ask for a new render
  };
  return [slots[i], setState];
}

function render() {
  cursor = 0;                               // every render starts at slot 0
  const ui = Component();
  paint(ui);
}`,
      },
      { t: "lab" },
      {
        t: "callout",
        tone: "warn",
        title: "The Rules of Hooks, explained",
        text: "Only call hooks at the **top level** — never inside conditions, loops or nested functions — and only from components or custom hooks. The order must be identical on every render, otherwise slots shift and state lands in the wrong hook.",
      },
      {
        t: "p",
        text: "In real React the slots are a **linked list** stored on the component's *Fiber* — the internal object that represents one component instance in the tree. The idea is exactly the same.",
      },
      {
        t: "callout",
        tone: "info",
        title: "Custom hooks are just functions that call hooks",
        text: "There's no extra machinery: a custom hook like `useLocalStorage` simply calls other hooks, so its slots become part of the calling component's list. Two components using the same hook get two separate sets of state.",
      },
    ],
    takeaways: [
      "State is stored outside your function, in numbered slots owned by the component instance.",
      "Hooks find their slot by call order — so the order must never change between renders.",
      "Custom hooks are ordinary functions that call other hooks; each caller gets its own state.",
    ],
    quiz: [
      {
        q: "How does React know which state belongs to which `useState` call?",
        options: ["By the variable name", "By the order of hook calls in each render", "By a hidden ID you pass", "By the file name"],
        answer: 1,
        why: "Each call takes the next slot; order is the identity.",
      },
      {
        q: "Why can't you call a hook inside an `if`?",
        options: ["It's slower", "It changes the call order between renders, shifting the slots", "Hooks aren't allowed in JSX", "ESLint forbids all conditionals"],
        answer: 1,
        why: "If a hook is skipped, every later hook reads the wrong slot.",
      },
      {
        q: "Where does a component's state actually live?",
        options: ["Inside the function body", "In the DOM", "In React's internal structure (the fiber), outside your function", "In localStorage"],
        answer: 2,
        why: "Your function is re-run every render; React keeps the state elsewhere and hands it back.",
      },
    ],
  },

  /* ------------------------------------------------------------ 7 */
  {
    slug: "effects",
    n: 7,
    title: "Effects & the component lifecycle",
    tagline: "Rendering stays pure. Everything that touches the outside world lives in effects.",
    icon: Zap,
    minutes: 11,
    gradient: ["#fb7185", "#f59e0b"],
    Lab: EffectsLab,
    blocks: [
      {
        t: "p",
        text: "Rendering must stay pure, yet real apps need to talk to the outside world: subscribe to events, start timers, fetch data, change `document.title`. Those **side effects** belong in effects, which run *after* React has committed to the DOM.",
      },
      {
        t: "code",
        file: "effect.jsx",
        code: `useEffect(() => {
  const id = setInterval(tick, 1000);    // setup: start syncing
  return () => clearInterval(id);        // cleanup: stop syncing
}, []);                                  // dependencies: when to re-sync`,
      },
      { t: "h", text: "The life of an effect" },
      {
        t: "ol",
        items: [
          "**Mount** — after the first commit, React runs your setup function.",
          "**Dependencies change** — React first runs the *cleanup* from the previous render (with the old values), then runs setup again with the new ones.",
          "**Unmount** — React runs the last cleanup.",
        ],
      },
      { t: "lab" },
      {
        t: "callout",
        tone: "key",
        title: "Effects synchronise — they don't 'watch'",
        text: "Don't think 'run this code when X changes'. Think 'keep this outside system in sync with these values'. Each setup/cleanup pair describes one synchronisation.",
      },
      {
        t: "callout",
        tone: "warn",
        title: "You might not need an effect",
        text: "Don't use effects to compute values from state (derive them while rendering) or to respond to user events (use the event handler). Effects are for syncing with things outside React.",
      },
      {
        t: "callout",
        tone: "tip",
        title: "StrictMode's double effects",
        text: "In development, StrictMode mounts, unmounts and re-mounts every component once to prove your cleanup works. You'll see a doubled setup/cleanup pair — it's intentional, and it doesn't happen in production.",
      },
    ],
    takeaways: [
      "Effects run after the commit; cleanup runs before the next setup and on unmount.",
      "The dependency array says which values the effect synchronises with.",
      "Derive values during render and respond to events in handlers — reserve effects for the outside world.",
    ],
    quiz: [
      {
        q: "When does `useEffect` run relative to rendering?",
        options: ["During render", "After React commits the render to the DOM", "Before the component function is called", "Only on unmount"],
        answer: 1,
        why: "Effects are deliberately deferred until the screen is updated.",
      },
      {
        q: "An effect has dependencies `[roomId]`. roomId changes. What runs?",
        options: ["Only the new setup", "Cleanup with the old values, then setup with the new values", "Nothing", "Only cleanup"],
        answer: 1,
        why: "React undoes the previous synchronisation before starting the next one.",
      },
      {
        q: "Where's the best place to compute `fullName` from `firstName` and `lastName` state?",
        options: ["In a useEffect that sets fullName", "During rendering, as a plain variable", "In localStorage", "In a ref"],
        answer: 1,
        why: "Derived values need no effect and no extra state.",
      },
    ],
  },

  /* ------------------------------------------------------------ 8 */
  {
    slug: "memoization",
    n: 8,
    title: "Memoization & context",
    tagline: "Skip work you don't need — and understand why it sometimes doesn't work.",
    icon: Gauge,
    minutes: 10,
    gradient: ["#2dd4bf", "#22c55e"],
    Lab: PerfLab,
    blocks: [
      {
        t: "p",
        text: "Because children re-render with their parent by default, a big tree can start to feel sluggish. React gives you three tools for skipping work — but they cost memory and complexity, so **measure first**.",
      },
      {
        t: "ul",
        items: [
          "**`React.memo(Component)`** — skip re-rendering a component when its props are shallowly equal to last time.",
          "**`useMemo(fn, deps)`** — cache the *result* of an expensive calculation between renders.",
          "**`useCallback(fn, deps)`** — cache a *function* so its identity stays the same (handy for memoised children).",
        ],
      },
      { t: "lab" },
      {
        t: "callout",
        tone: "key",
        title: "memo compares with Object.is",
        text: "Numbers and strings are compared by value, but objects, arrays and functions are compared by identity — and you create new ones on every render. That's why a memoised child re-renders when you pass `() => {}` or `{ a: 1 }` unless you stabilise them.",
      },
      { t: "h", text: "Context: skip the drilling, not the re-renders" },
      {
        t: "p",
        text: "Context lets any descendant read a value without threading props through every level. But when the Provider's `value` changes identity, **every consumer re-renders** — memo can't stop that. Memoise the value and split contexts that change at different speeds.",
      },
      {
        t: "code",
        file: "AuthProvider.jsx",
        code: `const value = useMemo(() => ({ user, logout }), [user, logout]);
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;`,
      },
      {
        t: "callout",
        tone: "tip",
        title: "Let the compiler help",
        text: "The optional React Compiler can insert much of this memoisation automatically at build time. Understanding *why* it helps still makes you a better React developer — and your code friendlier to the compiler.",
      },
    ],
    takeaways: [
      "memo, useMemo and useCallback skip work — but only when props or dependencies keep the same identity.",
      "Inline objects, arrays and functions get a new identity every render.",
      "A Provider whose value changes identity re-renders all consumers; memoise it. Measure before optimising.",
    ],
    quiz: [
      {
        q: "Why does a memoised child still re-render when you pass an inline arrow function as a prop?",
        options: ["memo is broken", "The function is a new object each render, so the props differ by identity", "Functions can't be props", "Because of StrictMode"],
        answer: 1,
        why: "memo uses Object.is per prop; a fresh function never equals the previous one.",
      },
      {
        q: "What happens to context consumers when the Provider value is a new object every render?",
        options: ["Nothing", "All consumers re-render", "Only the first consumer re-renders", "The app crashes"],
        answer: 1,
        why: "Context change detection is by identity, and memo can't block it.",
      },
      {
        q: "When should you reach for memoisation?",
        options: ["Always, on every component", "After measuring a real performance problem", "Never", "Only in class components"],
        answer: 1,
        why: "Memoisation has a cost; use it where profiling shows a benefit.",
      },
    ],
  },

  /* ------------------------------------------------------------ 9 */
  {
    slug: "concurrent",
    n: 9,
    title: "Concurrent React",
    tagline: "How React keeps typing instant while heavy work happens in the background.",
    icon: Orbit,
    minutes: 9,
    gradient: ["#c084fc", "#ec4899"],
    Lab: ConcurrentLab,
    blocks: [
      {
        t: "p",
        text: "Until React 18, rendering was **synchronous**: once React started, it couldn't stop, so an expensive render froze typing and clicks. **Concurrent rendering** lets React pause, resume or even abandon a render to keep urgent work — like typing — responsive.",
      },
      {
        t: "code",
        file: "Search.jsx",
        code: `function Search() {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);   // lags behind, interruptibly

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <SlowResults query={deferred} />        {/* memo'd — re-renders in the background */}
    </>
  );
}`,
      },
      { t: "lab" },
      { t: "h", text: "Tools for non-urgent updates" },
      {
        t: "ul",
        items: [
          "**`useDeferredValue(value)`** — gives you a copy of a value that updates *later*, after urgent work. Great when you don't control the code that sets the value.",
          "**`useTransition()`** — wraps a state update in `startTransition` to mark it non-urgent, and tells you when it's `isPending`.",
          "**`Suspense` + `use()`** — let a component 'wait' for data while React shows a fallback (or keeps the old UI during a transition). Try it in the Cosmic Gallery project.",
        ],
      },
      {
        t: "callout",
        tone: "info",
        title: "It's not multithreading",
        text: "JavaScript is still single-threaded. React simply splits rendering into small chunks and checks between them whether something more urgent needs attention.",
      },
      {
        t: "callout",
        tone: "tip",
        title: "Combine with memo",
        text: "A deferred value only helps if the slow child can skip re-rendering while the value is unchanged — wrap it in `memo`, as the lab does.",
      },
    ],
    takeaways: [
      "Concurrent rendering lets React interrupt low-priority renders to keep urgent updates instant.",
      "useDeferredValue and useTransition mark work as non-urgent; Suspense + use() handle waiting for data.",
      "It's cooperative scheduling on one thread, not parallelism.",
    ],
    quiz: [
      {
        q: "What does concurrent rendering allow React to do?",
        options: ["Use multiple threads", "Pause, resume or abandon a render to keep urgent updates responsive", "Skip commits", "Render on the server only"],
        answer: 1,
        why: "Rendering becomes interruptible, so urgent updates can jump the queue.",
      },
      {
        q: "What does `useDeferredValue(query)` return?",
        options: ["A promise", "A version of query that may lag behind while urgent updates finish first", "A debounced function", "The previous query only"],
        answer: 1,
        why: "It returns the old value first, then re-renders in the background with the new one.",
      },
      {
        q: "Which of these is NOT a way to mark work as non-urgent?",
        options: ["startTransition", "useTransition", "useDeferredValue", "useRef"],
        answer: 3,
        why: "useRef stores a mutable value; it has nothing to do with scheduling.",
      },
    ],
  },
];

export const chapterBySlug = (slug: string) => chapters.find((c) => c.slug === slug);
