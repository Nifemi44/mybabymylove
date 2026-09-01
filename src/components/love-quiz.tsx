import { useEffect, useState } from "react";
import { completeGame, LOVE_KEYS } from "@/lib/love-lock";

/**
 * Game 2: a sweet little "how well do you know us" quiz. Answer all four
 * correctly to earn the second key to the secret love note.
 */
type Question = { q: string; options: string[]; answer: number; note: string };

const QUESTIONS: Question[] = [
  {
    q: "How long have we been loving each other?",
    options: ["6 months", "1 year", "1 year & 9 months", "3 years"],
    answer: 2,
    note: "one year and nine months — and counting, forever.",
  },
  {
    q: "What does Nifemi say is the most captivating thing about you?",
    options: ["Your cute eyes", "Your handwriting", "Your playlist", "Your cooking"],
    answer: 0,
    note: "those eyes hold a little bit of sunshine in them.",
  },
  {
    q: "What does he call you when nobody else is listening?",
    options: ["Boss lady", "My queen", "Champ", "Sunshine kid"],
    answer: 1,
    note: "my queen, always.",
  },
  {
    q: "How does every one of his letters end?",
    options: ["Cheers", "Regards", "Talk soon", "I love you, today and always"],
    answer: 3,
    note: "I love you, today and always. — Nifemi",
  },
];

export function LoveQuiz() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState(false);

  const done = step >= QUESTIONS.length;
  const current = QUESTIONS[step];

  useEffect(() => {
    if (done) completeGame(LOVE_KEYS.quiz);
  }, [done]);

  const choose = (i: number) => {
    if (picked !== null || !current) return;
    setPicked(i);
    if (i === current.answer) {
      setWrong(false);
      window.setTimeout(() => {
        setPicked(null);
        setStep((s) => s + 1);
      }, 1100);
    } else {
      setWrong(true);
      window.setTimeout(() => {
        setPicked(null);
        setWrong(false);
      }, 900);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-cream/85 p-8 text-center shadow-lg ring-1 ring-rose/25">
        <p className="font-heading text-xs uppercase tracking-[0.3em] text-rose">perfect score</p>
        <p className="mt-3 font-script text-3xl text-wine">
          you know us by heart, Sanaya 💖
        </p>
        <p className="mt-3 font-body text-base italic text-ink/70">
          second key unlocked — the secret note is yours now.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-cream/85 p-7 shadow-lg ring-1 ring-rose/25">
      <p className="font-heading text-xs uppercase tracking-[0.3em] text-rose">
        question {step + 1} of {QUESTIONS.length}
      </p>
      <p className="mt-3 font-heading text-xl leading-snug text-wine">{current?.q}</p>

      <div className="mt-5 space-y-3">
        {current?.options.map((opt, i) => {
          const isPicked = picked === i;
          const correct = i === current.answer;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => choose(i)}
              className={`w-full rounded-xl px-4 py-3 text-left font-body text-base transition-all ${
                isPicked && correct
                  ? "bg-rose/30 text-wine ring-2 ring-rose"
                  : isPicked
                    ? "bg-wine/10 text-ink/60 ring-1 ring-wine/20"
                    : "bg-white/70 text-ink/80 ring-1 ring-rose/20 hover:bg-rose/15"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <p className="mt-4 min-h-6 text-center font-body text-sm italic text-ink/60">
        {picked !== null && picked === current?.answer
          ? current?.note
          : wrong
            ? "not quite, my love — try again 💗"
            : ""}
      </p>
    </div>
  );
}
