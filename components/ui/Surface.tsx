import type { ReactNode } from "react";
import { taste } from "../../designlang/tokens";

export function Surface({
  children,
  className = "",
  lift = false,
}: {
  children: ReactNode;
  className?: string;
  lift?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[0_1px_3px_rgba(10,10,10,0.06)] ${lift ? "hover:shadow-[0_10px_30px_rgba(10,10,10,0.08)] hover:-translate-y-1 transition-all duration-300" : ""} ${className}`}
      style={{ fontFamily: taste.font.body }}
    >
      {children}
    </div>
  );
}

export function TasteHeading({ level = 1, children, className = "" }: { level?: 1 | 2 | 3; children: ReactNode; className?: string }) {
  const Tag = `h${level}` as const;
  return (
    <Tag className={`font-[family-name:var(--font-display)] tracking-tight leading-[1.1] text-ink ${level === 1 ? "text-5xl sm:text-7xl" : level === 2 ? "text-3xl sm:text-4xl" : "text-2xl"} ${className}`}>
      {children}
    </Tag>
  );
}
