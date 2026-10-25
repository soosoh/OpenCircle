import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Action language for the whole app.
 *
 * primary  the yellow school-bus button: one per view, on white or pale surfaces
 * ink      the same weight on a yellow field, where yellow would disappear
 * secondary a quiet bordered action that sits beside a primary
 * ghost    inline / icon actions inside dense UI
 * danger   only for destructive or urgent actions
 */
const VARIANTS = {
  primary: "bg-sun text-ink hover:bg-sun-deep",
  ink: "bg-ink text-white hover:bg-[#3A4452]",
  secondary: "bg-surface text-ink border border-line hover:border-ink/25 hover:bg-sun-wash",
  ghost: "text-muted hover:bg-mist hover:text-ink",
  danger: "bg-coral text-white hover:bg-[#A93A21]",
} as const;

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
} as const;

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

type Variant = keyof typeof VARIANTS;
type Size = keyof typeof SIZES;

function classes(variant: Variant, size: Size, className?: string) {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className ?? ""}`;
}

type SharedProps = { variant?: Variant; size?: Size; children: ReactNode };
type AsLink = SharedProps & { href: string } & Omit<ComponentProps<typeof Link>, "children" | "href">;
type AsButton = SharedProps & Omit<ComponentProps<"button">, "children">;

/** Shared button. Renders a Link when `href` is set, otherwise a real button. */
export function Button(props: AsLink | AsButton) {
  if ("href" in props) {
    const { variant, size, children, className, ...rest } = props;
    return (
      <Link {...rest} className={classes(variant ?? "primary", size ?? "md", className)}>
        {children}
      </Link>
    );
  }

  const { variant, size, children, className, ...rest } = props;
  return (
    <button {...rest} className={classes(variant ?? "primary", size ?? "md", className)}>
      {children}
    </button>
  );
}

export function SubmitButton({
  variant = "primary",
  size = "md",
  className,
  children,
  pending,
  pendingLabel = "Working…",
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  pending?: boolean;
  pendingLabel?: string;
}) {
  return (
    <button type="submit" disabled={pending} className={classes(variant, size, className)}>
      {pending ? pendingLabel : children}
    </button>
  );
}
