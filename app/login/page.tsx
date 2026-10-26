import { redirect } from "next/navigation";
import { DEMO_PASSWORD, getCurrentUser, isSupabaseAuthEnabled } from "@/lib/api/session";
import { listUsers } from "@/lib/database/repository";
import { Mascot, MascotCrowd } from "@/components/landing/mascot";
import { AuthForm } from "./AuthForm";
import { DemoAccounts } from "./DemoAccounts";

export const metadata = { title: "Sign in · StudyCircle" };

export default async function LoginPage() {
  // Bounce only when a profile actually resolves. Gating on the raw session cookie
  // instead would ping-pong with requireUser() forever whenever the cookie and the
  // profile disagree (stale cookie after a store reset, or an auth user without a profile).
  if (await getCurrentUser()) redirect("/dashboard");
  const passwordAuth = isSupabaseAuthEnabled();
  const users = passwordAuth ? [] : await listUsers();

  return (
    // One yellow field from the site header to the footer, like the landing hero.
    // The negative bottom margin cancels main's padding and the footer's top margin.
    <div className="full-bleed -mb-24 -mt-8 bg-sun">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:min-h-[calc(100svh-var(--header-h)-5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-14 lg:py-16">
        <section className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="max-w-xl font-display text-5xl font-bold leading-[1.02] tracking-tight text-ink sm:text-6xl">
            Step into the circle.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink">
            Pick a subject, join a weekly point, and meet the same people at the same time each week. A
            chord is the subject; a point is the group that actually meets.
          </p>

          {passwordAuth ? (
            <div className="mt-8 max-w-lg rounded-2xl bg-white p-5">
              <p className="font-display text-lg font-bold text-ink">This is a demo build</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink">
                Accounts are created against this project&rsquo;s auth store, email confirmation is skipped, and
                nothing is sent to a real inbox.
              </p>
            </div>
          ) : (
            <section id="demo-accounts" aria-labelledby="demo-accounts-title" className="mt-8 max-w-xl scroll-mt-24 rounded-2xl bg-white p-5 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 id="demo-accounts-title" className="font-display text-2xl font-bold tracking-tight text-ink">
                    Pick a demo account
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-ink">
                    One tap to look around. The shared password is{" "}
                    <code className="rounded-md bg-sun-soft px-1.5 py-0.5 font-sans text-sm font-semibold">{DEMO_PASSWORD}</code>.
                  </p>
                </div>
                <Mascot mood="wink" color="#C4462A" width={48} height={48} className="hidden shrink-0 sm:block" />
              </div>
              <DemoAccounts
                users={users.map((user) => ({
                  id: user.id,
                  name: user.name,
                  avatarColor: user.avatarColor,
                  isCreator: user.isCreator,
                }))}
                password={DEMO_PASSWORD}
              />
              <p className="mt-4 text-xs leading-relaxed text-muted">
                No email is sent, and everything resets when the server restarts.
              </p>
            </section>
          )}

          <MascotCrowd className="mt-10 hidden px-14 lg:flex" />
        </section>

        <div className="min-w-0 lg:pb-4">
          <AuthForm passwordAuth={passwordAuth} />
        </div>
      </div>
    </div>
  );
}
