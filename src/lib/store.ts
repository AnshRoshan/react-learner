import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/*  Learning progress (persisted in localStorage)                      */
/* ------------------------------------------------------------------ */
export interface Progress {
  done: Record<string, boolean>;
  quiz: Record<string, number>;
}

const PROGRESS_KEY = "rp:progress:v1";

function readProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Progress>;
      return { done: parsed.done ?? {}, quiz: parsed.quiz ?? {} };
    }
  } catch {
    /* storage unavailable */
  }
  return { done: {}, quiz: {} };
}

let progress: Progress = readProgress();
const progressSubs = new Set<() => void>();

function commitProgress(next: Progress) {
  progress = next;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  progressSubs.forEach((fn) => fn());
}

function subscribeProgress(fn: () => void) {
  progressSubs.add(fn);
  return () => {
    progressSubs.delete(fn);
  };
}

export const useProgress = () => useSyncExternalStore(subscribeProgress, () => progress);

export function toggleDone(id: string) {
  commitProgress({ ...progress, done: { ...progress.done, [id]: !progress.done[id] } });
}

export function markDone(id: string) {
  if (!progress.done[id]) commitProgress({ ...progress, done: { ...progress.done, [id]: true } });
}

export function saveQuizScore(id: string, score: number) {
  const best = Math.max(score, progress.quiz[id] ?? 0);
  commitProgress({ ...progress, quiz: { ...progress.quiz, [id]: best } });
}

export function resetProgress() {
  commitProgress({ done: {}, quiz: {} });
}

/* ------------------------------------------------------------------ */
/*  Theme                                                              */
/* ------------------------------------------------------------------ */
export type Theme = "dark" | "light";

let theme: Theme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
const themeSubs = new Set<() => void>();

export function setTheme(next: Theme) {
  theme = next;
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("rp:theme", next);
  } catch {
    /* ignore */
  }
  themeSubs.forEach((fn) => fn());
}

export const useTheme = () =>
  useSyncExternalStore(
    (fn) => {
      themeSubs.add(fn);
      return () => {
        themeSubs.delete(fn);
      };
    },
    () => theme,
  );
