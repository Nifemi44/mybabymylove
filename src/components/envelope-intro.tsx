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
      </div>

      <div className="env-in relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <p className="font-heading text-xs uppercase tracking-[0.35em] text-rose sm:text-sm">
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
          <div className="relative aspect-[3/2] w-full">
            {/* letter inside */}
            <div
              className={`absolute inset-x-[7%] bottom-[8%] top-[10%] rounded-sm bg-cream px-5 py-6 shadow-lg ring-1 ring-rose/25 ${
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
            <div className="absolute inset-0 overflow-hidden rounded-md bg-rose/90 shadow-xl ring-1 ring-wine/15">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(160deg, #f0bcc4 0%, #e7a0a8 55%, #dd8f9b 100%)",
                }}
              />
              {/* fold lines */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-40"
                style={{
                  background:
                    "linear-gradient(to top right, transparent 49.4%, rgba(255,255,255,.6) 50%, transparent 50.6%), linear-gradient(to top left, transparent 49.4%, rgba(255,255,255,.6) 50%, transparent 50.6%)",
                }}
              />
            </div>

            {/* flap */}
            <div
              className={`absolute inset-x-0 top-0 h-1/2 ${
                opening ? "env-flap-open" : "env-flap"
              }`}
              style={{ zIndex: opening ? 1 : 3 }}
            >
              <div
                className="size-full rounded-t-md"
                style={{
                  background: "linear-gradient(180deg, #eaa9b2 0%, #dd8f9b 100%)",
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                }}
              />
            </div>

            {/* wax seal */}
            <div
              className={`absolute left-1/2 top-1/2 z-[4] -translate-x-1/2 -translate-y-1/2 ${
                opening ? "env-seal-pop" : "transition-transform group-hover:scale-110"
              }`}
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-wine font-script text-2xl text-cream shadow-md">
                N&amp;S
              </span>
            </div>
          </div>
        </button>

        <p
          className={`mt-8 font-body text-lg italic text-wine/80 transition-opacity ${
            opening ? "opacity-0" : "a-pulse"
          }`}
        >
          tap the letter to open it, my love
        </p>
      </div>
    </div>
  );
}
