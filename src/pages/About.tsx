import { ExternalLink, RotateCcw, Star } from "lucide-react";
import { Link } from "../lib/router";
import { resetProgress, useProgress } from "../lib/store";
import { lessons, stages } from "../data/curriculum";
import { Container, Eyebrow, ProgressRing, SectionTitle } from "../components/ui";

const STACK = ["React 19", "TypeScript", "Vite", "Tailwind CSS 4", "lucide-react"];

const META_LESSONS = [
  {
    title: "The router is a hook",
    text: "Navigation uses `useSyncExternalStore` to subscribe to the URL hash — about 20 lines, no library. The same hook powers the theme and progress stores.",
  },
  {
    title: "Progress is external state",
    text: "Your completed lessons live in a tiny store outside React, persisted to localStorage, and read with a hook.",
  },
  {
    title: "The code viewer is real source",
    text: "Each project's walkthrough extracts snippets from the very file that runs the demo, using `?raw` imports and `@region` markers.",
  },
];

export default function About() {
  const { done, quiz } = useProgress();
  const completed = lessons.filter((l) => done[l.id]).length;
  const quizzes = Object.keys(quiz).length;

  return (
    <>
      <title>About · React Projects</title>

      <Container className="pb-10 pt-14">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] sm:text-6xl">
          A React classroom that <span className="text-gradient">shows its work</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink2">
          This site started as a collection of small React apps. It has been redesigned into an interactive academy:
          every project teaches a specific idea, and every theory chapter has a lab that lets you watch React do its
          thing.
        </p>
      </Container>

      <Container>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold">How to use it</h2>
            <ol className="mt-5 space-y-5">
              {[
                ["Follow the roadmap", "Start at stage 1 on the home page. Theory labs and projects alternate so each idea is used right away."],
                ["Play before you read", "Every lab and project is live. Click, break, reset — then read the lesson to see why it behaved that way."],
                ["Read the real code", "The walkthrough tab pulls snippets from the exact source running above it. Try the challenges to make it yours."],
              ].map(([title, text], i) => (
                <li key={title} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand font-display text-sm font-bold text-onbrand">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-display font-semibold text-ink">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink2">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-ink3">
              Tip: press <span className="kbd">Ctrl</span> / <span className="kbd">⌘</span> + <span className="kbd">K</span>{" "}
              anywhere to jump to any lesson.
            </p>
          </div>

          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold">Your progress</h2>
            <div className="mt-5 flex items-center gap-5">
              <ProgressRing value={completed / lessons.length} size={84} stroke={7}>
                <span className="font-display text-lg font-bold text-ink">{Math.round((completed / lessons.length) * 100)}%</span>
              </ProgressRing>
              <div className="text-sm text-ink2">
                <p>
                  <b className="font-display text-2xl text-ink">{completed}</b> of {lessons.length} lessons complete
                </p>
                <p className="mt-1 text-ink3">{quizzes} quizzes finished</p>
              </div>
            </div>
            <ul className="mt-6 space-y-2.5">
              {stages.map((s) => {
                const n = s.lessons.filter((l) => done[l.id]).length;
                return (
                  <li key={s.n} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-ink2">
                      {s.n}. {s.title}
                    </span>
                    <span className="font-mono text-xs text-ink3">
                      {n}/{s.lessons.length}
                    </span>
                  </li>
                );
              })}
            </ul>
            <button
              className="btn btn-soft btn-sm mt-6"
              onClick={() => {
                if (window.confirm("Reset all progress and quiz scores?")) resetProgress();
              }}
            >
              <RotateCcw size={14} /> Reset progress
            </button>
          </div>
        </div>
      </Container>

      <Container className="mt-24">
        <SectionTitle
          eyebrow="Meta"
          title="This site uses what it teaches"
          subtitle="The codebase is small enough to read. A few things worth looking at:"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {META_LESSONS.map((m) => (
            <div key={m.title} className="card p-6">
              <h3 className="font-display text-lg font-semibold text-ink">{m.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink2">
                {m.text.split("`").map((part, i) =>
                  i % 2 ? (
                    <code key={i} className="rounded-md border border-line bg-surface2 px-1.5 py-0.5 text-[0.85em] text-brand">
                      {part}
                    </code>
                  ) : (
                    part
                  ),
                )}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-2.5">
          {STACK.map((s) => (
            <span key={s} className="chip !px-4 !py-1.5 !text-[13px]">
              {s}
            </span>
          ))}
        </div>
      </Container>

      <Container className="mt-24">
        <div className="card flex flex-wrap items-center justify-between gap-6 p-7 sm:p-9">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-bold">Credits</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-ink2">
              The original <b className="text-ink">React Projects</b> collection — the counter, password generator,
              currency converter, calculator, to-do list and friends — was created by{" "}
              <b className="text-ink">Ansh Roshan</b>. This version reimagines those ideas as a guided, theory-first
              learning experience and adds new projects covering effects, context, portals, virtualisation and React 19.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/AnshRoshan/React-Projects"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              <Star size={16} /> Original repository <ExternalLink size={14} />
            </a>
            <Link to="/projects" className="btn btn-soft">
              Browse projects
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
