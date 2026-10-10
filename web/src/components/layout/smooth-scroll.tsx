"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Smoothed mouse-wheel scrolling on desktop (Lenis). Touch devices keep native scrolling,
 * and nothing runs for users who prefer reduced motion. Lenis drives the real window scroll,
 * so sticky elements, scroll-driven CSS and IntersectionObservers keep working.
 */
export function SmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      anchors: true,
      allowNestedScroll: true,
      // Drawers, sheets and menus scroll natively.
      prevent: (node) => !!node.closest("[role=dialog], [data-lenis-prevent]"),
    });

    // Radix locks page scroll (body[data-scroll-locked]) while a dialog is open; pause with it.
    const sync = () => (document.body.hasAttribute("data-scroll-locked") ? lenis.stop() : lenis.start());
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] });

    return () => {
      observer.disconnect();
      lenis.destroy();
    };
  }, []);

  return null;
}
