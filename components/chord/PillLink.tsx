import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

/**
 * The landing page's action pill: a round sun disc with an arrow, then the
 * label. "ink" is the primary action (dark pill, works on the sun band and on
 * white cards). "white" is the quieter sibling that sits beside it on yellow.
 */
const TONES = {
  ink: "bg-ink text-white hover:bg-ink-soft",
  white: "bg-surface text-ink hover:bg-sun-wash",
  outline: "border border-line bg-surface text-ink hover:border-ink/30 hover:bg-sun-wash",
} as const;

const DISC = {
  ink: "bg-sun text-ink",
  white: "bg-ink text-white",
  outline: "bg-sun text-ink",
} as const;

export type PillTone = keyof typeof TONES;

export function pillClasses(tone: PillTone, className?: string) {
  return `press group inline-flex min-h-11 items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-5 text-sm font-bold ${TONES[tone]} ${className ?? ""}`;
}

export function pillDiscClasses(tone: PillTone) {
  return `flex size-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ease-out-quart group-hover:translate-x-0.5 ${DISC[tone]}`;
}

type PillLinkProps = {
  tone?: PillTone;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "children">;

export function PillLink({ tone = "ink", children, className, ...rest }: PillLinkProps) {
  return (
    <Link {...rest} className={pillClasses(tone, className)}>
      <span className={pillDiscClasses(tone)} aria-hidden="true">
        <ArrowRight size={15} strokeWidth={2.5} />
      </span>
      {children}
    </Link>
  );
}
