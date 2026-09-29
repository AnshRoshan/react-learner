import { useState } from "react";
import { Heart } from "lucide-react";
import { CodeBlock } from "../lib/highlight";
import { LabLabel } from "./shared";

type Status = "loading" | "empty" | "error" | "success";

const STATUSES: { id: Status; label: string }[] = [
  { id: "loading", label: "Loading" },
  { id: "empty", label: "Empty" },
  { id: "error", label: "Error" },
  { id: "success", label: "Success" },
];

const CODE = `function ProfileCard({ status, liked }) {
  if (status === 'loading') return <Skeleton />;
  if (status === 'error') return <ErrorBanner />;
  if (status === 'empty') return <EmptyState />;

  return (
    <Card>
      <Avatar name="Ada Lovelace" />
      <FollowButton active={liked} />
    </Card>
  );
}`;

const ACTIVE_LINES: Record<Status, number[]> = {
  loading: [2],
  error: [3],
  empty: [4],
  success: [6, 7, 8, 9, 10, 11],
};

function ProfileCard({ status, liked, onToggle }: { status: Status; liked: boolean; onToggle: () => void }) {
  if (status === "loading") {
    return (
      <div className="w-full max-w-[230px] space-y-4">
        <div className="flex items-center gap-3">
          <div className="skeleton h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        </div>
        <div className="skeleton h-9 w-full rounded-xl" />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="w-full max-w-[230px] rounded-2xl border border-bad/40 bg-bad/10 p-5 text-center">
        <p className="text-3xl">⚠️</p>
        <p className="mt-2 text-sm font-semibold text-bad">Couldn't load profile</p>
        <p className="mt-0.5 text-xs text-ink3">Check your connection and retry.</p>
      </div>
    );
  }
  if (status === "empty") {
    return (
      <div className="w-full max-w-[230px] rounded-2xl border border-dashed border-line2 p-5 text-center">
        <p className="text-3xl">🫥</p>
        <p className="mt-2 text-sm font-semibold text-ink">No profile yet</p>
        <p className="mt-0.5 text-xs text-ink3">Nothing to show here.</p>
      </div>
    );
  }
  return (
    <div className="w-full max-w-[230px] text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand to-brand2 font-display text-lg font-bold text-onbrand shadow-lg">
        AL
      </div>
      <p className="mt-3 font-display font-semibold text-ink">Ada Lovelace</p>
      <p className="text-xs text-ink3">First programmer</p>
      <button onClick={onToggle} className={`btn btn-sm mt-4 w-full ${liked ? "btn-primary" : "btn-soft"}`}>
        <Heart size={14} fill={liked ? "currentColor" : "none"} />
        {liked ? "Following" : "Follow"}
      </button>
    </div>
  );
}

export default function DeclarativeLab() {
  const [status, setStatus] = useState<Status>("success");
  const [liked, setLiked] = useState(false);

  return (
    <div className="grid gap-6 p-5 sm:p-7 xl:grid-cols-[0.8fr_1.4fr_0.8fr]">
      <section className="space-y-3">
        <LabLabel n={1} title="State" sub="the only thing you change" />
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStatus(s.id)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                status === s.id
                  ? "border-brand bg-brand/15 text-brand"
                  : "border-line bg-surface text-ink2 hover:border-line2"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm">
          <span className="font-mono text-ink2">liked</span>
          <input type="checkbox" checked={liked} onChange={(e) => setLiked(e.target.checked)} className="h-4 w-4" />
        </label>
        <pre className="code-surface rounded-xl p-3.5 font-mono text-[12.5px] leading-6">
          {`{\n  status: `}
          <span className="tok-str">"{status}"</span>
          {`,\n  liked: `}
          <span className="tok-kw">{String(liked)}</span>
          {`\n}`}
        </pre>
      </section>

      <section className="min-w-0 space-y-3">
        <LabLabel n={2} title="Your component" sub="UI = f(state) — highlighted: the branch React runs" />
        <CodeBlock code={CODE} highlight={ACTIVE_LINES[status]} lineNumbers={false} />
      </section>

      <section className="space-y-3">
        <LabLabel n={3} title="The UI" sub="what lands on screen" />
        <div className="grid min-h-[250px] place-items-center rounded-2xl border border-line bg-bg/40 p-4">
          <ProfileCard status={status} liked={liked} onToggle={() => setLiked((l) => !l)} />
        </div>
        <p className="text-xs leading-relaxed text-ink3">
          Try clicking <b className="text-ink2">Follow</b> inside the card: the UI changes state, state re-runs the
          function, and the function returns the new UI.
        </p>
      </section>
    </div>
  );
}
