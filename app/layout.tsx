import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { signOut } from "@/lib/api/actions";
import { getCurrentUser } from "@/lib/api/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyCircle",
  description: "Study groups that keep you on track. Enter a subject, join a point, show up every week.",
};

// The landing page is info-only, but routes that do read the session can't be
// prerendered into a static shell. Revisit per route if adopting Suspense boundaries.
export const instant = false;

// The header reads the session so the chrome tells the truth: signed-out visitors
// see "Sign in"; signed-in members see their avatar with a way back out.
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#16131f]/85 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-paper">
              {/* The logo drawn, not typed: a circle with a chord across it. */}
              <span className="inline-flex size-7 items-center justify-center" aria-hidden="true">
                <svg viewBox="0 0 28 28" className="size-full">
                  <circle cx="14" cy="14" r="13" fill="#8b7ff7" />
                  <line x1="4.5" y1="17" x2="23.5" y2="10" stroke="#121017" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="4.5" cy="17" r="2" fill="#121017" />
                  <circle cx="23.5" cy="10" r="2" fill="#121017" />
                </svg>
              </span>
              StudyCircle
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-paper">
                  <Avatar name={user.name} color={user.avatarColor} size={26} />
                  <span className="hidden sm:inline">{user.name}</span>
                </span>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="rounded-full border border-white/15 px-3.5 py-1.5 text-sm font-medium text-paper transition-colors hover:border-[#22a58a] hover:text-[#39d3a8]"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-[#8b7ff7] px-3.5 py-1.5 text-sm font-medium text-[#141126] transition-colors hover:bg-[#a99ffc]"
              >
                Sign in
              </Link>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>

        <footer className="border-t border-white/10 bg-[#0f0d15] py-6 text-center text-sm text-white/45">
          StudyCircle — built the way our points run: slowly, together, every week.
        </footer>
      </body>
    </html>
  );
}
