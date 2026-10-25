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
        <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2.5 font-[family-name:var(--font-display)] text-xl tracking-tight text-ink hover:text-brand transition-colors">
              <span className="inline-flex size-8 items-center justify-center rounded-full border-2 border-ink/10 bg-ink text-paper text-base shadow-sm">◎</span>
              StudyCircle
            </Link>

            <nav className="hidden items-center gap-1 sm:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted transition-all hover:bg-ink/[0.06] hover:text-ink hover:-translate-y-px"
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
                  className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(200,122,61,0.25)] transition-all hover:bg-[#b96d32] hover:shadow-[0_4px_12px_rgba(200,122,61,0.3)] hover:-translate-y-px"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:py-14">{children}</main>

        <footer className="border-t border-line bg-paper/50 backdrop-blur-sm py-8">
          <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted">
            <span className="font-[family-name:var(--font-display)] text-base text-ink">StudyCircle</span>
            <span>study groups that hold you accountable</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
