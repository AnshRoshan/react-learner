import { ArrowLeft, ArrowRight, Check, PartyPopper } from "lucide-react";
import { Link } from "../lib/router";
import { toggleDone, useProgress } from "../lib/store";
import { neighbours, type Lesson } from "../data/curriculum";

function NavCard({ lesson, dir }: { lesson: Lesson; dir: "prev" | "next" }) {
  const Icon = lesson.icon;
  const [a, b] = lesson.gradient;
  return (
    <Link
      to={lesson.href}
      className={`card group flex items-center gap-4 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-line2 ${
        dir === "next" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white"
        style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
      >
        <Icon size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-widest text-ink3">
          {dir === "prev" ? "Previous" : "Up next"} · {lesson.kind === "theory" ? "Lab" : "Project"}
        </span>
        <span className="mt-0.5 block truncate font-display font-semibold text-ink">{lesson.title}</span>
      </span>
      {dir === "prev" ? (
        <ArrowLeft size={18} className="text-ink3 transition group-hover:-translate-x-1 group-hover:text-brand" />
      ) : (
        <ArrowRight size={18} className="text-ink3 transition group-hover:translate-x-1 group-hover:text-brand" />
      )}
    </Link>
  );
}

export default function LessonFooter({ id }: { id: string }) {
  const { done } = useProgress();
  const complete = !!done[id];
  const { prev, next } = neighbours(id);

  return (
    <div className="space-y-5">
      <div
        className={`card flex flex-wrap items-center justify-between gap-4 p-6 transition ${
          complete ? "!border-ok/40" : ""
        }`}
      >
        <div className="flex items-center gap-4">
          <span
            className={`grid h-12 w-12 place-items-center rounded-2xl ${
              complete ? "bg-ok/20 text-ok" : "bg-brand/15 text-brand"
            }`}
          >
            {complete ? <PartyPopper size={22} /> : <Check size={22} />}
          </span>
          <div>
            <p className="font-display text-lg font-bold text-ink">
              {complete ? "Lesson complete — nice work!" : "Finished this lesson?"}
            </p>
            <p className="text-sm text-ink3">Your progress is saved in this browser and shown on the roadmap.</p>
          </div>
        </div>
        <button onClick={() => toggleDone(id)} className={`btn ${complete ? "btn-soft" : "btn-primary"}`}>
          {complete ? (
            <>
              <Check size={16} /> Completed
            </>
          ) : (
            "Mark as complete"
          )}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {prev ? <NavCard lesson={prev} dir="prev" /> : <span />}
        {next ? <NavCard lesson={next} dir="next" /> : <span />}
      </div>
    </div>
  );
}
