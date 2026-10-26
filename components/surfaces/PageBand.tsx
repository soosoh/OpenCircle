import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { DotDigits } from "@/components/landing/mockups";

/**
 * The one header every signed-in page opens with: a flat sun field under the site
 * header that bleeds to the viewport edges and rounds off at the bottom, like the
 * landing hero and the dashboard stage. Title, one line of description, a few
 * facts and the page's primary action sit on the yellow; page content follows on
 * paper. White cards that belong to the header (a schedule, a meeting card) go in
 * `children` and sit on the yellow.
 */
export function PageBand({
  crumb,
  lead,
  mark,
  title,
  description,
  meta,
  actions,
  children,
  decor,
  aside,
}: {
  /** Back link, rendered above the title. */
  crumb?: ReactNode;
  /** Leads the title on the left (an avatar). */
  lead?: ReactNode;
  /** Small mark beside the title (e.g. the chord's circle). */
  mark?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Pills / short facts under the description. */
  meta?: ReactNode;
  /** Primary action(s), under the description. */
  actions?: ReactNode;
  /** White cards on the stage. */
  children?: ReactNode;
  /** Mascot + bubble art, bottom-right on wide screens only. Decorative. */
  decor?: ReactNode;
  /** Same slot as `decor`, kept for callers that pass a bare mascot. */
  aside?: ReactNode;
}) {
  const art = decor ?? aside;
  return (
    <section className="full-bleed -mt-8 rounded-b-[2.5rem] bg-sun">
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
        {crumb ? <div className="mb-4">{crumb}</div> : null}
        <div className="flex items-end justify-between gap-8">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
            {lead}
            <div className="min-w-0 max-w-2xl">
              <div className="flex items-center gap-3.5">
                {mark}
                <h1 className="min-w-0 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
                  {title}
                </h1>
              </div>
              {description ? <p className="mt-3 max-w-xl text-base leading-7 text-ink">{description}</p> : null}
              {meta ? <div className="mt-4 flex flex-wrap items-center gap-2">{meta}</div> : null}
              {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
            </div>
          </div>
          {art ? (
            <div aria-hidden="true" className="pointer-events-none hidden shrink-0 items-end gap-3 lg:flex">
              {art}
            </div>
          ) : null}
        </div>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

/** Page content on paper, below the band. */
export function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mt-10 space-y-10 ${className}`}>{children}</div>;
}

/** A pill that stays readable on the yellow field. */
export function BandPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-1 rounded-full bg-surface px-3 text-xs font-semibold text-ink">
      {children}
    </span>
  );
}

/** Plain-text back link used inside the band. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="link-back link-on-sun min-h-10 text-sm"
    >
      <ArrowLeft size={15} strokeWidth={2.5} aria-hidden="true" />
      {children}
    </Link>
  );
}

/** A white tile on the stage: a dot-matrix numeral over a small label. */
export function StatTile({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
  return (
    <div
      className="min-w-0 rounded-2xl bg-surface px-4 py-3.5 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <DotDigits value={String(Math.max(0, value))} className="h-9 w-auto text-ink" />
      <span className="sr-only">{value}</span>
      <p className="mt-2 truncate text-[13px] leading-tight text-muted">{label}</p>
    </div>
  );
}

export function StatRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`grid grid-cols-3 gap-2 sm:gap-3 ${className}`}>{children}</div>;
}
