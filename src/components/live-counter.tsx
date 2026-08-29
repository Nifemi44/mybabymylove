import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Elapsed = { days: number; hours: number; minutes: number; seconds: number };

function diffFrom(start: Date): Elapsed {
  const ms = Math.max(0, Date.now() - start.getTime());
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds };
}

/** A real-time ticking counter of days/hours/minutes/seconds since the relationship began. */
export function LiveCounter() {
  const [start, setStart] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState<Elapsed | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_settings")
      .select("relationship_start")
      .eq("id", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data?.relationship_start) {
          setStart(new Date(data.relationship_start));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!start) return;
    setElapsed(diffFrom(start));
    const id = window.setInterval(() => setElapsed(diffFrom(start)), 1000);
    return () => window.clearInterval(id);
  }, [start]);

  if (!start || !elapsed) return null;

  const units: [number, string][] = [
    [elapsed.days, "days"],
    [elapsed.hours, "hours"],
    [elapsed.minutes, "minutes"],
    [elapsed.seconds, "seconds"],
  ];

  return (
    <div className="mx-auto flex max-w-md flex-wrap items-center justify-center gap-4 sm:gap-6">
      {units.map(([value, label]) => (
        <div key={label} className="luxury-shadow rounded-xl bg-cream/85 px-4 py-3 text-center ring-1 ring-rose/20">
          <span className="block font-heading text-2xl font-semibold tabular-nums text-wine sm:text-3xl">
            {value.toLocaleString()}
          </span>
          <span className="block font-heading text-[10px] uppercase tracking-[0.2em] text-ink/50">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
