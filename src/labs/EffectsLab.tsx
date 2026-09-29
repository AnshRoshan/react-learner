import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Eraser } from "lucide-react";

/* A tiny external log so that effects can write to it WITHOUT re-rendering
   the components being demonstrated (which would loop the "no deps" effect). */
type Kind = "effect" | "cleanup" | "event";
interface Entry {
  id: number;
  kind: Kind;
  text: string;
}

function createLog() {
  let entries: Entry[] = [];
  let n = 0;
  const subs = new Set<() => void>();
  const emit = () => subs.forEach((fn) => fn());
  return {
    add(kind: Kind, text: string) {
      entries = [...entries.slice(-59), { id: ++n, kind, text }];
      emit();
    },
    clear() {
      entries = [];
      emit();
    },
    get: () => entries,
    subscribe(fn: () => void) {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
  };
}
type Log = ReturnType<typeof createLog>;

type Mode = "deps" | "empty" | "none";
interface RoomProps {
  roomId: string;
  log: Log;
}

function Status({ roomId, connectedTo, label }: { roomId: string; connectedTo: string; label: string }) {
  const stale = connectedTo !== roomId;
  return (
    <div className={`rounded-xl border p-3.5 ${stale ? "border-bad/50 bg-bad/10" : "border-ok/40 bg-ok/10"}`}>
      <p className="font-mono text-[11px] text-ink3">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">
        {stale ? "⚠️" : "🟢"} Screen shows #{roomId} · connected to #{connectedTo}
      </p>
      {stale && <p className="mt-1 text-xs text-bad">Stale! The effect never re-ran, so it still uses the first room.</p>}
    </div>
  );
}

function RoomWithDeps({ roomId, log }: RoomProps) {
  useEffect(() => {
    log.add("effect", `connect → #${roomId}`);
    return () => log.add("cleanup", `disconnect ← #${roomId}`);
  }, [roomId, log]);
  return <Status roomId={roomId} connectedTo={roomId} label="useEffect(…, [roomId])" />;
}

function RoomEmptyDeps({ roomId, log }: RoomProps) {
  const [first] = useState(roomId);
  useEffect(() => {
    log.add("effect", `connect → #${first}`);
    return () => log.add("cleanup", `disconnect ← #${first}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <Status roomId={roomId} connectedTo={first} label="useEffect(…, [])" />;
}

function RoomNoDeps({ roomId, log }: RoomProps) {
  useEffect(() => {
    log.add("effect", `connect → #${roomId}`);
    return () => log.add("cleanup", `disconnect ← #${roomId}`);
  });
  return <Status roomId={roomId} connectedTo={roomId} label="useEffect(…)  ← no array" />;
}

const KIND_STYLE: Record<Kind, { icon: string; cls: string }> = {
  effect: { icon: "▶", cls: "text-ok" },
  cleanup: { icon: "■", cls: "text-warn" },
  event: { icon: "●", cls: "text-brand" },
};

function LogPanel({ log }: { log: Log }) {
  const entries = useSyncExternalStore(log.subscribe, log.get);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  return (
    <div className="code-surface flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2">
        <span className="font-mono text-xs text-slate-400">event log</span>
        <button
          onClick={log.clear}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <Eraser size={12} /> Clear
        </button>
      </div>
      <div ref={box} className="max-h-[340px] flex-1 space-y-1 overflow-auto p-3 font-mono text-[12.5px]">
        {entries.length === 0 && <p className="text-slate-500">Nothing yet — interact with the controls.</p>}
        {entries.map((e) => (
          <p key={e.id} className={`animate-fade ${KIND_STYLE[e.kind].cls}`}>
            <span className="mr-2 inline-block w-5 text-slate-600">{e.id}</span>
            {KIND_STYLE[e.kind].icon} {e.text}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function EffectsLab() {
  const [log] = useState(createLog);
  const [mode, setMode] = useState<Mode>("deps");
  const [roomId, setRoomId] = useState("general");
  const [mounted, setMounted] = useState(true);
  const [ticks, setTicks] = useState(0);

  const MODES: { id: Mode; label: string }[] = [
    { id: "deps", label: "[roomId]" },
    { id: "empty", label: "[]" },
    { id: "none", label: "no array" },
  ];

  return (
    <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2">
      <div className="min-w-0 space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink3">Dependency array</p>
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  log.add("event", `You switched to dependencies: ${m.label} (component remounts)`);
                  setMode(m.id);
                }}
                className={`rounded-xl border px-3.5 py-2 font-mono text-[13px] font-semibold transition ${
                  mode === m.id ? "border-brand bg-brand/15 text-brand" : "border-line bg-surface text-ink2 hover:border-line2"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="input"
            value={roomId}
            aria-label="Chat room"
            onChange={(e) => {
              log.add("event", `You picked room #${e.target.value} (prop changed)`);
              setRoomId(e.target.value);
            }}
          >
            <option value="general">#general</option>
            <option value="music">#music</option>
            <option value="travel">#travel</option>
          </select>
          <button
            className="btn btn-soft"
            onClick={() => {
              log.add("event", "Unrelated state changed → parent re-renders");
              setTicks((t) => t + 1);
            }}
          >
            Unrelated state: {ticks}
          </button>
        </div>

        <button
          className="btn btn-soft btn-sm"
          onClick={() => {
            log.add("event", mounted ? "You removed the component (unmount)" : "You added the component (mount)");
            setMounted((m) => !m);
          }}
        >
          {mounted ? "Unmount component" : "Mount component"}
        </button>

        {mounted ? (
          mode === "deps" ? (
            <RoomWithDeps key="deps" roomId={roomId} log={log} />
          ) : mode === "empty" ? (
            <RoomEmptyDeps key="empty" roomId={roomId} log={log} />
          ) : (
            <RoomNoDeps key="none" roomId={roomId} log={log} />
          )
        ) : (
          <div className="rounded-xl border border-dashed border-line p-3.5 text-sm text-ink3">Component is unmounted.</div>
        )}

        <p className="text-[12.5px] leading-relaxed text-ink3">
          ▶ <b className="text-ok">effect</b> = setup ran &nbsp; ■ <b className="text-warn">cleanup</b> = teardown ran
          &nbsp; ● <b className="text-brand">event</b> = something you did. Notice cleanup always runs{" "}
          <i>before</i> the next setup, using the <i>old</i> values.
        </p>
      </div>

      <LogPanel log={log} />
    </div>
  );
}
