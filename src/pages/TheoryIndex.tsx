import { Fragment } from "react";
import { ArrowRight, FlaskConical } from "lucide-react";
import { chapters } from "../data/theory";
import { ChapterCard } from "../components/Cards";
import { Container, Eyebrow, SectionTitle } from "../components/ui";

const BIG_PICTURE = ["Event", "setState", "Render", "Reconcile", "Commit", "Effects"];

const HOOKS: { hook: string; does: string; use: string }[] = [
  { hook: "useState", does: "Remembers a value between renders", use: "UI data that changes over time" },
  { hook: "useReducer", does: "State plus a pure update function", use: "Many related updates in one place" },
  { hook: "useRef", does: "A mutable box that never triggers a render", use: "DOM nodes, timers, previous values" },
  { hook: "useEffect", does: "Syncs with the outside world after commit", use: "Subscriptions, timers, network" },
  { hook: "useLayoutEffect", does: "Like useEffect, but before the browser paints", use: "Measuring layout, avoiding flicker" },
  { hook: "useMemo", does: "Caches the result of a calculation", use: "Genuinely expensive derived data" },
  { hook: "useCallback", does: "Caches a function's identity", use: "Stable props for memo'd children" },
  { hook: "useContext", does: "Reads the nearest Provider's value", use: "Avoiding prop drilling" },
  { hook: "useTransition", does: "Marks a state update as non-urgent", use: "Keeping the UI responsive" },
  { hook: "useDeferredValue", does: "A copy of a value that lags behind", use: "Slow re-renders while typing" },
  { hook: "useOptimistic", does: "Temporary state during an Action (React 19)", use: "Instant feedback that can roll back" },
  { hook: "use", does: "Reads a promise or context during render (React 19)", use: "Suspense-based data reading" },
  { hook: "useId", does: "A stable unique id, safe for SSR", use: "Linking labels and inputs" },
  { hook: "useSyncExternalStore", does: "Subscribes to a store outside React", use: "Routers, global stores, browser APIs" },
];

export default function TheoryIndex() {
  return (
    <>
      <title>How React Works · React Projects</title>

      <Container className="pb-12 pt-14">
        <Eyebrow icon={<FlaskConical size={14} className="text-brand" />}>{chapters.length} interactive labs</Eyebrow>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] sm:text-6xl">
          How React <span className="text-gradient">really</span> works.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink2">
          Nine short chapters, each built around a lab you can poke. No hand-waving: the counters, DOM mutation
          numbers and logs you'll see are measured from real React running on this page.
        </p>
      </Container>

      <Container>
        <div className="card p-6 sm:p-8">
          <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand">The big picture</p>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {BIG_PICTURE.map((step, i) => (
              <Fragment key={step}>
                <span className="rounded-xl border border-line bg-surface2 px-4 py-2.5 font-mono text-sm font-semibold text-ink">
                  {step}
                </span>
                {i < BIG_PICTURE.length - 1 && <ArrowRight size={16} className="text-ink3" />}
              </Fragment>
            ))}
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-ink2">
            An <b className="text-ink">event</b> calls <b className="text-ink">setState</b>. React schedules a{" "}
            <b className="text-ink">render</b> — your components run and return elements. It{" "}
            <b className="text-ink">reconciles</b> the new tree against the old one, <b className="text-ink">commits</b>{" "}
            the minimal DOM changes, and finally runs your <b className="text-ink">effects</b>. Every chapter below zooms
            into one of these arrows.
          </p>
        </div>
      </Container>

      <Container className="mt-10">
        <div className="grid gap-5 md:grid-cols-2">
          {chapters.map((c) => (
            <ChapterCard key={c.slug} chapter={c} />
          ))}
        </div>
      </Container>

      <Container className="mt-24">
        <SectionTitle
          eyebrow="Cheat sheet"
          title="Hooks at a glance"
          subtitle="What each hook is for — and the situation that should make you reach for it."
        />
        <div className="card mt-10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface2 text-xs uppercase tracking-widest text-ink3">
                  <th className="px-5 py-3.5 font-semibold">Hook</th>
                  <th className="px-5 py-3.5 font-semibold">What it does</th>
                  <th className="px-5 py-3.5 font-semibold">Reach for it when…</th>
                </tr>
              </thead>
              <tbody>
                {HOOKS.map((h) => (
                  <tr key={h.hook} className="border-b border-line last:border-0 transition hover:bg-surface">
                    <td className="px-5 py-3.5 font-mono text-[13px] font-semibold text-brand">{h.hook}</td>
                    <td className="px-5 py-3.5 text-ink2">{h.does}</td>
                    <td className="px-5 py-3.5 text-ink3">{h.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </>
  );
}
