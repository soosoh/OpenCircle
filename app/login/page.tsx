import { signIn } from "@/lib/api/actions";
import { redirect } from "next/navigation";
import { DEMO_PASSWORD, getCurrentUser, isSupabaseAuthEnabled } from "@/lib/api/session";
import { listUsers } from "@/lib/database/repository";
import { SectionHeading } from "@/components/ui/Card";
import { AuthForm } from "./AuthForm";

export const metadata = { title: "Sign in · StudyCircle" };

export default async function LoginPage() {
  // Bounce only when a profile actually resolves. Gating on the raw session cookie
  // instead would ping-pong with requireUser() forever whenever the cookie and the
  // profile disagree (stale cookie after a store reset, or an auth user without a profile).
  if (await getCurrentUser()) redirect("/dashboard");
  const passwordAuth = isSupabaseAuthEnabled();
  const users = passwordAuth ? [] : await listUsers();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-16 lg:py-4">
        <section className="lg:sticky lg:top-24 lg:self-start lg:pt-6">
          <p className="text-sm font-semibold text-muted">StudyCircle</p>
          <h1 className="mt-3 max-w-md font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            Study groups that keep showing up.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            Pick a subject, join a weekly point, and meet the same people at the same time each
            week. A chord is the subject; a point is the group that actually meets.
          </p>

          <dl className="mt-8 grid max-w-md gap-4 border-t border-line pt-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-ink">Chords</dt>
              <dd className="mt-1 text-muted">Subject communities, from biology to robotics.</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Points</dt>
              <dd className="mt-1 text-muted">Small weekly groups inside a chord.</dd>
            </div>
          </dl>

          <div className="mt-8 max-w-md rounded-2xl border border-line bg-sun-wash p-4">
            <p className="text-sm font-semibold text-ink">This is a demo build</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {passwordAuth
                ? "This is a demo deployment. Accounts are created against this project's auth store, email confirmation is skipped, and nothing is sent to a real inbox."
                : (
                  <>
                    Sign in with one of the{" "}
                    <a href="#demo-accounts" className="font-semibold text-ink underline decoration-line underline-offset-2 hover:decoration-ink">
                      seeded accounts below
                    </a>{" "}
                    using the shared demo password. No email is sent, and everything resets when the
                    server restarts.
                  </>
                )}
            </p>
          </div>
        </section>

        <div className="min-w-0">
          <AuthForm passwordAuth={passwordAuth} />
        </div>
      </div>

      {passwordAuth ? null : (
        <section id="demo-accounts" className="mt-12 scroll-mt-24 border-t border-line pt-8">
          <SectionHeading
            title="Demo accounts"
            hint={`Pick anyone to look around. The shared password is ${DEMO_PASSWORD}.`}
          />
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {users.map((user) => (
              <li key={user.id}>
                <form action={signIn}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="password" value={DEMO_PASSWORD} />
                  <button
                    type="submit"
                    className="group flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3.5 py-2.5 text-left transition-colors hover:border-ink/25 hover:bg-sun-wash"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">{user.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {user.isCreator ? "Creator" : "Member"}
                      </span>
                    </span>
                    <span aria-hidden="true" className="shrink-0 text-sm text-muted transition-colors group-hover:text-ink">
                      →
                    </span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
