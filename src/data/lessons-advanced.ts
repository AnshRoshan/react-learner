import type { LessonContent } from "./types";

export const advanced: Record<string, LessonContent> = {
  /* ------------------------------------------------------------ Theme studio */
  "theme-studio": {
    learn: [
      "`createContext`, `Provider` and `useContext`",
      "When context beats **prop drilling** (and when it doesn't)",
      "Writing a safe **custom hook** around context",
      "`useMemo` to keep the Provider value stable",
    ],
    lesson: [
      {
        t: "p",
        text: "Some data is needed by many components at different depths: the theme, the current user, the language. Passing it down through every level as props — **prop drilling** — clutters components that don't care about it. Context lets a deep component read it directly.",
      },
      {
        t: "ol",
        items: [
          "`createContext()` creates the channel.",
          "A **Provider** puts a value into that channel for everything below it.",
          "`useContext()` reads the nearest Provider's value — and re-renders when it changes.",
        ],
      },
      {
        t: "callout",
        tone: "warn",
        title: "Context is not a global state manager",
        text: "Every consumer re-renders when the value changes. Keep contexts small and focused, and memoise the value object so it only changes when it needs to.",
      },
      {
        t: "callout",
        tone: "tip",
        title: "Wrap useContext in your own hook",
        text: "`useStoreTheme()` throws a helpful error outside the provider and gives you one place to change later — for example, to add selectors.",
      },
    ],
    steps: [
      {
        title: "Create the context and a safe hook",
        region: "context",
        body: "The context starts as `null`, and `useStoreTheme` throws if it's used outside a Provider. That turns a confusing `undefined` bug into an instant, readable error.",
      },
      {
        title: "Read it anywhere, no props",
        region: "consumer",
        body: "`Price` and `BuyButton` sit deep in the tree yet ask the context for exactly what they need. Adding a new consumer never requires touching the components in between.",
      },
      {
        title: "Keep the value stable",
        region: "value",
        body: "`useMemo` returns the same object until one of its inputs changes. Without it, every render of `ThemeStudio` would create a new object and needlessly re-render every consumer.",
      },
    ],
    mistakes: [
      {
        title: "Unstable Provider value",
        text: "`value={{ a, b }}` creates a new object on every render, so every consumer re-renders whenever the provider does.",
      },
      {
        title: "One giant context",
        text: "Putting everything in one context re-renders everyone for any change. Split contexts by how often they change.",
      },
    ],
    challenges: [
      "Add a `density` option (compact / comfy) that changes padding through context.",
      "Split the context into ThemeContext and CurrencyContext.",
      "Persist the settings and restore them on load.",
    ],
    quiz: [
      {
        q: "What happens to consumers when the Provider's value changes identity?",
        options: ["Nothing", "They all re-render", "Only the closest one re-renders", "The provider unmounts"],
        answer: 1,
        why: "Every component reading the context re-renders when the value changes.",
      },
      {
        q: "What problem does context solve?",
        options: ["Slow renders", "Prop drilling through many intermediate components", "State persistence", "Async data"],
        answer: 1,
        why: "Deeply nested components can read shared values without props being threaded through every level.",
      },
    ],
    theory: ["memoization"],
  },

  /* ------------------------------------------------------------ Modal & toasts */
  "modal-toasts": {
    learn: [
      "`createPortal` — render outside the parent DOM node",
      "Effects for **focus management**, key handling and scroll locking (with full cleanup)",
      "A **provider + reducer + hook** notification system",
      "Timeouts in effects with cleanup",
    ],
    lesson: [
      {
        t: "p",
        text: "A modal must appear *above everything*, but React components render where they're declared. If an ancestor has `overflow: hidden` or a CSS transform, a `position: fixed` modal gets clipped or mis-positioned. **Portals** render a component's output into a different DOM node while keeping it in the same React tree.",
      },
      {
        t: "callout",
        tone: "key",
        title: "Portals keep React behaviour",
        text: "Events still bubble through the React tree and context still works, even though the DOM node lives under `document.body`.",
      },
      {
        t: "callout",
        tone: "info",
        title: "Try it",
        text: "In the demo, switch the portal off and open the modal: it's trapped and clipped by its container. Switch it on and it escapes.",
      },
      { t: "h", text: "Accessibility checklist" },
      {
        t: "ul",
        items: [
          "`role=\"dialog\"` and `aria-modal=\"true\"`.",
          "Move focus into the dialog on open, and **restore** it on close.",
          "Close with Escape and by clicking the backdrop.",
          "Prevent the page behind from scrolling.",
        ],
      },
      {
        t: "callout",
        tone: "tip",
        title: "Cleanup undoes everything",
        text: "The modal effect adds a listener, locks scrolling and moves focus. Its cleanup removes the listener, unlocks scrolling and returns focus — symmetrically.",
      },
    ],
    steps: [
      {
        title: "The modal: portal + effect",
        region: "modal",
        body: "The effect does three things on open — focus, Escape handling, scroll lock — and its cleanup reverses all three. The last line decides *where* the DOM lives: `createPortal(overlay, document.body)` or in place.",
      },
      {
        title: "Toasts: context + reducer + portal",
        region: "toasts",
        body: "A reducer holds the queue, a context exposes a `push` function to the whole app, and a portal renders the stack in `<body>`. `useCallback` keeps `push` and `dismiss` stable so nothing re-renders needlessly.",
      },
      {
        title: "Auto-dismiss with a timer effect",
        region: "autoDismiss",
        body: "Each toast starts its own timeout. If the user dismisses it early, or it unmounts, the cleanup clears the timer — so no stray callback fires later.",
      },
    ],
    mistakes: [
      {
        title: "Forgetting to restore focus",
        text: "Keyboard users get lost at the top of the page after the dialog closes. Save the trigger and refocus it in cleanup.",
      },
      {
        title: "Unstable onClose in effect deps",
        text: "An inline `() => setOpen(false)` in the dependency array re-runs the effect every render. Wrap it in `useCallback`.",
      },
    ],
    challenges: [
      "Trap Tab focus inside the dialog.",
      "Add toast **actions** ('Undo') and pause the timer on hover.",
      "Animate the modal out before it unmounts.",
    ],
    quiz: [
      {
        q: "What does createPortal change?",
        options: ["The React tree", "Where the DOM nodes are attached", "How state works", "Only event bubbling in the DOM"],
        answer: 1,
        why: "The element stays in the React tree (so context and events behave normally) but is placed in another DOM container.",
      },
      {
        q: "Why must the modal effect's cleanup restore focus and scrolling?",
        options: ["It's optional", "An effect should undo everything it did", "React does it automatically", "For performance"],
        answer: 1,
        why: "Cleanup should mirror setup so nothing leaks after the modal closes.",
      },
    ],
    theory: ["effects"],
  },

  /* ------------------------------------------------------------ Virtual list */
  "virtual-list": {
    learn: [
      "**Windowing**: render only what's visible",
      "`useRef` for imperative DOM access (`scrollTo`)",
      "Deriving the visible slice from `scrollTop` with plain arithmetic",
      "Measuring render cost with `performance.now()` and `useLayoutEffect`",
    ],
    lesson: [
      {
        t: "p",
        text: "React is fast, but 10,000 DOM rows are still 10,000 DOM rows. **Virtualisation** renders only the rows in (or near) the viewport and fakes the rest with a tall spacer, so scrolling still feels natural.",
      },
      {
        t: "ol",
        items: [
          "A tall inner div (`TOTAL × ROW_HEIGHT`) gives the scrollbar its true size.",
          "From `scrollTop`, compute the first and last visible index.",
          "Render just that slice, shifted into place with `translateY`.",
        ],
      },
      {
        t: "callout",
        tone: "key",
        title: "Derived, not stored",
        text: "The visible slice isn't state — it's calculated from `scrollTop` on every render. The only state involved is the scroll position.",
      },
      {
        t: "callout",
        tone: "info",
        title: "Refs are the escape hatch",
        text: "React doesn't own the scroll position; the browser does. We read it from the scroll event and use a ref to call `scrollTo` imperatively.",
      },
    ],
    steps: [
      {
        title: "Work out the visible window",
        region: "window",
        body: "Divide `scrollTop` by the row height to find the first visible row, add the viewport height for the last, and pad both ends with an overscan. `slice` then gives exactly the rows to render — about 20 out of 10,000.",
      },
      {
        title: "Read scroll, write scroll",
        region: "scroll",
        body: "The scroll event feeds `scrollTop` into state, which re-derives the window. To jump to a row we go the other way: a ref to the scroll container lets us call `scrollTo` imperatively.",
      },
      {
        title: "Measure the cost",
        region: "measure",
        body: "`useLayoutEffect` fires right after React updates the DOM and before the browser paints, making it a good place to measure how long a render + commit took after you flip the switch.",
      },
    ],
    mistakes: [
      {
        title: "Variable row heights",
        text: "This simple maths needs fixed heights. Dynamic heights require measuring rows — libraries like TanStack Virtual handle that for you.",
      },
      {
        title: "No overscan",
        text: "Rendering exactly the visible rows shows blank flashes on fast scrolling. Render a few extra rows above and below.",
      },
    ],
    challenges: [
      "Add search that filters the data and stays virtualised.",
      "Add horizontal virtualisation for a data grid.",
      "Use an IntersectionObserver for infinite loading at the bottom.",
    ],
    quiz: [
      {
        q: "What is the only state a simple virtual list needs?",
        options: ["The visible rows", "The scroll offset", "The total count", "The row heights"],
        answer: 1,
        why: "Everything else (first/last index, the slice) is derived from scrollTop.",
      },
      {
        q: "Why is there a tall empty spacer div?",
        options: ["For styling", "So the scrollbar reflects the full list size", "To store rows", "To trigger re-renders"],
        answer: 1,
        why: "It gives the container its full scroll height while only a few rows exist in the DOM.",
      },
    ],
    theory: ["render-commit", "memoization"],
  },

  /* ------------------------------------------------------------ Live chat */
  "live-chat": {
    learn: [
      "React 19 **Actions**: `<form action={fn}>`",
      "`useOptimistic` for instant UI with automatic rollback",
      "`useFormStatus` for pending UI",
      "Refs to scroll inside a container",
      "Effects with timeouts for a simulated bot",
    ],
    lesson: [
      {
        t: "p",
        text: "Great apps feel instant. Waiting a second for a server before showing *your own* message feels broken. **Optimistic UI** shows the result immediately, then reconciles with reality.",
      },
      {
        t: "ol",
        items: [
          "The user submits the form → the **Action** runs.",
          "`addOptimistic(msg)` shows the message greyed out right away.",
          "The Action awaits the (fake) server.",
          "On success we update real state and the optimistic copy is replaced. On failure we don't — and React **rolls it back automatically**.",
        ],
      },
      {
        t: "callout",
        tone: "key",
        title: "Optimistic state is temporary",
        text: "`useOptimistic(realState, reducer)` returns `realState` plus temporary overlays that vanish when the Action finishes. You never write rollback code.",
      },
      {
        t: "callout",
        tone: "info",
        title: "Actions in React 19",
        text: "Passing a function to `<form action>` runs it inside a transition. Pending state, errors and form reset are handled for you.",
      },
      {
        t: "callout",
        tone: "tip",
        title: "Scroll the container, not the page",
        text: "`scrollIntoView` scrolls every ancestor, including the window. Use `container.scrollTo` so only the message list moves.",
      },
    ],
    steps: [
      {
        title: "Layer optimistic state over real state",
        region: "optimistic",
        body: "`useOptimistic(messages, reducer)` gives back `shown` — the real messages plus any pending ones. Render `shown`, and React takes care of removing the temporary entries.",
      },
      {
        title: "The Action",
        region: "action",
        body: "Add the optimistic message, await the server, then either update real state (success) or simply return (failure → automatic rollback). Updates after an `await` go inside `startTransition` so they commit together with the rollback.",
      },
      {
        title: "A bot with a timer effect",
        region: "bot",
        body: "After a successful send we store the pending reply; the effect waits, then appends it. The cleanup cancels the timer if the component unmounts — no update on a dead component.",
      },
      {
        title: "Scroll only the list",
        region: "scroll",
        body: "A ref to the message list lets us call `scrollTo` on that container alone, which keeps the rest of the page still.",
      },
    ],
    mistakes: [
      {
        title: "Updating state after await without startTransition",
        text: "Updates after `await` in an Action should be wrapped in `startTransition` so they commit together with the optimistic rollback.",
      },
      {
        title: "Using scrollIntoView",
        text: "It can scroll the whole page. Prefer `scrollTo` on the message list itself.",
      },
    ],
    challenges: [
      "Add message editing with optimistic updates.",
      "Show 'seen' ticks after a delay.",
      "Add emoji reactions stored per message.",
    ],
    quiz: [
      {
        q: "What happens to an optimistic message if the Action fails and real state isn't updated?",
        options: ["It stays forever", "It disappears — React reverts the overlay", "It throws", "It's saved to localStorage"],
        answer: 1,
        why: "Optimistic values only exist while the Action is pending; afterwards the real state is shown.",
      },
      {
        q: "Why use `container.scrollTo` instead of `element.scrollIntoView`?",
        options: ["scrollIntoView is deprecated", "scrollIntoView may scroll the whole page too", "scrollTo is animated", "It's shorter"],
        answer: 1,
        why: "scrollIntoView scrolls every scrollable ancestor; scrollTo only moves the chosen container.",
      },
    ],
    theory: ["concurrent", "effects"],
  },

  /* ------------------------------------------------------------ Cosmic gallery */
  "cosmic-gallery": {
    learn: [
      "`Suspense` for declarative loading states",
      "The `use` API to read a promise during render",
      "**Error boundaries** for failed requests",
      "`useTransition` to keep old content on screen",
      "Why promises must be **cached**, not created in render",
    ],
    lesson: [
      {
        t: "p",
        text: "Traditionally each component fetched in an effect and tracked its own `loading` and `error` flags. **Suspense** inverts that: a component simply *reads* the data; if it isn't ready, React pauses that part of the tree and shows the nearest fallback.",
      },
      {
        t: "code",
        file: "Gallery.jsx",
        code: `<ErrorBoundary>                        {/* if the promise rejects */}
  <Suspense fallback={<Skeleton />}>   {/* while it is pending */}
    <BodyView promise={promise} />     {/* calls use(promise) */}
  </Suspense>
</ErrorBoundary>`,
      },
      {
        t: "callout",
        tone: "key",
        title: "Loading and error states move to the parent",
        text: "The child only describes the happy path. The boundaries above it decide what to show while waiting, or when things fail.",
      },
      {
        t: "callout",
        tone: "warn",
        title: "Cache your promises",
        text: "`use(fetch(...))` inside a component would create a new promise on every render and suspend forever. Create promises outside render, or cache them by key.",
      },
      {
        t: "callout",
        tone: "tip",
        title: "Transitions keep the page calm",
        text: "Wrapping the update in `startTransition` tells React 'this isn't urgent — keep showing the old content until the new content is ready' instead of flashing a skeleton.",
      },
    ],
    steps: [
      {
        title: "A cached fake API",
        region: "api",
        body: "`fetchBody` returns the same promise for the same id, so re-renders don't start new requests. In production a data library (TanStack Query, Relay, your framework) owns this cache.",
      },
      {
        title: "Read the promise with use()",
        region: "view",
        body: "`use(promise)` returns the value once it's ready. Until then React suspends this component; if the promise rejects, the error is thrown to the nearest error boundary. The component contains no loading or error logic at all.",
      },
      {
        title: "An error boundary",
        region: "boundary",
        body: "Error boundaries are still class components. `getDerivedStateFromError` captures the failure, and `resetKey` lets the boundary recover automatically when the selection changes.",
      },
      {
        title: "Keep old content with a transition",
        region: "transition",
        body: "With `startTransition` the current object stays visible (dimmed) while the next loads. Untick the box and compare: the skeleton flashes instead.",
      },
    ],
    mistakes: [
      {
        title: "Creating the promise during render",
        text: "A brand-new promise on every render never resolves in time; React suspends again and again.",
      },
      {
        title: "No error boundary",
        text: "A rejected promise throws during render. Without a boundary the whole app unmounts.",
      },
    ],
    challenges: [
      "Prefetch the next object on hover.",
      "Add separate `<Suspense>` boundaries around the picture and the text.",
      "Replace the fake API with NASA's APOD API (`https://api.nasa.gov/planetary/apod`).",
    ],
    quiz: [
      {
        q: "What does React do when a component reads an unresolved promise with `use`?",
        options: ["Throws an error", "Suspends and shows the nearest Suspense fallback", "Blocks the main thread", "Retries in a loop"],
        answer: 1,
        why: "The component pauses rendering; the closest Suspense boundary shows its fallback until the promise settles.",
      },
      {
        q: "Why wrap the selection in startTransition?",
        options: ["To make the fetch faster", "To keep the current content visible instead of flashing the fallback", "To cache the promise", "To avoid errors"],
        answer: 1,
        why: "Transitions tell React the update is non-urgent, so already revealed content stays on screen.",
      },
    ],
    theory: ["concurrent"],
  },
};
