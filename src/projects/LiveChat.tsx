import { startTransition, useEffect, useOptimistic, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CircleAlert, Hash, LoaderCircle, Send, X } from "lucide-react";

interface Message {
  id: string;
  author: string;
  text: string;
  time: string;
  pending?: boolean;
}

const CHANNELS = [
  { id: "general", topic: "Welcome to the server 👋" },
  { id: "react-help", topic: "Ask anything about React" },
  { id: "random", topic: "Memes, music and good vibes" },
];

const clock = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const uid = () => Math.random().toString(36).slice(2, 10);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const SEED: Record<string, Message[]> = {
  general: [
    { id: "g1", author: "Nova", text: "Welcome to React HQ! I'm a friendly bot 🤖", time: "09:00" },
    { id: "g2", author: "Nova", text: "Send a message: it shows up instantly (optimistic), then the fake server confirms it.", time: "09:01" },
  ],
  "react-help": [{ id: "r1", author: "Nova", text: "Try asking about hooks, state or effects!", time: "09:02" }],
  random: [{ id: "x1", author: "Nova", text: "This channel is for anything. Say hi 🎉", time: "09:03" }],
};

const GENERIC = ["Nice one! 🙌", "Totally agree.", "Tell me more…", "That's a solid approach.", "Ha, love it 😄"];

function botReply(text: string) {
  const t = text.toLowerCase();
  if (t.includes("hook")) return "Hooks are functions that remember values in numbered slots between renders. Call them in the same order every time 🎣";
  if (t.includes("state")) return "State is a snapshot: each render sees its own values. Use updater functions for chained updates.";
  if (t.includes("effect")) return "Effects synchronise with the outside world. Don't forget the cleanup function!";
  if (t.includes("key")) return "Keys give list items a stable identity. Never use the array index if the list can reorder.";
  if (t.trim().endsWith("?")) return "Great question! The theory labs on this site answer exactly that. 📚";
  return GENERIC[text.length % GENERIC.length];
}

// useFormStatus reads the status of the <form> that CONTAINS this component
function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-label="Send message"
      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-onbrand transition hover:brightness-110 active:scale-95"
    >
      {pending ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}
    </button>
  );
}

function Bubble({ m }: { m: Message }) {
  const mine = m.author === "You";
  return (
    <div className={`flex gap-3 transition-opacity ${m.pending ? "opacity-55" : ""}`}>
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
        style={{
          background: mine ? "linear-gradient(135deg,var(--brand),var(--brand-2))" : "linear-gradient(135deg,#f472b6,#a855f7)",
        }}
      >
        {m.author[0]}
      </span>
      <div className="min-w-0">
        <p className="text-sm">
          <span className="font-semibold text-ink">{m.author}</span>{" "}
          <span className="text-xs text-ink3">{m.time}</span>
          {m.pending && <span className="ml-2 text-[11px] font-semibold text-warn">Sending…</span>}
        </p>
        <p className="break-words text-sm leading-relaxed text-ink2">{m.text}</p>
      </div>
    </div>
  );
}

export default function LiveChat() {
  const [channel, setChannel] = useState("general");
  const [store, setStore] = useState(SEED);
  const [failing, setFailing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<{ channel: string; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const messages = store[channel];

  // @region optimistic
  // `shown` = the real messages + any temporary optimistic ones.
  // Optimistic entries vanish automatically when the Action that added them finishes.
  const [shown, addOptimistic] = useOptimistic(messages, (current: Message[], next: Message) => [...current, next]);
  // @endregion

  // @region action
  // Passing a function to <form action> makes it an Action: React runs it in a transition
  // and gives us FormData, pending state and automatic error handling.
  async function sendAction(formData: FormData) {
    const text = String(formData.get("text") ?? "").trim();
    if (!text) return;
    formRef.current?.reset();
    setError(null);
    const message: Message = { id: uid(), author: "You", text, time: clock() };

    addOptimistic({ ...message, pending: true }); // 1 · show it instantly, greyed out
    await sleep(1100); //                            2 · pretend to talk to a server

    if (failing) {
      // 3a · failure: never touch real state → the optimistic copy is rolled back for us
      setError("Message failed to send. React rolled it back automatically.");
      return;
    }

    // 3b · success: put it in real state. After an `await`, wrap updates in startTransition
    // so they commit together with the optimistic rollback.
    startTransition(() => {
      setStore((s) => ({ ...s, [channel]: [...s[channel], message] }));
    });
    setIncoming({ channel, text: botReply(text) });
  }
  // @endregion

  // @region bot
  // A timer-driven side effect with cleanup: the bot "types" for a moment, then replies.
  useEffect(() => {
    if (!incoming) return;
    const timer = setTimeout(() => {
      const reply: Message = { id: uid(), author: "Nova", text: incoming.text, time: clock() };
      setStore((s) => ({ ...s, [incoming.channel]: [...s[incoming.channel], reply] }));
      setIncoming(null);
    }, 1400);
    return () => clearTimeout(timer);
  }, [incoming]);
  // @endregion

  // @region scroll
  useEffect(() => {
    const el = listRef.current;
    // Scroll ONLY the message list. scrollIntoView() could scroll the whole page too.
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [shown.length, channel, incoming]);
  // @endregion

  const typing = incoming?.channel === channel;
  const topic = CHANNELS.find((c) => c.id === channel)?.topic;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="card flex h-[34rem] overflow-hidden">
        <nav className="hidden w-48 shrink-0 flex-col border-r border-line bg-surface2 p-3 sm:flex">
          <p className="px-2 pb-3 pt-1 font-display text-sm font-bold text-ink">⚛ React HQ</p>
          <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-ink3">Channels</p>
          {CHANNELS.map((c) => (
            <button
              key={c.id}
              onClick={() => setChannel(c.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition ${
                channel === c.id ? "bg-brand/15 font-semibold text-brand" : "text-ink2 hover:bg-surface hover:text-ink"
              }`}
            >
              <Hash size={14} /> {c.id}
            </button>
          ))}
        </nav>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-display text-[15px] font-bold text-ink">
                <Hash size={16} className="text-brand" /> {channel}
              </div>
              <p className="truncate text-xs text-ink3">{topic}</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                className="input !w-auto !py-1 text-xs sm:hidden"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                aria-label="Channel"
              >
                {CHANNELS.map((c) => (
                  <option key={c.id}>{c.id}</option>
                ))}
              </select>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-ink3">
                <input type="checkbox" checked={failing} onChange={(e) => setFailing(e.target.checked)} />
                Simulate failure
              </label>
            </div>
          </header>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {shown.map((m) => (
              <Bubble key={m.id} m={m} />
            ))}
            {typing && <p className="animate-fade text-xs italic text-ink3">Nova is typing…</p>}
          </div>

          {error && (
            <div className="mx-4 mb-2 flex items-center gap-2.5 rounded-xl border border-bad/40 bg-bad/10 px-3.5 py-2 text-[13px] text-ink2">
              <CircleAlert size={16} className="shrink-0 text-bad" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} aria-label="Dismiss error" className="text-ink3 hover:text-ink">
                <X size={14} />
              </button>
            </div>
          )}

          <form ref={formRef} action={sendAction} className="flex gap-2.5 border-t border-line p-3">
            <input
              name="text"
              autoComplete="off"
              placeholder={`Message #${channel}`}
              className="input"
              aria-label="Message"
            />
            <SendButton />
          </form>
        </section>
      </div>
    </div>
  );
}
