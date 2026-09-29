import { useState } from "react";
import { Command, Menu, Moon, Search, Sun, X } from "lucide-react";
import { Link, usePath } from "../lib/router";
import { setTheme, useProgress, useTheme } from "../lib/store";
import { lessons } from "../data/curriculum";
import { AtomLogo } from "./Logo";
import { ProgressRing } from "./ui";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/theory", label: "How React Works" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
];

function isActive(path: string, to: string) {
  return to === "/" ? path === "/" : path === to || path.startsWith(to + "/");
}

export default function Nav({ onSearch }: { onSearch: () => void }) {
  const path = usePath();
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const { done } = useProgress();
  const count = lessons.filter((l) => done[l.id]).length;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)} aria-label="React Projects home">
          <AtomLogo size={32} className="transition duration-700 group-hover:rotate-180" />
          <span className="font-display text-[17px] font-bold tracking-tight text-ink">
            React<span className="text-gradient">Projects</span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              aria-current={isActive(path, l.to) ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive(path, l.to) ? "bg-surface2 text-ink" : "text-ink2 hover:bg-surface hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onSearch}
            className="hidden items-center gap-3 rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-ink3 transition hover:border-line2 hover:text-ink sm:flex"
            aria-label="Search lessons"
          >
            <Search size={15} />
            <span>Search</span>
            <span className="flex items-center gap-0.5">
              <span className="kbd flex items-center">
                <Command size={10} />
              </span>
              <span className="kbd">K</span>
            </span>
          </button>
          <button
            onClick={onSearch}
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink2 transition hover:text-ink sm:hidden"
            aria-label="Search lessons"
          >
            <Search size={17} />
          </button>

          <Link
            to="/about"
            title={`${count} of ${lessons.length} lessons complete`}
            className="hidden items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3.5 text-xs font-semibold text-ink2 transition hover:border-line2 lg:flex"
          >
            <ProgressRing value={count / lessons.length} size={30} stroke={3.5} />
            {count}/{lessons.length}
          </Link>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink2 transition hover:border-line2 hover:text-ink"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink2 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="animate-fade border-t border-line bg-bg/95 px-5 py-3 backdrop-blur-xl md:hidden" aria-label="Mobile">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block rounded-xl px-4 py-3 text-[15px] font-medium ${
                isActive(path, l.to) ? "bg-surface2 text-ink" : "text-ink2"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
