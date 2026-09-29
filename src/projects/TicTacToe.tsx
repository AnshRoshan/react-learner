import { useState } from "react";
import { History, RotateCcw } from "lucide-react";

type Cell = "X" | "O" | null;

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// @region winner
// A plain function: the winner is *calculated* from the board, never stored.
function calculateWinner(squares: Cell[]) {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a, b, c] };
    }
  }
  return null;
}
// @endregion

function Square({ value, onClick, win, disabled }: { value: Cell; onClick: () => void; win: boolean; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={value ?? "empty square"}
      className={`grid aspect-square place-items-center rounded-2xl border font-display text-5xl font-bold transition sm:text-6xl ${
        win
          ? "border-brand bg-brand/20 shadow-[0_0_30px_-6px_var(--brand)]"
          : "border-line bg-surface hover:border-line2 hover:bg-surface2"
      } ${!value && !disabled ? "cursor-pointer" : "cursor-default"}`}
    >
      {value && (
        <span key={value} className={`animate-pop ${value === "X" ? "text-brand" : "text-brand3"}`}>
          {value}
        </span>
      )}
    </button>
  );
}

export default function TicTacToe() {
  // @region history
  // The ONLY state: every board so far, and which move we're looking at.
  const [history, setHistory] = useState<Cell[][]>([Array(9).fill(null)]);
  const [move, setMove] = useState(0);
  // @endregion

  // @region derived
  // Everything else is derived while rendering, so it can never get out of sync.
  const squares = history[move];
  const xIsNext = move % 2 === 0;
  const result = calculateWinner(squares);
  const isDraw = !result && squares.every(Boolean);
  // @endregion

  // @region play
  function play(i: number) {
    if (squares[i] || result) return;
    const next = squares.slice(); // copy — never mutate state
    next[i] = xIsNext ? "X" : "O";
    // Playing from the past discards the "future" boards
    setHistory([...history.slice(0, move + 1), next]);
    setMove(move + 1);
  }
  // @endregion

  const status = result
    ? `Winner: ${result.player}`
    : isDraw
      ? "It's a draw"
      : `Next player: ${xIsNext ? "X" : "O"}`;

  return (
    <div className="mx-auto grid max-w-3xl gap-8 px-5 py-10 md:grid-cols-[1fr_15rem]">
      <div>
        <div className="mb-5 flex items-center justify-between">
          <p
            className={`font-display text-xl font-bold ${
              result ? "text-brand" : isDraw ? "text-warn" : "text-ink"
            }`}
          >
            {status}
          </p>
          <button
            className="btn btn-soft btn-sm"
            onClick={() => {
              setHistory([Array(9).fill(null)]);
              setMove(0);
            }}
          >
            <RotateCcw size={14} /> New game
          </button>
        </div>
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-2.5 sm:gap-3">
          {squares.map((value, i) => (
            <Square
              key={i}
              value={value}
              onClick={() => play(i)}
              win={!!result?.line.includes(i)}
              disabled={!!value || !!result}
            />
          ))}
        </div>
      </div>

      <aside>
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <History size={16} className="text-brand" /> Time travel
        </p>
        <ol className="max-h-80 space-y-1.5 overflow-auto pr-1">
          {history.map((_, m) => (
            // Index keys are safe here: the list only ever grows or truncates at the end.
            <li key={m}>
              <button
                onClick={() => setMove(m)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                  m === move
                    ? "border-brand bg-brand/15 font-semibold text-brand"
                    : "border-line bg-surface text-ink2 hover:border-line2"
                }`}
              >
                {m === 0 ? "Go to game start" : `Go to move #${m}`}
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs leading-relaxed text-ink3">
          Each board is an immutable snapshot, so jumping back is just <code className="font-mono text-brand">setMove(m)</code>.
        </p>
      </aside>
    </div>
  );
}
