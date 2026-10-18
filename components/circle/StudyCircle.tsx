"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Chord } from "@/types";

const SIZE = 620;
const CENTER = SIZE / 2;
const RADIUS = 250;
const LABEL_RADIUS = 320;

/**
 * The StudyCircle: chords drawn as line segments between points on the circle,
 * exactly like chords in a circle. Hovering a label highlights its chord.
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
      // Keep labels inside the drawing area.
      const label = point(midAngle, LABEL_RADIUS);
      return { chord, href, start, end, label };
    });
  }, [items]);

  return (
    <div className="relative mx-auto w-full max-w-[680px]">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-auto w-full"
        role="img"
        aria-label="StudyCircle: each subject is a chord inside the circle"
        onMouseLeave={() => setActive(null)}
      >
        <defs>
          <radialGradient id="circle-fill" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f4f1ec" />
          </radialGradient>
        </defs>

        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="url(#circle-fill)" stroke="#1e2030" strokeWidth={2.5} />

        {geometry.map(({ chord, start, end }) => {
          const isActive = active === chord.id;
          return (
            <g key={chord.id} opacity={active && !isActive ? 0.25 : 1} className="transition-opacity duration-300">
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
              <circle cx={start.x} cy={start.y} r={5} fill={chord.color} />
              <circle cx={end.x} cy={end.y} r={5} fill={chord.color} />
            </g>
          );
        })}
      </svg>

      <ul className="absolute inset-0">
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
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm transition-all duration-200 ${
                  isActive ? "-translate-y-0.5 border-transparent text-white shadow-md" : "border-line bg-surface text-ink hover:border-brand/40"
                }`}
                style={isActive ? { backgroundColor: chord.color } : undefined}
              >
                {chord.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
