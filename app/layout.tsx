import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { signOut } from "@/lib/api/actions";
import { getCurrentUser } from "@/lib/api/session";
import { listPoints } from "@/lib/database/repository";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyCircle",
  description: "Study groups that keep you on track. Enter a subject, join a point, show up every week.",
};

// The landing page is info-only, but routes that do read the session can't be
// prerendered into a static shell. Revisit per route if adopting Suspense boundaries.
export const instant = false;

/** The mark: a circle with a chord drawn across it — the product's whole idea. */
export function CircleMark({ className = "size-8" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`} aria-hidden="true">
      <svg viewBox="0 0 28 28" className="size-full">
        <circle cx="14" cy="14" r="13" fill="#29313D" />
        <line x1="4.5" y1="17" x2="23.5" y2="10" stroke="#F4D35E" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="4.5" cy="17" r="2.4" fill="#F4D35E" />
        <circle cx="23.5" cy="10" r="2.4" fill="#F4D35E" />
      </svg>
    </span>
  );
}

// The header reads the session so the chrome tells the truth: signed-out visitors
// see "Sign in"; signed-in members get an app nav plus their name and a way back out.
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  // "Moderate" is only offered to people who actually run a point; everyone
  // else would land on a permission notice, which is a dead end.
  const moderates = user ? (await listPoints()).some((point) => point.moderatorId === user.id) : false;

  const NAV = user
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/chords", label: "Chords" },
        ...(moderates ? [{ href: "/moderator", label: "Moderate" }] : []),
        { href: "/profile", label: "Profile" },
      ]
    : [];

  return (
    <html lang="en" className={`h-full antialiased ${user ? "has-appnav" : ""}`}>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        {/* Two families, loaded at runtime with a system fallback: Fraunces for
            headings (a warm, slightly wonky old-style serif) and Instrument Sans
            for everything you read and click. Runtime <link> rather than
            next/font on purpose: next/font fetches at build time, and this
            project has to build with no network. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- offline builds, see above */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..700&family=Instrument+Sans:wght@400..700&display=swap"
        />
        <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-ink"
            >
              <CircleMark />
              StudyCircle
            </Link>

            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
                  {NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-mist hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-sm font-semibold text-ink transition-colors hover:bg-mist"
                >
                  <Avatar name={user.name} color={user.avatarColor} size={26} />
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:border-ink/25 hover:bg-sun-wash"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-sun px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-sun-deep"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* On narrow screens the app nav gets its own row instead of disappearing. */}
          {user ? (
            <nav
              aria-label="Main"
              className="no-scrollbar mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto border-t border-line px-3 py-1.5 md:hidden"
            >
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-mist hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>

        <footer className="mt-16 bg-sun">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-ink/75 sm:flex-row sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-display text-base font-bold text-ink">
              <CircleMark className="size-6" />
              StudyCircle
            </Link>
            <p>Built the way our points run: slowly, together, every week.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
