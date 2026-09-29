import { Fragment, useState } from "react";
import {
  ArrowRight,
  Blocks,
  Check,
  FlaskConical,
  GraduationCap,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";
import { Link } from "../lib/router";
import { useProgress } from "../lib/store";
import { chapters } from "../data/theory";
import { projects } from "../data/projects";
import { lessons, stages, type Lesson } from "../data/curriculum";
import { AtomLogo } from "../components/Logo";
import { ProjectCard, trackPointer } from "../components/Cards";
import { Container, Eyebrow, ProgressRing, SectionTitle } from "../components/ui";

const TAGS = [
  "useState", "useEffect", "useReducer", "useRef", "useMemo", "useCallback", "useContext", "useOptimistic",
  "use()", "Suspense", "Portals", "Keys", "Reconciliation", "Fiber", "Batching", "Transitions", "Actions", "Error boundaries",
  "Custom hooks", "Immutability", "Derived state", "Cleanup",
];

const PIPELINE = [
  { title: "Trigger", text: "A state setter is called. React queues the update." },
  { title: "Render", text: "Your components run and return a fresh element tree." },
  { title: "Commit", text: "React patches only the DOM nodes that really changed." },
];

/** A tiny live demo of the core idea: state → UI. */
function HeroVisual() {
  const [count, setCount] = useState(3);
  const [changes, setChanges] = useState(0);

  function bump(delta: number) {
    setCount((c) => c + delta);
    setChanges((n) => n + 1); // two updates, one render — batching
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[540px]" aria-hidden={false}>
      <div
        className="absolute inset-[6%] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--orb-1), transparent)" }}
      />
      <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
        <div className="animate-orbit" style={{ animationDuration: "60s" }}>
          <AtomLogo size={360} className="opacity-90" />
        </div>
      </div>

      <div className="absolute left-0 top-[5%] w-[66%] animate-float">
        <div className="glass rounded-2xl p-4 shadow-2xl">
          <div className="mb-3 flex items-center gap-1.5" aria-hidden="true">
            <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <pre className="font-mono text-[12.5px] leading-6 text-ink2">
            <span className="text-brand2">const</span> [count, setCount] ={"\n"}
            {"  "}
            <span className="font-semibold text-brand">useState</span>(<span className="text-brand3">3</span>);
          </pre>
        </div>
      </div>

      <div className="absolute right-0 top-[30%] animate-float-slow">
        <span className="chip !border-brand/40 !bg-brand/10 !px-3.5 !py-2 !text-[13px] !text-brand shadow-lg backdrop-blur">
          <Sparkles size={14} /> UI = f(state)
        </span>
      </div>

      <div className="absolute bottom-[5%] right-0 w-[68%] animate-float-slow" style={{ animationDelay: "-3s" }}>
        <div className="glass rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="chip">live state</span>
            <span className="font-mono text-[11px] text-ink3">render #{changes + 1}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs text-ink3">count =</p>
              <p key={count} className="animate-pop font-display text-5xl font-bold tabular-nums text-gradient">
                {count}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => bump(1)}
                aria-label="Increase count"
                className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-onbrand transition hover:brightness-110 active:scale-90"
              >
                <Plus size={18} />
              </button>
              <button
                onClick={() => bump(-1)}
                aria-label="Decrease count"
                className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface2 text-ink transition hover:border-line2 active:scale-90"
              >
                <Minus size={18} />
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink3">Click — React re-runs your function and patches the screen.</p>
        </div>
      </div>
    </div>
  );
}

function LessonPill({ lesson, done }: { lesson: Lesson; done: boolean }) {
  const Icon = lesson.icon;
  const [a, b] = lesson.gradient;
  return (
    <Link
      to={lesson.href}
      onMouseMove={trackPointer}
      className="card spot group flex items-center gap-3.5 p-3.5 transition duration-300 hover:-translate-y-0.5 hover:border-line2"
    >
      <span
        className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-md"
        style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
      >
        <Icon size={20} />
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">{lesson.title}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink3">
          <span className={`font-semibold ${lesson.kind === "theory" ? "text-brand2" : "text-brand"}`}>
            {lesson.kind === "theory" ? "Lab" : "Project"}
          </span>
          · {lesson.minutes} min
        </span>
      </span>
      {done ? (
        <span className="relative grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ok/20 text-ok">
          <Check size={13} strokeWidth={3} />
        </span>
      ) : (
        <ArrowRight size={16} className="relative text-ink3 transition group-hover:translate-x-1 group-hover:text-brand" />
      )}
    </Link>
  );
}

export default function Home() {
  const { done } = useProgress();
  const completed = lessons.filter((l) => done[l.id]).length;
  const next = lessons.find((l) => !done[l.id]) ?? lessons[0];
  const started = completed > 0;
  const questions =
    chapters.reduce((n, c) => n + c.quiz.length, 0) + projects.reduce((n, p) => n + p.quiz.length, 0);

  return (
    <>
      {/* ------------------------------------------------ hero */}
      <section className="relative">
        <Container className="grid items-center gap-14 pb-16 pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:pb-24 lg:pt-20">
          <div>
            <div className="animate-rise">
              <Eyebrow icon={<Sparkles size={14} className="text-brand" />}>Updated for React 19 · Free &amp; interactive</Eyebrow>
            </div>
            <h1
              className="mt-6 animate-rise font-display text-[2.6rem] font-extrabold leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.2rem]"
              style={{ animationDelay: "0.04s" }}
            >
              Learn React by <span className="text-gradient">seeing</span> how it thinks.
            </h1>
            <p className="mt-6 max-w-xl animate-rise text-lg leading-relaxed text-ink2" style={{ animationDelay: "0.08s" }}>
              {projects.length} hands-on mini projects and {chapters.length} live labs that open the black box —
              rendering, state, hooks, effects and more. Every project comes with a lesson, its real source code and a
              quiz.
            </p>
            <div className="mt-9 flex animate-rise flex-wrap items-center gap-3" style={{ animationDelay: "0.12s" }}>
              <Link to={next.href} className="btn btn-primary">
                {started ? "Continue learning" : "Start the journey"} <ArrowRight size={17} />
              </Link>
              <Link to="/projects" className="btn btn-soft">
                Browse projects
              </Link>
            </div>
            <dl className="mt-12 grid max-w-md animate-rise grid-cols-3 gap-6" style={{ animationDelay: "0.16s" }}>
              {[
                { n: projects.length, l: "Mini projects" },
                { n: chapters.length, l: "Interactive labs" },
                { n: questions, l: "Quiz questions" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="font-display text-3xl font-bold text-ink">{s.n}</dt>
                  <dd className="mt-0.5 text-xs text-ink3">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="animate-rise" style={{ animationDelay: "0.1s" }}>
            <HeroVisual />
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ marquee */}
      <div
        className="relative overflow-hidden border-y border-line py-4"
        style={{
          maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
        }}
        aria-hidden="true"
      >
        <div className="flex w-max animate-marquee gap-3">
          {[...TAGS, ...TAGS].map((t, i) => (
            <span key={i} className="chip !px-4 !py-1.5 font-mono !text-[12.5px]">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------ pillars */}
      <section className="py-24">
        <Container>
          <SectionTitle
            center
            eyebrow="How it works"
            title="Understand it. Build it. Prove it."
            subtitle="Most tutorials show you what to type. This one shows you what React is doing — then lets you build with that knowledge."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: FlaskConical,
                title: "Understand",
                text: "Nine interactive labs expose the machinery: render counters, real DOM mutation counts, hook slots, effect logs, reconciliation diffs.",
                to: "/theory",
                cta: "Explore the labs",
                color: "var(--brand)",
              },
              {
                icon: Blocks,
                title: "Build",
                text: "Sixteen focused projects — each one a live app, its real source with annotated walkthrough, common mistakes and challenges.",
                to: "/projects",
                cta: "Browse projects",
                color: "var(--brand-2)",
              },
              {
                icon: GraduationCap,
                title: "Prove it",
                text: "Every lesson ends with a quiz that explains the answer, and your progress is saved in the browser as you go.",
                to: "/about",
                cta: "See your progress",
                color: "var(--brand-3)",
              },
            ].map((p) => (
              <Link
                key={p.title}
                to={p.to}
                onMouseMove={trackPointer}
                className="card spot group p-7 transition duration-300 hover:-translate-y-1.5 hover:border-line2"
              >
                <span
                  className="relative grid h-12 w-12 place-items-center rounded-2xl"
                  style={{ background: `color-mix(in oklab, ${p.color} 16%, transparent)`, color: p.color }}
                >
                  <p.icon size={24} />
                </span>
                <h3 className="relative mt-5 font-display text-xl font-bold">{p.title}</h3>
                <p className="relative mt-2.5 text-[15px] leading-relaxed text-ink2">{p.text}</p>
                <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: p.color }}>
                  {p.cta} <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ pipeline teaser */}
      <section className="pb-24">
        <Container>
          <div className="card overflow-hidden p-8 sm:p-12">
            <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand">Under the hood</p>
                <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
                  Every update is just <span className="text-gradient">three steps</span>.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink2">
                  Once you can picture trigger, render and commit, most of React's "weird" behaviour — extra
                  re-renders, stale values, effects that fire twice — suddenly makes sense.
                </p>
                <Link to="/theory/render-commit" className="btn btn-soft mt-7">
                  Open the Render &amp; Commit lab <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
                {PIPELINE.map((s, i) => (
                  <Fragment key={s.title}>
                    <div
                      className="rounded-2xl border border-line bg-surface p-5 text-center"
                      style={{ animation: "step-glow 6s ease-in-out infinite", animationDelay: `${i * 2}s` }}
                    >
                      <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-brand font-display text-sm font-bold text-onbrand">
                        {i + 1}
                      </span>
                      <p className="mt-3 font-display font-semibold text-ink">{s.title}</p>
                      <p className="mt-1.5 text-xs leading-relaxed text-ink3">{s.text}</p>
                    </div>
                    {i < PIPELINE.length - 1 && (
                      <ArrowRight className="mx-auto hidden rotate-0 text-ink3 md:block" size={20} />
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ roadmap */}
      <section className="pb-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              eyebrow="Roadmap"
              title="Your learning path"
              subtitle="Follow the stages in order — each one alternates theory labs with projects that put the idea to work."
            />
            <div className="card flex items-center gap-4 px-5 py-4">
              <ProgressRing value={completed / lessons.length} size={52} stroke={5}>
                <span className="text-xs font-bold text-ink">{Math.round((completed / lessons.length) * 100)}%</span>
              </ProgressRing>
              <div>
                <p className="font-display text-lg font-bold text-ink">
                  {completed} / {lessons.length}
                </p>
                <p className="text-xs text-ink3">lessons complete</p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            {stages.map((stage) => {
              const Icon = stage.icon;
              const stageDone = stage.lessons.filter((l) => done[l.id]).length;
              return (
                <div key={stage.n} className="grid gap-5 border-t border-line py-8 md:grid-cols-[15rem_1fr] md:gap-10">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/15 text-brand">
                        <Icon size={20} />
                      </span>
                      <span className="font-mono text-xs font-semibold tracking-widest text-ink3">STAGE {stage.n}</span>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-bold">{stage.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink3">{stage.blurb}</p>
                    <p className="mt-2.5 text-xs font-semibold text-brand">
                      {stageDone}/{stage.lessons.length} done
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {stage.lessons.map((l) => (
                      <LessonPill key={l.id} lesson={l} done={!!done[l.id]} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ featured projects */}
      <section className="pb-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <SectionTitle
              eyebrow="Projects"
              title="Small apps. Big lessons."
              subtitle="Each project is deliberately small so a single concept stays in focus."
            />
            <Link to="/projects" className="btn btn-soft">
              View all {projects.length} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter((p) => ["counter", "todo-list", "pomodoro", "currency-converter", "live-chat", "cosmic-gallery"].includes(p.slug))
              .map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ final CTA */}
      <section>
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] border border-line p-10 text-center sm:p-16">
            <div
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(60% 90% at 20% 0%, color-mix(in oklab, var(--brand) 22%, transparent), transparent), radial-gradient(60% 90% at 90% 100%, color-mix(in oklab, var(--brand-3) 18%, transparent), transparent), var(--surface)",
              }}
            />
            <AtomLogo size={56} className="mx-auto" />
            <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-extrabold leading-tight sm:text-5xl">
              Ready to see React <span className="text-gradient">clearly</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-ink2 sm:text-lg">
              Start with the first lab — it takes eight minutes and changes how you read every component.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to={next.href} className="btn btn-primary">
                {started ? "Continue where you left off" : "Start lesson one"} <ArrowRight size={17} />
              </Link>
              <Link to="/theory" className="btn btn-soft">
                How React works
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
