import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const VARIANTS = {
  primary: "bg-brand text-white hover:bg-[#3f38c9] shadow-sm",
  secondary: "bg-surface text-ink border border-line hover:border-brand/40 hover:bg-brand/5",
  ghost: "text-muted hover:text-ink hover:bg-ink/5",
  danger: "bg-coral text-white hover:bg-[#c94878] shadow-sm",
} as const;

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
} as const;

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

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
