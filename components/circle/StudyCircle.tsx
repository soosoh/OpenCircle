"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Chord } from "@/types";

const SIZE = 620;
const CENTER = SIZE / 2;
/** The drawing is inset so the label chips ring the circle without leaving the box. */
const RADIUS = 182;
const LABEL_RADIUS = 236;

/**
 * The StudyCircle: chords drawn as line segments between points on the circle,
 * exactly like chords in a circle. Hovering or focusing a label highlights its
 * chord. Below `md` the labels become a plain list so they can never overlap or
 * push the page sideways.
 */
export function StudyCircle({ items }: { items: { chord: Chord; href: string }[] }) {
  const [active, setActive] = useState<string | null>(null);

  const geometry = useMemo(() => {
    const count = items.length;
    return items.map(({ chord, href }, index) => {
      // Spread endpoints evenly; rotate so the first chord starts at the top.
      const angleA = (index / count) * Math.PI * 2 - Math.PI / 2;
      const angleB = ((index + 1) / count) * Math.PI * 2 - Math.PI / 2;
      const point = (angle: number, radius: number) => ({
        x: CENTER + radius * Math.cos(angle),
        y: CENTER + radius * Math.sin(angle),
      });
      const start = point(angleA, RADIUS);
      const end = point(angleB, RADIUS);
      const midAngle = angleA + (angleB - angleA) / 2;
      const label = point(midAngle, LABEL_RADIUS);
      return { chord, href, start, end, label };
    });
  }, [items]);

  return (
    <div className="mx-auto w-full max-w-[620px]">
      <div className="relative mx-auto aspect-square w-full">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="absolute inset-0 size-full"
          role="img"
          aria-label="StudyCircle: each subject is a chord inside the circle"
          onMouseLeave={() => setActive(null)}
        >
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#FFF7DF" stroke="#29313D" strokeWidth={2.5} />

          {geometry.map(({ chord, start, end }) => {
            const isActive = active === chord.id;
            return (
              <g key={chord.id} opacity={active && !isActive ? 0.22 : 1} className="transition-opacity duration-300">
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={chord.color}
                  strokeWidth={isActive ? 6 : 3}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                <circle
                  cx={start.x}
                  cy={start.y}
                  r={isActive ? 8 : 6.5}
                  fill="#FFFFFF"
                  stroke={chord.color}
                  strokeWidth={3}
                />
                <circle
                  cx={end.x}
                  cy={end.y}
                  r={isActive ? 8 : 6.5}
                  fill="#FFFFFF"
                  stroke={chord.color}
                  strokeWidth={3}
                />
              </g>
            );
          })}
        </svg>

        <ul className="absolute inset-0 hidden md:block">
          {geometry.map(({ chord, href, label }) => {
            const isActive = active === chord.id;
            return (
              <li
                key={chord.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(label.x / SIZE) * 100}%`, top: `${(label.y / SIZE) * 100}%` }}
                onMouseEnter={() => setActive(chord.id)}
              >
                <Link
                  href={href}
                  onFocus={() => setActive(chord.id)}
                  onBlur={() => setActive(null)}
                  className={`inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors duration-200 lg:text-sm ${
                    isActive
                      ? "border-ink bg-sun text-ink"
                      : "border-line bg-surface text-ink hover:border-ink/30 hover:bg-sun-wash"
                  }`}
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: isActive ? "#29313D" : chord.color }}
                    aria-hidden="true"
                  />
                  {chord.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-2 md:hidden">
        {geometry.map(({ chord, href }) => (
          <li key={chord.id}>
            <Link
              href={href}
              className="inline-flex min-h-10 w-full items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-sun-wash"
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: chord.color }}
                aria-hidden="true"
              />
              {chord.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
