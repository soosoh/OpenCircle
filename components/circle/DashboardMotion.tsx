"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * The dashboard's one entrance, and nothing else on this page is client code.
 *
 * The server renders the finished page. After mount this wrapper plays the
 * cards in (rise + fade), grows the progress bars, counts the percentages up
 * and pops the dot-matrix numerals. Only transform and opacity move, and with
 * `prefers-reduced-motion: reduce` nothing is touched, so the markup you got
 * from the server is the final state. If this script never loads, the same.
 *
 * Hooks in the markup:
 *   data-rise            a card or block that rises in, staggered
 *   data-grow-x          a horizontal bar fill (scaleX from the left)
 *   data-grow-y          a vertical bar fill (scaleY from the bottom)
 *   data-bar             one bar of a many-bar chart (scaleY from the bottom, short shared stagger)
 *   data-tile            one small square in a row of them (pops in, short shared stagger)
 *   data-count="60"      a number that counts up; data-suffix="%" is appended
 *   data-dots            wrapper around a DotDigits svg; its dots pop in
 */
export function DashboardMotion({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const mm = gsap.matchMedia();
      // A dashboard with no goals has no bars, a new member has no chart: GSAP warns
      // "target not found" for every selector that matches nothing, so only tween what exists.
      const present = (selector: string) => scope.querySelector(selector) !== null;

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          // Reduced motion: leave the server-rendered final state untouched.
          if (context.conditions?.reduce) return;

          if (present("[data-rise]")) {
            gsap.from("[data-rise]", {
              y: 16,
              autoAlpha: 0,
              duration: 0.6,
              ease: "power3.out",
              stagger: 0.07,
              clearProps: "transform,opacity,visibility",
            });
          }

          if (present("[data-grow-x]")) {
            gsap.from("[data-grow-x]", {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 0.9,
              ease: "power3.out",
              delay: 0.35,
              stagger: 0.08,
              clearProps: "transform",
            });
          }

          if (present("[data-grow-y]")) {
            gsap.from("[data-grow-y]", {
              scaleY: 0,
              transformOrigin: "center bottom",
              duration: 0.9,
              ease: "power3.out",
              delay: 0.4,
              stagger: 0.09,
              clearProps: "transform",
            });
          }

          // Chart bars and week squares are numerous, so they share one short stagger
          // (`amount`) instead of a per-element delay that would drag on for seconds.
          if (present("[data-bar]")) {
            gsap.from("[data-bar]", {
              scaleY: 0,
              transformOrigin: "center bottom",
              duration: 0.7,
              ease: "power3.out",
              delay: 0.45,
              stagger: { amount: 0.6 },
              clearProps: "transform",
            });
          }

          if (present("[data-tile]")) {
            gsap.from("[data-tile]", {
              scale: 0.4,
              autoAlpha: 0,
              transformOrigin: "50% 50%",
              duration: 0.4,
              ease: "back.out(2)",
              delay: 0.5,
              stagger: { amount: 0.5 },
              clearProps: "transform,opacity,visibility",
            });
          }

          if (present("[data-dots] circle")) {
            gsap.from("[data-dots] circle", {
              scale: 0,
              autoAlpha: 0,
              transformOrigin: "50% 50%",
              duration: 0.35,
              ease: "back.out(2)",
              delay: 0.3,
              stagger: { amount: 0.5, from: "random" },
              clearProps: "transform,opacity,visibility",
            });
          }

          const counters = gsap.utils.toArray<HTMLElement>("[data-count]");
          const restore: Array<() => void> = [];
          counters.forEach((el) => {
            const end = Number(el.dataset.count);
            if (!Number.isFinite(end)) return;
            const suffix = el.dataset.suffix ?? "";
            const finalText = el.textContent ?? `${end}${suffix}`;
            const tick = { value: 0 };
            el.textContent = `0${suffix}`;
            gsap.to(tick, {
              value: end,
              duration: 1,
              delay: 0.35,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = `${Math.round(tick.value)}${suffix}`;
              },
              onComplete: () => {
                el.textContent = finalText;
              },
            });
            restore.push(() => {
              el.textContent = finalText;
            });
          });

          return () => restore.forEach((fn) => fn());
        },
        scope,
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
