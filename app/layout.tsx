import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Avatar } from "@/components/ui/Avatar";
import { getCurrentUser } from "@/lib/api/session";

export const metadata: Metadata = {
  title: "StudyCircle",
  description: "Study groups that keep you on track. Enter a subject, join a point, show up every week.",
};

// Every route reads the session cookie in this layout, so nothing can be prerendered into a static shell.
// Revisit per route if you later adopt Suspense boundaries or "use cache".
export const instant = false;

const NAV = [
  { href: "/", label: "Circle" },
  { href: "/chords", label: "Chords" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/moderator", label: "Moderate" },
];

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="inline-flex size-7 items-center justify-center rounded-full border-2 border-ink text-[11px]">
                ◎
              </span>
              StudyCircle
            </Link>

            <nav className="hidden items-center gap-1 sm:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 transition-colors hover:border-brand/40"
                  >
                    <Avatar name={user.name} color={user.avatarColor} size={26} />
                    <span className="hidden text-sm font-medium sm:inline">{user.name.split(" ")[0]}</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full bg-brand px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#3f38c9]"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>

        <footer className="border-t border-line py-6 text-center text-sm text-muted">
          StudyCircle · study groups that hold you accountable
        </footer>
      </body>
    </html>
  );
}
