import { useEffect, useState } from "react";

/**
 * Full-screen romantic envelope that must be clicked to open.
 * Reveals a "Happy Anniversary Nifemi & Sanaya" letter, then fades away.
 */
export function EnvelopeIntro({ onOpened }: { onOpened: () => void }) {
  const [opening, setOpening] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    document.body.style.overflow = gone ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [gone]);

  useEffect(() => {
    if (!opening) return;
    const t = window.setTimeout(() => {
      setGone(true);
      onOpened();
    }, 2400);
    return () => window.clearTimeout(t);
  }, [opening, onOpened]);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-blush px-6 ${
        opening ? "env-overlay-out" : ""
      }`}
    >
      {/* ambient glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="a-pulse absolute -left-20 top-0 size-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(231,160,168,.5), transparent 70%)" }}
        />
        <div
          className="a-floaty2 a-pulse absolute -right-20 bottom-0 size-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(122,46,67,.18), transparent 70%)" }}
        />
        {/* soft spotlight directly behind the envelope, for a premium "on stage" glow */}
        <div
          className="a-pulse absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,.55), transparent 65%)" }}
        />
      </div>

      {/* twinkling sparkles behind the envelope */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="star-twinkle absolute rounded-full"
            style={{
              left: `${(i * 53) % 92 + 4}%`,
              top: `${(i * 37) % 86 + 4}%`,
              width: i % 4 === 0 ? 3 : 1.6,
              height: i % 4 === 0 ? 3 : 1.6,
              backgroundColor: i % 3 === 0 ? "#c5a059" : "#ffffff",
              animationDuration: `${2 + (i % 4)}s`,
              animationDelay: `${(i % 6) * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* floating love emojis */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {["❤️", "💕", "💖", "🥰", "💘", "💗", "💞", "😍", "💝", "💌", "💓", "🌹"].map((em, i) => (
          <span
            key={i}
            className="a-floaty absolute"
            style={{
              left: `${(i * 29) % 88 + 4}%`,
              top: `${(i * 41) % 82 + 6}%`,
              fontSize: `${16 + ((i * 7) % 18)}px`,
              opacity: 0.75,
              animationDelay: `${(i % 5) * 0.7}s`,
              animationDuration: `${5 + (i % 4)}s`,
            }}
          >
            {em}
          </span>
        ))}
      </div>

      <div className="env-in relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <p className="a-fade-1 font-heading text-xs uppercase tracking-[0.35em] text-rose sm:text-sm">
          a letter for you
        </p>

        {/* envelope */}
        <button
          type="button"
          onClick={() => !opening && setOpening(true)}
          aria-label="Open the anniversary letter"
          className="group relative mt-8 w-full max-w-md cursor-pointer"
          style={{ perspective: "1200px" }}
        >
          <div
            className={`relative aspect-[3/2] w-full ${!opening ? "env-idle-sway" : ""}`}
            style={{
              transformStyle: "preserve-3d",
              transform: opening ? undefined : "rotateX(7deg) rotateY(-6deg)",
              transition: "transform 0.4s ease",
            }}
          >
            {/* floating drop shadow beneath the envelope — the "lifted, 3D" illusion */}
            <div
              aria-hidden="true"
              className={`absolute left-1/2 top-[104%] h-8 w-[86%] -translate-x-1/2 rounded-full blur-xl ${
                !opening ? "env-shadow-breathe" : ""
              }`}
              style={{ background: "rgba(58,34,41,0.35)" }}
            />

            {/* letter inside */}
            <div
              className={`glass-panel absolute inset-x-[7%] bottom-[8%] top-[10%] z-[2] rounded-sm px-5 py-6 ${
                opening ? "env-letter-rise" : "opacity-0"
              }`}
            >
              <p className="font-heading text-[10px] uppercase tracking-[0.3em] text-rose">
                happy anniversary
              </p>
              <p className="mt-3 font-script text-2xl leading-tight text-wine sm:text-3xl">
                Nifemi <span className="text-rose">♥</span> Sanaya
              </p>
              <p className="mt-3 font-body text-sm italic text-ink/70">
                one year &amp; nine months of loving you
              </p>
            </div>

            {/* envelope body */}
            <div
              className="absolute inset-0 z-[3] overflow-hidden rounded-md bg-rose/90 ring-1 ring-wine/15"
              style={{ boxShadow: "0 22px 45px -18px rgba(58,34,41,0.55), 0 2px 0 rgba(255,255,255,0.4) inset" }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(160deg, #f0bcc4 0%, #e7a0a8 55%, #dd8f9b 100%)",
                }}
              />
              {/* fold lines, deepened slightly for more dimension */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-50"
                style={{
                  background:
                    "linear-gradient(to top right, transparent 49.2%, rgba(255,255,255,.65) 50%, transparent 50.8%), linear-gradient(to top left, transparent 49.2%, rgba(255,255,255,.65) 50%, transparent 50.8%), linear-gradient(to top right, transparent 49.6%, rgba(122,46,67,.18) 50%, transparent 50.4%)",
                }}
              />
              {/* soft inner shadow near the edges for paper thickness */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{ boxShadow: "inset 0 0 24px rgba(122,46,67,0.22)" }}
              />
              {/* glossy sheen sweeping across the paper */}
              <div aria-hidden="true" className="env-sheen pointer-events-none absolute inset-y-0 -left-1/2 w-1/3" />
            </div>

            {/* flap */}
            <div
              className={`absolute inset-x-0 top-0 h-1/2 ${
                opening ? "env-flap-open" : "env-flap"
              }`}
              style={{ zIndex: opening ? 1 : 4 }}
            >
              <div
                className="size-full rounded-t-md"
                style={{
                  background: "linear-gradient(180deg, #eaa9b2 0%, #dd8f9b 100%)",
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  boxShadow: "0 10px 18px -8px rgba(58,34,41,0.4)",
                }}
              />
            </div>

            {/* wax seal — layered for a glossy, dimensional look */}
            <div
              className={`absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-1/2 ${
                opening ? "env-seal-pop" : "transition-transform group-hover:scale-110"
              }`}
            >
              <span
                aria-hidden="true"
                className="env-seal-glow absolute inset-0 -m-3 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(197,160,89,0.55), transparent 70%)" }}
              />
              <span
                className="relative flex size-16 items-center justify-center rounded-full font-script text-2xl text-cream"
                style={{
                  background:
                    "radial-gradient(circle at 32% 28%, #9c4a5f 0%, #7a2e43 45%, #5e2233 100%)",
                  boxShadow:
                    "0 8px 16px -4px rgba(58,34,41,0.6), inset 0 2px 3px rgba(255,255,255,0.35), inset 0 -3px 6px rgba(0,0,0,0.35)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-[3px] rounded-full"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(197,160,89,0.55)" }}
                />
                N&amp;S
              </span>
            </div>
          </div>
        </button>

        <p
          className={`a-fade-3 mt-8 font-body text-lg italic text-wine/80 transition-opacity ${
            opening ? "opacity-0" : "a-pulse"
          }`}
        >
          tap the letter to open it, my love
        </p>
      </div>
    </div>
  );
}
