import Link from "next/link";

export const metadata = { title: "Page not found · StudyCircle" };

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start py-10">
      <p className="text-sm font-semibold text-muted">404</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        This page isn&rsquo;t on the circle.
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-muted">
        The link may be older than the point it pointed to. Here are three places that still work.
      </p>

      <div className="mt-7 flex flex-wrap gap-2.5">
        <Link
          href="/"
          className="rounded-full bg-sun px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-sun-deep"
        >
          Back to the circle
        </Link>
        <Link
          href="/chords"
          className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/25 hover:bg-sun-wash"
        >
          Browse chords
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-mist hover:text-ink"
        >
          Your dashboard
        </Link>
      </div>
    </div>
  );
}
