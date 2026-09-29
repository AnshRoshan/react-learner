import type { MouseEvent } from "react";
import { Check, Clock } from "lucide-react";
import { Link } from "../lib/router";
import { useProgress } from "../lib/store";
import type { Chapter, Project } from "../data/types";
import { LevelBadge } from "./ui";

/** Feeds the pointer position to the CSS spotlight (no React state, so no re-render). */
export function trackPointer(e: MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

export function ProjectCard({ project }: { project: Project }) {
  const { done } = useProgress();
  const complete = !!done[`project:${project.slug}`];
  const Icon = project.icon;
  const [a, b] = project.gradient;

  return (
    <Link
      to={`/projects/${project.slug}`}
      onMouseMove={trackPointer}
      className="card spot group flex flex-col transition duration-300 hover:-translate-y-1.5 hover:border-line2"
    >
      <div className="relative h-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
        <div
          className="absolute inset-0 opacity-25"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.9) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
        />
        <Icon
          size={140}
          strokeWidth={1}
          className="absolute -bottom-8 -right-4 text-white/25 transition duration-500 group-hover:rotate-6 group-hover:scale-110"
        />
        <span className="absolute bottom-4 left-4 grid h-11 w-11 place-items-center rounded-2xl border border-white/30 bg-white/20 text-white backdrop-blur">
          <Icon size={22} />
        </span>
        {complete && (
          <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white text-emerald-600 shadow">
            <Check size={15} strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="relative flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-ink">{project.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink2">{project.tagline}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.concepts.slice(0, 3).map((c) => (
            <span key={c} className="chip !text-[11px]">
              {c}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between pt-5">
          <LevelBadge level={project.level} />
          <span className="flex items-center gap-1.5 text-xs text-ink3">
            <Clock size={13} /> {project.minutes} min
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ChapterCard({ chapter }: { chapter: Chapter }) {
  const { done } = useProgress();
  const complete = !!done[`theory:${chapter.slug}`];
  const Icon = chapter.icon;
  const [a, b] = chapter.gradient;

  return (
    <Link
      to={`/theory/${chapter.slug}`}
      onMouseMove={trackPointer}
      className="card spot group flex gap-5 p-5 transition duration-300 hover:-translate-y-1 hover:border-line2"
    >
      <div
        className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
      >
        <Icon size={28} className="relative transition duration-500 group-hover:scale-125 group-hover:rotate-6" />
        <span className="absolute -bottom-2 -right-1 font-display text-4xl font-black text-white/20">{chapter.n}</span>
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-brand">
          Chapter {String(chapter.n).padStart(2, "0")} · {chapter.minutes} min
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-ink">{chapter.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink2">{chapter.tagline}</p>
      </div>
      {complete && (
        <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ok/20 text-ok">
          <Check size={15} strokeWidth={3} />
        </span>
      )}
    </Link>
  );
}
