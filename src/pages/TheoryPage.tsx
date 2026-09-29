import { useState } from "react";
import { ArrowRight, Check, Clock, FlaskConical, RotateCcw } from "lucide-react";
import { Link } from "../lib/router";
import { useProgress } from "../lib/store";
import { chapterBySlug } from "../data/theory";
import { projects } from "../data/projects";
import { stageOf } from "../data/curriculum";
import { Prose } from "../components/Prose";
import QuizCard from "../components/QuizCard";
import LessonFooter from "../components/LessonFooter";
import { Container } from "../components/ui";
import NotFound from "./NotFound";

export default function TheoryPage({ slug }: { slug: string }) {
  const chapter = chapterBySlug(slug);
  const [run, setRun] = useState(0);
  useProgress();

  if (!chapter) return <NotFound />;

  const id = `theory:${chapter.slug}`;
  const stage = stageOf(id);
  const Icon = chapter.icon;
  const Lab = chapter.Lab;
  const [a, b] = chapter.gradient;
  const related = projects.filter((p) => p.theory.includes(chapter.slug));

  const lab = (
    <div className="my-2 lg:-mx-10 xl:-mx-36">
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line bg-surface2 px-5 py-3">
          <span className="flex items-center gap-2.5 font-display text-sm font-semibold text-ink">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand/15 text-brand">
              <FlaskConical size={15} />
            </span>
            Interactive lab
          </span>
          <button
            onClick={() => setRun((r) => r + 1)}
            className="chip transition hover:text-ink"
            title="Remount the lab to start from scratch"
          >
            <RotateCcw size={12} /> Reset lab
          </button>
        </div>
        <div className="dots">
          <Lab key={run} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <title>{`${chapter.title} · How React Works`}</title>

      <Container className="pb-10 pt-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-ink3">
          <Link to="/theory" className="transition hover:text-brand">
            How React works
          </Link>
          <span>/</span>
          <span className="text-ink2">Chapter {chapter.n}</span>
        </nav>

        <div className="mx-auto mt-8 max-w-3xl">
          <div className="flex items-center gap-4">
            <span
              className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl text-white shadow-xl"
              style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
            >
              <Icon size={28} />
              <span className="absolute -bottom-2 -right-1 font-display text-5xl font-black text-white/20">{chapter.n}</span>
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-brand">
                Chapter {String(chapter.n).padStart(2, "0")}
              </span>
              <span className="chip">
                <Clock size={12} /> {chapter.minutes} min
              </span>
              {stage && <span className="chip">Stage {stage.n}</span>}
            </div>
          </div>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] sm:text-5xl">{chapter.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink2">{chapter.tagline}</p>
        </div>
      </Container>

      <Container>
        <article className="mx-auto max-w-3xl">
          <Prose blocks={chapter.blocks} lab={lab} />

          <section className="mt-14">
            <div className="card relative overflow-hidden p-6 sm:p-8">
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(70% 100% at 0% 0%, color-mix(in oklab, var(--brand) 12%, transparent), transparent)" }}
              />
              <h2 className="relative font-display text-xl font-bold text-ink">Key takeaways</h2>
              <ul className="relative mt-5 space-y-3.5">
                {chapter.takeaways.map((t) => (
                  <li key={t} className="flex gap-3.5 text-[15px] leading-relaxed text-ink2">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/20 text-brand">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-xl font-bold text-ink">Put it into practice</h2>
              <p className="mt-1 text-sm text-ink3">Projects that lean on this chapter.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {related.slice(0, 4).map((p) => {
                  const PIcon = p.icon;
                  return (
                    <Link
                      key={p.slug}
                      to={`/projects/${p.slug}`}
                      className="card group flex items-center gap-3.5 p-3.5 transition hover:-translate-y-0.5 hover:border-line2"
                    >
                      <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
                        style={{ background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }}
                      >
                        <PIcon size={20} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{p.title}</span>
                        <span className="block truncate text-xs text-ink3">{p.level} · {p.minutes} min</span>
                      </span>
                      <ArrowRight size={16} className="text-ink3 transition group-hover:translate-x-1 group-hover:text-brand" />
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <section className="mt-14">
            <h2 className="mb-5 font-display text-xl font-bold text-ink">Check your understanding</h2>
            <QuizCard id={id} questions={chapter.quiz} />
          </section>
        </article>
      </Container>

      <Container className="mt-16">
        <LessonFooter id={id} />
      </Container>
    </>
  );
}
