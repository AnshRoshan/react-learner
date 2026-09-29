import { useState } from "react";
import { Award, Check, RotateCcw, X } from "lucide-react";
import type { QuizQ } from "../data/types";
import { saveQuizScore, useProgress } from "../lib/store";
import { Inline } from "./Prose";

const LETTERS = ["A", "B", "C", "D", "E"];

export default function QuizCard({ id, questions }: { id: string; questions: QuizQ[] }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const best = useProgress().quiz[id];

  const answered = picked.filter((p) => p !== null).length;
  const score = picked.reduce<number>((sum, p, i) => sum + (p === questions[i].answer ? 1 : 0), 0);
  const finished = answered === questions.length;

  function choose(qi: number, oi: number) {
    if (picked[qi] !== null) return;
    const next = picked.map((p, i) => (i === qi ? oi : p));
    setPicked(next);
    if (next.every((p) => p !== null)) {
      saveQuizScore(
        id,
        next.reduce<number>((sum, p, i) => sum + (p === questions[i].answer ? 1 : 0), 0),
      );
    }
  }

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => {
        const chosen = picked[qi];
        return (
          <div key={qi} className="card p-5 sm:p-6">
            <p className="flex gap-3 font-display text-[17px] font-semibold leading-snug text-ink">
              <span className="font-mono text-sm text-brand">Q{qi + 1}</span>
              <span>{q.q}</span>
            </p>
            <div className="mt-4 grid gap-2.5">
              {q.options.map((opt, oi) => {
                const isAnswer = oi === q.answer;
                const isChosen = chosen === oi;
                let cls = "border-line bg-surface hover:border-line2 hover:bg-surface2";
                if (chosen !== null) {
                  if (isAnswer) cls = "border-ok/60 bg-ok/10";
                  else if (isChosen) cls = "border-bad/60 bg-bad/10";
                  else cls = "border-line bg-surface opacity-55";
                }
                return (
                  <button
                    key={oi}
                    onClick={() => choose(qi, oi)}
                    disabled={chosen !== null}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[14.5px] text-ink transition ${cls}`}
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-surface2 font-mono text-xs font-bold text-ink2">
                      {chosen !== null && isAnswer ? (
                        <Check size={14} className="text-ok" />
                      ) : chosen !== null && isChosen ? (
                        <X size={14} className="text-bad" />
                      ) : (
                        LETTERS[oi]
                      )}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {chosen !== null && (
              <p className="mt-4 animate-fade rounded-xl bg-surface2 p-3.5 text-sm leading-relaxed text-ink2">
                <span className="font-semibold text-ink">{chosen === q.answer ? "Correct. " : "Not quite. "}</span>
                <Inline text={q.why} />
              </p>
            )}
          </div>
        );
      })}

      {finished && (
        <div className="card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/15 text-brand">
              <Award size={24} />
            </span>
            <div>
              <p className="font-display text-xl font-bold">
                You scored {score} / {questions.length}
              </p>
              <p className="text-sm text-ink3">
                {score === questions.length
                  ? "Perfect — you've got this concept."
                  : "Re-read the lesson and try again."}
                {best !== undefined && ` Best: ${best}/${questions.length}`}
              </p>
            </div>
          </div>
          <button className="btn btn-soft btn-sm" onClick={() => setPicked(questions.map(() => null))}>
            <RotateCcw size={14} /> Try again
          </button>
        </div>
      )}
    </div>
  );
}
