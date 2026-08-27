import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal hook using IntersectionObserver.
 * Returns a ref to attach and a boolean that flips true once visible.
 * Runs only on the client (useEffect), so it's SSR-safe.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
          break;
        }
      }
    }, options);
    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return { ref, visible };
}
