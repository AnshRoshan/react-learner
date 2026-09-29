import { useState } from "react";
import { BookOpen, Clock, CodeXml, Layers, Route, Target } from "lucide-react";
import { Link } from "../lib/router";
import { useProgress } from "../lib/store";
import { getRegion, CodeBlock } from "../lib/highlight";
import { projectBySlug } from "../data/projects";
import { chapterBySlug } from "../data/theory";
import { stageOf } from "../data/curriculum";
import { Callout, Inline, Prose } from "../components/Prose";
import QuizCard from "../components/QuizCard";
import LessonFooter from "../components/LessonFooter";
import { Container, DemoFrame, LevelBadge, Tabs } from "../components/ui";
import NotFound from "./NotFound";

type TabId = "lesson" | "build" | "source" | "practice";

export default function ProjectPage({ slug }: { slug: string }) {
  const project = projectBySlug(slug);
  const [tab, setTab] = useState<TabId>("lesson");
  const [run, setRun] = useState(0);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  useProgress();

  if (!project) return <NotFound />;

  const id = `project:${project.slug}`;
  const stage = stageOf(id);
  const Icon = project.icon;
  const Demo = project.Demo;
  const [a, b] = project.gradient;
  const theory = project.theory.map((s) => chapterBySlug(s)).filter((c) => c !== undefined);

  return (
    <>
      <title>{`${project.title} · React Projects`}</title>

      <Container className="pb-8 pt-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-ink3">
          <Link to="/projects" className="transition hover:text-brand">
            Projects
          </Link>
          <span>/</span>
          <span className="text-ink2">{project.title}</span>
        </nav>

        <div className="mt-6 flex flex-wrap items-start gap-6">
          <span
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-white shadow-xl"
            style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
          >
            <Icon size={30} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">{project.title}</h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink2">{project.tagline}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <LevelBadge level={project.level} />
              <span className="chip">
                <Clock size={12} /> {project.minutes} min
              </span>
              {stage && (
                <span className="chip">
                  Stage {stage.n} · {stage.title}
                </span>
              )}
              {project.concepts.map((c) => (
                <span key={c} className="chip !text-brand">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <Container>
        <DemoFrame name={project.slug} onReset={() => setRun((r) => r + 1)}>
          <Demo key={run} />
        </DemoFrame>
        <p className="mt-3 text-center text-xs text-ink3">
          This is the real component from <code className="font-mono text-brand">{project.file}</code> — running live.
          Use <b className="text-ink2">Reset</b> to remount it.
        </p>
      </Container>

      <Container className="mt-14">
        <Tabs<TabId>
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "lesson", label: "Lesson", icon: <BookOpen size={16} /> },
            { id: "build", label: "Walkthrough", icon: <Route size={16} /> },
            { id: "source", label: "Full source", icon: <CodeXml size={16} /> },
            { id: "practice", label: "Practice & quiz", icon: <Target size={16} /> },
          ]}
        />

        <div className="mt-10">
          {tab === "lesson" && (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="min-w-0 space-y-12">
                <Prose blocks={project.lesson} />
                <section>
                  <h3 className="mb-4 font-display text-xl font-semibold text-ink">Common mistakes</h3>
                  <div className="grid gap-3.5">
                    {project.mistakes.map((m) => (
                      <Callout key={m.title} tone="warn" title={m.title} text={m.text} />
                    ))}
                  </div>
                </section>
              </div>

              <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                <div className="card p-5">
                  <p className="mb-4 flex items-center gap-2 font-display font-semibold text-ink">
                    <Target size={16} className="text-brand" /> What you'll learn
                  </p>
                  <ul className="space-y-3 text-sm leading-relaxed text-ink2">
                    {project.learn.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        <span>
                          <Inline text={item} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {theory.length > 0 && (
                  <div className="card p-5">
                    <p className="mb-3 flex items-center gap-2 font-display font-semibold text-ink">
                      <Layers size={16} className="text-brand2" /> Go deeper
                    </p>
                    <div className="space-y-2">
                      {theory.map((c) => (
                        <Link
                          key={c.slug}
                          to={`/theory/${c.slug}`}
                          className="block rounded-xl border border-line bg-surface px-3.5 py-2.5 transition hover:border-line2"
                        >
                          <span className="block font-mono text-[11px] text-brand2">Chapter {c.n}</span>
                          <span className="text-sm font-semibold text-ink">{c.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          )}

          {tab === "build" && (
            <ol className="space-y-12">
              {project.steps.map((s, i) => {
                const code = getRegion(project.source, s.region);
                return (
                  <li key={s.region} className="grid gap-5 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-8">
                    <div className="flex gap-4 lg:block">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand font-display text-sm font-bold text-onbrand">
                        {i + 1}
                      </span>
                      <div className="lg:mt-4">
                        <h3 className="font-display text-lg font-semibold text-ink">{s.title}</h3>
                        <p className="mt-2 text-[14.5px] leading-relaxed text-ink2">
                          <Inline text={s.body} />
                        </p>
                      </div>
                    </div>
                    <div className="min-w-0">
                      {code ? (
                        <CodeBlock code={code} file={project.file} />
                      ) : (
                        <p className="text-sm text-ink3">See the full source tab for this part.</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {tab === "source" && (
            <div className="space-y-4">
              <p className="max-w-3xl text-sm leading-relaxed text-ink2">
                This is the complete, unedited file that powers the demo above. It's styled with Tailwind CSS utility
                classes; colour names such as <code className="font-mono text-brand">bg-surface</code> or{" "}
                <code className="font-mono text-brand">text-ink</code> are theme tokens defined in this site's
                <code className="font-mono text-brand"> index.css</code> — swap in your own colours when you copy it.
              </p>
              <CodeBlock code={project.source} file={project.file} maxHeight={720} />
            </div>
          )}

          {tab === "practice" && (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
              <section>
                <h3 className="font-display text-xl font-semibold text-ink">Challenges</h3>
                <p className="mt-1 text-sm text-ink3">Extend the project yourself — reading code teaches, changing it sticks.</p>
                <ul className="mt-5 space-y-3">
                  {project.challenges.map((c, i) => (
                    <li key={i}>
                      <label className="card flex cursor-pointer items-start gap-3.5 p-4 transition hover:border-line2">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4"
                          checked={!!checked[i]}
                          onChange={() => setChecked((s) => ({ ...s, [i]: !s[i] }))}
                        />
                        <span className={`text-[14.5px] leading-relaxed ${checked[i] ? "text-ink3 line-through" : "text-ink2"}`}>
                          <Inline text={c} />
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="mb-5 font-display text-xl font-semibold text-ink">Check your understanding</h3>
                <QuizCard id={id} questions={project.quiz} />
              </section>
            </div>
          )}
        </div>
      </Container>

      <Container className="mt-16">
        <LessonFooter id={id} />
      </Container>
    </>
  );
}
