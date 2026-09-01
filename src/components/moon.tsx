/** A soft, glowing moon fixed in the corner of the sky, visible across the whole site. */
export function Moon() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-6 top-10 z-[-1] sm:right-12 sm:top-14"
    >
      <div className="moon-glow relative">
        <span
          className="absolute -inset-10 rounded-full blur-3xl sm:-inset-14"
          style={{
            background: "radial-gradient(circle, rgba(244,199,107,0.35), transparent 70%)",
          }}
        />
        <span
          className="absolute -inset-4 rounded-full blur-xl sm:-inset-6"
          style={{
            background: "radial-gradient(circle, rgba(255,247,224,0.55), transparent 70%)",
          }}
        />
        <span
          className="relative block size-16 rounded-full sm:size-24"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #fff7e0 0%, #f4c76b 55%, #c98f3a 100%)",
            boxShadow: "0 0 40px rgba(244,199,107,0.6)",
          }}
        />
      </div>
    </div>
  );
}
