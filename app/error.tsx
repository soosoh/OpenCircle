"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start py-10">
      <p className="text-sm font-semibold text-muted">Something broke</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        That didn&rsquo;t load. Nothing you did caused it.
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-muted">
        Try again — most of these clear on a second attempt. If it keeps happening, the page is still broken on our
        side and your work is safe.
      </p>

      <div className="mt-7 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-sun px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-sun-deep"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/25 hover:bg-sun-wash"
        >
          Back to your dashboard
        </Link>
      </div>
    </div>
  );
}
