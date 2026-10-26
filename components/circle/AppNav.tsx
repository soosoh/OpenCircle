"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AppNavItem = { href: string; label: string };

/**
 * The signed-in nav. A client component only because the active page comes
 * from the pathname; the links themselves are decided on the server.
 */
export function AppNav({ items }: { items: AppNavItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`press inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors ${
              active ? "bg-sun text-ink" : "text-ink hover:bg-sun-wash"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
