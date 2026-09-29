import { Component, Suspense, use, useState, useTransition, type ReactNode } from "react";
import { Loader, RefreshCw, TriangleAlert } from "lucide-react";

interface Body {
  id: string;
  name: string;
  kind: string;
  distance: string;
  code: string;
  blurb: string;
  art: string;
}

const BODIES: Body[] = [
  {
    id: "orion", name: "Orion Nebula", kind: "Emission nebula", distance: "1,344 light-years", code: "M42",
    blurb: "A stellar nursery visible to the naked eye in Orion's sword. New stars are being born inside its glowing clouds of gas and dust.",
    art: "radial-gradient(55% 60% at 30% 40%, rgba(255,90,170,.85), transparent 70%), radial-gradient(50% 55% at 68% 58%, rgba(90,130,255,.9), transparent 70%), radial-gradient(35% 40% at 52% 24%, rgba(170,100,255,.8), transparent 70%), #05060f",
  },
  {
    id: "saturn", name: "Saturn", kind: "Gas giant", distance: "1.4 billion km", code: "6th planet",
    blurb: "The ringed giant is mostly hydrogen and helium. Its rings are made of ice and rock fragments, some as small as grains of sand.",
    art: "radial-gradient(circle 74px at 50% 50%, #f7e2b4 0%, #d29a55 55%, #7a4a20 98%, transparent 100%), radial-gradient(ellipse 170px 34px at 50% 50%, transparent 58%, rgba(245,215,160,.9) 60%, rgba(245,215,160,.55) 90%, transparent 93%), #05060f",
  },
  {
    id: "earth", name: "Earth", kind: "Terrestrial planet", distance: "Home", code: "3rd planet",
    blurb: "The only place we know that harbours life. About 71% of the surface is covered in liquid water, which is why it looks blue from orbit.",
    art: "radial-gradient(circle 30px at 44% 42%, rgba(255,255,255,.55), transparent 100%), radial-gradient(circle 68px at 50% 50%, #86d6ff 0%, #2b82d9 50%, #0b2f6b 96%, transparent 100%), radial-gradient(circle 100px at 50% 50%, rgba(90,170,255,.3), transparent 100%), #05060f",
  },
  {
    id: "andromeda", name: "Andromeda Galaxy", kind: "Spiral galaxy", distance: "2.5 million light-years", code: "M31",
    blurb: "Our nearest large galactic neighbour holds about a trillion stars and is on a slow collision course with the Milky Way.",
    art: "radial-gradient(ellipse 60px 22px at 50% 50%, rgba(255,245,225,1), transparent 100%), radial-gradient(ellipse 190px 56px at 50% 50%, rgba(255,190,140,.6) 0%, rgba(150,120,255,.38) 50%, transparent 100%), #05060f",
  },
  {
    id: "sgra", name: "Sagittarius A*", kind: "Supermassive black hole", distance: "26,000 light-years", code: "SgrA*",
    blurb: "The black hole at the centre of our galaxy weighs as much as about four million Suns. Its event horizon is smaller than Mercury's orbit.",
    art: "radial-gradient(circle 44px at 50% 50%, #000 0 96%, transparent 100%), radial-gradient(ellipse 175px 44px at 50% 50%, transparent 24%, rgba(255,175,70,.95) 40%, rgba(255,90,40,.55) 68%, transparent 100%), radial-gradient(circle 120px at 50% 50%, rgba(255,120,60,.2), transparent 100%), #05060f",
  },
  {
    id: "crab", name: "Crab Nebula", kind: "Supernova remnant", distance: "6,500 light-years", code: "M1",
    blurb: "The remains of a star that exploded in the year 1054, recorded by astronomers around the world. A spinning neutron star still powers its glow.",
    art: "radial-gradient(45% 55% at 50% 50%, rgba(80,220,200,.55), transparent 70%), radial-gradient(60% 65% at 42% 48%, rgba(255,120,70,.75), transparent 72%), radial-gradient(40% 45% at 62% 58%, rgba(255,200,90,.6), transparent 70%), #05060f",
  },
  {
    id: "halley", name: "Halley's Comet", kind: "Periodic comet", distance: "Orbits the Sun", code: "1P/Halley",
    blurb: "The most famous comet returns to the inner solar system roughly every 76 years. Its next visit is due in 2061.",
    art: "conic-gradient(from 205deg at 70% 34%, rgba(160,225,255,.85), transparent 14deg, transparent 360deg), radial-gradient(circle 16px at 70% 34%, #fff, rgba(160,225,255,.8) 60%, transparent 100%), #05060f",
  },
  {
    id: "mars", name: "Mars", kind: "Terrestrial planet", distance: "225 million km", code: "4th planet",
    blurb: "The red planet gets its colour from iron oxide dust. It hosts Olympus Mons, the tallest volcano in the solar system.",
    art: "radial-gradient(circle 14px at 50% 24%, rgba(255,255,255,.75), transparent 100%), radial-gradient(circle 62px at 50% 50%, #ffb884 0%, #d2622d 55%, #6a2410 97%, transparent 100%), radial-gradient(circle 96px at 50% 50%, rgba(255,120,70,.18), transparent 100%), #05060f",
  },
];

const STARS = [[12, 20], [28, 64], [41, 12], [57, 78], [66, 30], [78, 58], [88, 16], [92, 84], [7, 88], [35, 42], [52, 50], [72, 8], [19, 50], [84, 40]]
  .map(([x, y], i) => `radial-gradient(${i % 3 === 0 ? 2 : 1}px ${i % 3 === 0 ? 2 : 1}px at ${x}% ${y}%, #fff, transparent)`)
  .join(",");

// @region api
// A fake API: it waits, and can be told to fail. In a real app a data library
// (TanStack Query, Relay, a framework…) owns this cache for you.
let shouldFail = false;
const cache = new Map<string, Promise<Body>>();

function fetchBody(id: string): Promise<Body> {
  let promise = cache.get(id);
  if (!promise) {
    promise = new Promise<Body>((resolve, reject) => {
      setTimeout(() => {
        const body = BODIES.find((b) => b.id === id);
        if (shouldFail || !body) reject(new Error("The observatory link dropped."));
        else resolve(body);
      }, 1200);
    });
    cache.set(id, promise); // cached by id → the SAME promise on every render
  }
  return promise;
}
// @endregion

// @region view
// This component only describes the happy path. No loading flag, no error flag.
function BodyView({ promise }: { promise: Promise<Body> }) {
  const body = use(promise); // suspends until the promise resolves; throws if it rejects

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-solid">
      <div className="relative h-64 sm:h-72" style={{ background: body.art }}>
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: STARS }} />
        <span className="chip absolute left-4 top-4 !border-white/20 !bg-black/40 !text-white/90">{body.kind}</span>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="font-display text-2xl font-bold text-ink">{body.name}</h4>
          <span className="font-mono text-xs text-brand">{body.code}</span>
        </div>
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-ink3">{body.distance}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink2">{body.blurb}</p>
      </div>
    </article>
  );
}
// @endregion

function Skeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-solid" aria-busy="true">
      <div className="skeleton h-64 sm:h-72" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-7 w-1/2 rounded-lg" />
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
      </div>
    </div>
  );
}

// @region boundary
// Error boundaries must be classes (React has no hook for them yet).
// `resetKey` lets the boundary recover when the selection changes.
class ErrorBoundary extends Component<
  { resetKey: string; onRetry: () => void; children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid h-[26rem] place-items-center rounded-2xl border border-bad/40 bg-bad/10 p-6 text-center">
        <div>
          <TriangleAlert className="mx-auto text-bad" size={30} />
          <p className="mt-3 font-display text-lg font-semibold text-ink">Couldn't load this object</p>
          <p className="mt-1 text-sm text-ink2">{this.state.error.message}</p>
          <button className="btn btn-primary btn-sm mt-4" onClick={this.props.onRetry}>
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      </div>
    );
  }
}
// @endregion

export default function CosmicGallery() {
  const [id, setId] = useState(BODIES[0].id);
  const [attempt, setAttempt] = useState(0);
  const [smooth, setSmooth] = useState(true);
  const [fail, setFail] = useState(false);
  const [isPending, startTransition] = useTransition();

  // @region transition
  function select(next: string) {
    if (smooth) {
      // Non-urgent update: React keeps showing the current object until the next one is ready.
      startTransition(() => setId(next));
    } else {
      setId(next); // urgent: the Suspense fallback flashes immediately
    }
  }
  // @endregion

  function retry() {
    cache.delete(id);
    setAttempt((a) => a + 1);
  }

  const promise = fetchBody(id); // cached, so this is the same promise between renders

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="mb-5 grid grid-cols-4 gap-2 sm:grid-cols-8">
        {BODIES.map((b) => (
          <button
            key={b.id}
            onClick={() => select(b.id)}
            aria-label={b.name}
            title={b.name}
            className={`relative aspect-square overflow-hidden rounded-xl border-2 transition hover:scale-105 ${
              id === b.id ? "border-brand shadow-[0_0_20px_-4px_var(--brand)]" : "border-line"
            }`}
            style={{ background: b.art, backgroundSize: "cover", backgroundPosition: "center" }}
          />
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5 text-xs">
        <label className="chip cursor-pointer select-none">
          <input type="checkbox" checked={smooth} onChange={(e) => setSmooth(e.target.checked)} />
          startTransition
        </label>
        <label className="chip cursor-pointer select-none">
          <input
            type="checkbox"
            checked={fail}
            onChange={(e) => {
              shouldFail = e.target.checked;
              setFail(e.target.checked);
            }}
          />
          next request fails
        </label>
        <button
          className="chip transition hover:text-ink"
          onClick={() => {
            cache.clear();
            setAttempt((a) => a + 1);
          }}
        >
          <RefreshCw size={11} /> clear cache
        </button>
        {isPending && (
          <span className="chip !text-brand">
            <Loader size={11} className="animate-spin" /> loading next…
          </span>
        )}
      </div>

      <div className={`transition-opacity duration-300 ${isPending ? "opacity-60" : ""}`}>
        <ErrorBoundary resetKey={`${id}:${attempt}`} onRetry={retry}>
          <Suspense fallback={<Skeleton />}>
            <BodyView promise={promise} />
          </Suspense>
        </ErrorBoundary>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink3">
        Each object loads once (1.2 s), then comes from the cache instantly. {fail && "Failures only affect objects you haven't loaded yet."}
      </p>
    </div>
  );
}
