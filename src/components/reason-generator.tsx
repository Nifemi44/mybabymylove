import { useRef, useState } from "react";

const REASONS = [
  "the way your eyes light up when you talk about something you love",
  "how you laugh with your whole body, not just your face",
  "your mind — sharp, curious, always three steps ahead",
  "the way you say my name when you're half asleep",
  "how you remember tiny details about people you barely know",
  "your patience with me on my worst days",
  "the way you hum without realizing it",
  "how you fight for the people you love",
  "your handwriting — messy and somehow still beautiful",
  "the way you get excited over small, silly things",
  "how safe I feel just sitting next to you in silence",
  "your honesty, even when it's hard to say",
  "the way you make every room feel warmer",
  "how you never let me stay upset for long",
  "your intelligence — you make me want to learn more, just to keep up",
  "the way you dance badly and don't care who's watching",
  "how you always know exactly what to say",
  "your softness with people who are struggling",
  "the way your voice sounds first thing in the morning",
  "how you make ordinary days feel like an adventure",
  "your stubbornness — it's infuriating and somehow adorable",
  "the way you look at me like I hung the moon",
  "how effortlessly beautiful you are, even on your laziest days",
  "your kindness to strangers when you think no one's watching",
  "the way you remember exactly how I take my coffee",
  "how you turn my bad days into good ones without even trying",
  "your courage — you face hard things head-on",
  "the way you steal my hoodies and somehow look better in them",
  "how you always have room in your heart for one more person to love",
  "your curiosity about the world",
  "the way you get shy when I compliment you",
  "how you never make me feel small",
  "your loyalty — fierce and unwavering",
  "the way you sing off-key and full volume in the car",
  "how gently you handle my insecurities",
  "your ambition — watching you chase your dreams",
  "the way you say 'we' instead of 'I' when planning our future",
  "how your presence alone calms me down",
  "your sense of humor — quick, dry, always catches me off guard",
  "the way you hold my hand a little tighter in crowds",
  "how you never let me apologize for being myself",
  "your generosity — with time, love, and everything in between",
  "the way you light up a photo just by being in it",
  "how you make me want to be a better person",
  "your resilience — you bounce back from anything",
  "the way you say 'good morning' like it's the best part of your day",
  "how you remember every little promise I make",
  "your beauty, inside and out, in equal measure",
  "the way being with you feels like coming home",
  "how, somehow, after all this time, I still fall for you every single day",
];

function shuffled(arr: string[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

export function ReasonGenerator() {
  const deck = useRef<string[]>(shuffled(REASONS));
  const pos = useRef(0);
  const [reason, setReason] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  const next = () => {
    if (pos.current >= deck.current.length) {
      deck.current = shuffled(REASONS);
      pos.current = 0;
    }
    const value = deck.current[pos.current];
    pos.current += 1;

    setSpinning(true);
    window.setTimeout(() => {
      setReason(value ?? null);
      setSpinning(false);
    }, 220);
  };

  return (
    <div className="luxury-shadow mx-auto max-w-xl rounded-2xl bg-cream/85 p-8 text-center ring-1 ring-rose/20 sm:p-10">
      <p className="font-heading text-xs uppercase tracking-[0.3em] text-rose">
        a reason, any time you need one
      </p>
      <h3 className="mt-2 font-heading text-2xl font-semibold text-wine sm:text-3xl">
        why I love you
      </h3>

      <div className="mt-6 flex min-h-[4.5rem] items-center justify-center px-2">
        <p
          className={`font-script text-xl text-ink/80 transition-opacity duration-200 sm:text-2xl ${
            spinning ? "opacity-0" : "opacity-100"
          }`}
        >
          {reason ?? "tap below to find out"}
        </p>
      </div>

      <button
        onClick={next}
        className="luxury-clickable mt-6 inline-flex items-center gap-2 rounded-full bg-wine px-7 py-3 font-heading text-sm tracking-wide text-cream"
      >
        {reason ? "another reason →" : "tell me a reason ♥"}
      </button>
    </div>
  );
}
