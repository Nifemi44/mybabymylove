import { useState } from "react";

/**
 * A sealed red card covered in love emojis. Tapping it opens to reveal a
 * hidden surprise message from Nifemi to Sanaya.
 */
const EMOJIS = ["❤️", "💕", "💖", "😍", "🥰", "💘", "💗", "💞"];

export function SurpriseCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-md px-6">
      <div className="relative h-80 w-full" style={{ minHeight: 300 }}>
        {/* revealed message */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-cream p-8 text-center shadow-xl ring-1 ring-rose/30 transition-opacity duration-500 ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!open}
        >
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-rose">
            your surprise
          </p>
          <p className="mt-4 font-script text-2xl leading-snug text-wine md:text-3xl">
            You are the best thing that ever happened to me, Sanaya.
          </p>
          <p className="mt-4 font-body text-lg italic leading-relaxed text-ink/75">
            Close your eyes, make a wish — I already wished for you, and look,
            it came true. Happy anniversary, my love.
          </p>
          <p className="mt-4 text-2xl">❤️💖🥰</p>
          <p className="mt-4 font-script text-xl text-wine">
            forever yours, Nifemi
          </p>
        </div>

        {/* sealed red card with love emojis */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open your surprise card"
          className={`absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl text-center shadow-xl ring-1 ring-wine/30 transition-opacity duration-500 ${
            open ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          style={{
            background:
              "linear-gradient(135deg, #b21e3a 0%, #d63451 45%, #e04368 100%)",
          }}
        >
          {/* floating emojis */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            {EMOJIS.map((em, i) => (
              <span
                key={i}
                className="a-floaty absolute text-2xl"
                style={{
                  left: `${(i * 37) % 80 + 8}%`,
                  top: `${(i * 53) % 70 + 8}%`,
                  animationDelay: `${(i % 4) * 0.8}s`,
                  animationDuration: `${5 + (i % 3)}s`,
                  opacity: 0.85,
                }}
              >
                {em}
              </span>
            ))}
          </div>

          <p className="relative font-heading text-xs uppercase tracking-[0.3em] text-cream/80">
            a little surprise
          </p>
          <p className="relative font-script text-3xl text-cream md:text-4xl">
            Tap to open 💝
          </p>
          <p className="relative font-body text-base italic text-cream/80">
            something just for you, Sanaya
          </p>
        </button>
      </div>
    </div>
  );
}
