import { Gauge, GitBranch, Rocket, RefreshCw, Sparkles, Zap, type LucideIcon } from "lucide-react";
import { chapters } from "./theory";
import { projects } from "./projects";

export interface Lesson {
  id: string;
  kind: "theory" | "project";
  slug: string;
  title: string;
  tagline: string;
  href: string;
  icon: LucideIcon;
  minutes: number;
  gradient: [string, string];
}

export interface Stage {
  n: number;
  title: string;
  blurb: string;
  icon: LucideIcon;
  lessons: Lesson[];
}

const byId = new Map<string, Lesson>();

for (const c of chapters) {
  byId.set(`theory:${c.slug}`, {
    id: `theory:${c.slug}`,
    kind: "theory",
    slug: c.slug,
    title: c.title,
    tagline: c.tagline,
    href: `/theory/${c.slug}`,
    icon: c.icon,
    minutes: c.minutes,
    gradient: c.gradient,
  });
}
for (const p of projects) {
  byId.set(`project:${p.slug}`, {
    id: `project:${p.slug}`,
    kind: "project",
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    href: `/projects/${p.slug}`,
    icon: p.icon,
    minutes: p.minutes,
    gradient: p.gradient,
  });
}

const DEFS: { title: string; blurb: string; icon: LucideIcon; ids: string[] }[] = [
  {
    title: "Think in React",
    blurb: "Meet the mental model: UI as a function of state, and JSX as plain objects.",
    icon: Sparkles,
    ids: ["theory:declarative-ui", "theory:jsx-elements", "project:counter", "project:accordion"],
  },
  {
    title: "State & Rendering",
    blurb: "How state really works, and what happens on every single update.",
    icon: RefreshCw,
    ids: ["theory:state-snapshots", "theory:render-commit", "project:tic-tac-toe", "project:color-palette", "project:password-generator"],
  },
  {
    title: "Lists, Keys & Reducers",
    blurb: "Render collections correctly and manage complex state with reducers.",
    icon: GitBranch,
    ids: ["theory:reconciliation", "project:todo-list", "project:calculator", "project:quiz", "project:invoice"],
  },
  {
    title: "Hooks & Effects",
    blurb: "Peek inside hooks, then synchronise with timers, networks and the browser.",
    icon: Zap,
    ids: ["theory:hooks-internals", "theory:effects", "project:pomodoro", "project:currency-converter"],
  },
  {
    title: "Architecture & Performance",
    blurb: "Share state cleanly, escape the DOM tree and render enormous lists.",
    icon: Gauge,
    ids: ["theory:memoization", "project:theme-studio", "project:modal-toasts", "project:virtual-list"],
  },
  {
    title: "Modern React 19",
    blurb: "Concurrent rendering, Actions, optimistic UI and Suspense.",
    icon: Rocket,
    ids: ["theory:concurrent", "project:live-chat", "project:cosmic-gallery"],
  },
];

export const stages: Stage[] = DEFS.map((d, i) => ({
  n: i + 1,
  title: d.title,
  blurb: d.blurb,
  icon: d.icon,
  lessons: d.ids.map((id) => byId.get(id)).filter((l): l is Lesson => Boolean(l)),
}));

/** Every lesson in learning order. */
export const lessons: Lesson[] = stages.flatMap((s) => s.lessons);

export function neighbours(id: string) {
  const i = lessons.findIndex((l) => l.id === id);
  return { prev: i > 0 ? lessons[i - 1] : undefined, next: i >= 0 ? lessons[i + 1] : undefined };
}

export function stageOf(id: string) {
  return stages.find((s) => s.lessons.some((l) => l.id === id));
}
