import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

type Mode = "focus" | "short" | "long";

const MODES: Record<Mode, { label: string; minutes: number; color: string }> = {
  focus: { label: "Focus", minutes: 25, color: "var(--brand)" },
  short: { label: "Short break", minutes: 5, color: "var(--ok)" },
  long: { label: "Long break", minutes: 15, color: "var(--brand-2)" },
};

const RADIUS = 96;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// @region useInterval
// A custom hook for timers that avoids the "stale closure" trap:
// the interval is created once per `delay`, but always calls the NEWEST callback.
function useInterval(callback: () => void, delay: number | null) {
  const saved = useRef(callback);

  useEffect(() => {
    saved.current = callback; // remember the latest callback after every render…
  });

  useEffect(() => {
    if (delay === null) return; // null means "paused"
    const id = setInterval(() => saved.current(), delay); // …but never restart the timer because of it
    return () => clearInterval(id); // cleanup: runs on pause, on delay change and on unmount
  }, [delay]);
}
// @endregion

const durationOf = (mode: Mode, demo: boolean) => MODES[mode].minutes * (demo ? 1000 : 60000);

export default function Pomodoro() {
  // @region state
  const [mode, setMode] = useState<Mode>("focus");
  const [demo, setDemo] = useState(true); // demo speed: "minutes" become seconds
  const [endAt, setEndAt] = useState<number | null>(null); // the moment the timer will finish; null = not running
  const [leftMs, setLeftMs] = useState(() => durationOf("focus", true)); // time left while paused
  const [now, setNow] = useState(() => Date.now());
  const [sessions, setSessions] = useState(0);
  // @endregion

  // @region derived
  // We never count ticks. Remaining time is derived from real clock timestamps,
  // so it stays accurate even if the browser throttles the timer in a background tab.
  const running = endAt !== null;
  const remaining = running ? Math.max(0, endAt - now) : leftMs;
  const duration = durationOf(mode, demo);
  const fraction = 1 - remaining / duration;
  const secs = Math.ceil(remaining / 1000);
  const mmss = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  // @endregion

  function switchMode(next: Mode, nextDemo = demo) {
    setMode(next);
    setEndAt(null);
    setLeftMs(durationOf(next, nextDemo));
  }

  function finish() {
    if (mode === "focus") {
      setSessions((s) => s + 1);
      switchMode(sessions % 4 === 3 ? "long" : "short");
    } else {
      switchMode("focus");
    }
  }

  useInterval(
    () => {
      const t = Date.now();
      setNow(t);
      if (endAt !== null && t >= endAt) finish();
    },
    running ? 200 : null,
  );

  // @region title
  // A real "outside world" effect: mirror the countdown in the browser tab title.
  useEffect(() => {
    if (!running) return;
    const previous = document.title;
    document.title = `${mmss} · ${MODES[mode].label}`;
    return () => {
      document.title = previous; // cleanup restores it
    };
  }, [running, mmss, mode]);
  // @endregion

  function start() {
    const t = Date.now();
    setNow(t);
    setEndAt(t + leftMs);
  }
  function pause() {
    setLeftMs(Math.max(0, (endAt as number) - Date.now()));
    setEndAt(null);
  }

  const color = MODES[mode].color;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-7 px-5 py-10">
      <div className="glass inline-flex rounded-2xl p-1.5 text-sm font-semibold">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`rounded-xl px-3.5 py-2 transition ${
              mode === m ? "bg-surface2 text-ink shadow" : "text-ink3 hover:text-ink"
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      <div className="relative grid h-72 w-72 place-items-center">
        <svg viewBox="0 0 220 220" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="110" cy="110" r={RADIUS} fill="none" strokeWidth="10" className="stroke-line2" />
          <circle
            cx="110"
            cy="110"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
            style={{ stroke: color, filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dashoffset 0.25s linear" }}
          />
        </svg>
        <div className="text-center">
          <div className="font-display text-6xl font-bold tabular-nums tracking-tight text-ink">{mmss}</div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color }}>
            {running ? MODES[mode].label : "ready"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            setEndAt(null);
            setLeftMs(duration);
          }}
          aria-label="Reset timer"
          className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surface2 text-ink transition hover:border-line2 active:scale-90"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={running ? pause : start}
          aria-label={running ? "Pause" : "Start"}
          className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full text-onbrand transition hover:brightness-110 active:scale-90"
          style={{ background: color, boxShadow: `0 12px 34px -10px ${color}` }}
        >
          {running ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
        </button>
        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-line bg-surface text-[10px] font-bold text-ink2">
          <span className="text-base leading-none text-ink">{sessions}</span>
          done
        </div>
      </div>

      <div className="flex items-center gap-2" aria-label="Sessions until long break">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-2 w-8 rounded-full transition-colors duration-500"
            style={{ background: i < sessions % 4 ? "var(--brand)" : "var(--line-2)" }}
          />
        ))}
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink2">
        <input
          type="checkbox"
          checked={demo}
          onChange={(e) => {
            setDemo(e.target.checked);
            switchMode(mode, e.target.checked);
          }}
        />
        Demo speed <span className="text-ink3">(minutes become seconds)</span>
      </label>
    </div>
  );
}
