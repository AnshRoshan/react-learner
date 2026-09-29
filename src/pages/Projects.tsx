import { useState } from "react";
import { Search } from "lucide-react";
import { projects } from "../data/projects";
import type { Level } from "../data/types";
import { ProjectCard } from "../components/Cards";
import { Container, Eyebrow } from "../components/ui";

const LEVELS: ("All" | Level)[] = ["All", "Beginner", "Intermediate", "Advanced"];

export default function Projects() {
  const [level, setLevel] = useState<"All" | Level>("All");
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const shown = projects.filter(
    (p) =>
      (level === "All" || p.level === level) &&
      (!query || `${p.title} ${p.tagline} ${p.concepts.join(" ")}`.toLowerCase().includes(query)),
  );
  const count = (l: "All" | Level) => (l === "All" ? projects.length : projects.filter((p) => p.level === l).length);

  return (
    <>
      <title>Projects · React Projects</title>
      <Container className="pb-10 pt-14">
        <Eyebrow>{projects.length} mini projects</Eyebrow>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] sm:text-6xl">
          Learn by <span className="text-gradient">building</span> small things.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink2">
          Each project is small on purpose so one concept stays in focus. Run it, read the real source, follow the
          walkthrough, then extend it with the challenges.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <div className="glass inline-flex flex-wrap gap-1 rounded-2xl p-1.5" role="group" aria-label="Filter by level">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                aria-pressed={level === l}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  level === l ? "bg-brand text-onbrand shadow-lg" : "text-ink2 hover:bg-surface2 hover:text-ink"
                }`}
              >
                {l}
                <span className={`text-xs ${level === l ? "opacity-80" : "text-ink3"}`}>{count(l)}</span>
              </button>
            ))}
          </div>
          <div className="relative min-w-[14rem] flex-1 sm:max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3" />
            <input
              className="input !pl-10"
              placeholder="Search by concept: useReducer, Suspense…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search projects"
            />
          </div>
        </div>
      </Container>

      <Container>
        {shown.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        ) : (
          <div className="card grid place-items-center px-6 py-20 text-center">
            <p className="font-display text-xl font-bold">No projects match “{q}”</p>
            <p className="mt-1 text-sm text-ink3">Try a different concept, or clear the filters.</p>
            <button
              className="btn btn-soft btn-sm mt-5"
              onClick={() => {
                setQ("");
                setLevel("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </Container>
    </>
  );
}
