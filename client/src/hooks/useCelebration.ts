import { useEffect, useRef, useState } from "react";

// Height of the sticky tab bar the scroll target must clear.
const STICKY_HEADER_PX = 76;
// Long enough for a smooth scroll to land before the payoff fires.
const SCROLL_SETTLE_MS = 600;

/**
 * Scrolls the target into view, then flips `celebrating` once the scroll settles.
 *
 * Lets the stamp and confetti fire only after the visitor is actually looking at
 * the reveal, instead of playing off-screen below the fold.
 */
export function useCelebration(active: boolean) {
  const targetRef = useRef<HTMLDivElement>(null);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (!active) {
      setCelebrating(false);

      return;
    }

    const target = targetRef.current;
    if (!target) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const bounds = target.getBoundingClientRect();
    const availableHeight = window.innerHeight - STICKY_HEADER_PX;
    const spareSpace = Math.max(0, availableHeight - bounds.height);
    const scrollTarget =
      window.scrollY + bounds.top - STICKY_HEADER_PX - spareSpace / 2;

    window.scrollTo({
      top: Math.max(0, scrollTarget),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    if (prefersReducedMotion) {
      setCelebrating(true);

      return;
    }

    const timer = window.setTimeout(
      () => setCelebrating(true),
      SCROLL_SETTLE_MS,
    );

    return () => window.clearTimeout(timer);
  }, [active]);

  return { targetRef, celebrating };
}
