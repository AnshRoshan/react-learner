import { ExternalLink } from "lucide-react";
import { Link } from "../lib/router";
import { AtomLogo } from "./Logo";
import { Container } from "./ui";

const COLS = [
  {
    title: "Learn",
    links: [
      { to: "/theory", label: "How React works" },
      { to: "/theory/render-commit", label: "Render & commit" },
      { to: "/theory/hooks-internals", label: "Hooks from scratch" },
      { to: "/theory/effects", label: "Effects & lifecycle" },
    ],
  },
  {
    title: "Build",
    links: [
      { to: "/projects", label: "All projects" },
      { to: "/projects/counter", label: "Counter" },
      { to: "/projects/todo-list", label: "Todo list" },
      { to: "/projects/live-chat", label: "Live chat" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-28 border-t border-line">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <AtomLogo size={30} />
            <span className="font-display text-lg font-bold text-ink">
              React<span className="text-gradient">Projects</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink3">
            An interactive academy that teaches React by letting you poke at it — with labs that show what happens
            under the hood and projects you can read, run and remix.
          </p>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink3">{col.title}</p>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-ink2 transition hover:text-brand">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink3">Resources</p>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a
                href="https://react.dev"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-ink2 transition hover:text-brand"
              >
                Official React docs <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/AnshRoshan/React-Projects"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-ink2 transition hover:text-brand"
              >
                Original repository <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <Link to="/about" className="text-ink2 transition hover:text-brand">
                About this project
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-line py-5 text-center text-xs text-ink3">
        Built with React 19, Vite &amp; Tailwind CSS 4 · Redesigned from the original React Projects by Ansh Roshan
      </div>
    </footer>
  );
}
