import { UserCard } from "@/components/moderator/UserCard";
import { SectionHeading } from "@/components/ui/Card";
import { signIn } from "@/lib/api/actions";
import { redirect } from "next/navigation";
import { DEMO_PASSWORD, getCurrentUser, isSupabaseAuthEnabled } from "@/lib/api/session";
import { listUsers } from "@/lib/database/repository";
import { AuthForm } from "./AuthForm";
import { connection } from "next/server";
import { unstable_noStore } from "next/cache";

export const instant = false;

export default async function LoginPage() {
  unstable_noStore();
  await connection();
  // Bounce only when a profile actually resolves. Gating on the raw session cookie
  // instead would ping-pong with requireUser() forever whenever the cookie and the
  // profile disagree (stale cookie after a store reset, or an auth user without a profile).
  if (await getCurrentUser()) redirect("/");
  const passwordAuth = isSupabaseAuthEnabled();
  const users = passwordAuth ? [] : await listUsers();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to StudyCircle</h1>
        <p className="text-muted">
          {passwordAuth
            ? "Sign in with your email, or create a profile to join a point."
            : "Sign in with a demo account to explore, or create your own profile."}
        </p>
      </div>

      {passwordAuth ? null : (
        <section>
          <SectionHeading title="Demo accounts" hint={`Shared password: ${DEMO_PASSWORD}`} />
          <div className="grid gap-3 sm:grid-cols-2">
            {users.map((user) => (
              <form key={user.id} action={signIn}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="password" value={DEMO_PASSWORD} />
                <button type="submit" className="w-full text-left transition-transform hover:-translate-y-0.5">
                  <UserCard
                    user={user}
                    role={user.isCreator ? "Creator" : undefined}
                    detail={`${user.educationLevel} · ${user.gradeLevel} · ${user.experienceLevel}`}
                  />
                </button>
              </form>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeading title={passwordAuth ? "New to StudyCircle?" : "Create an account"} />
        <AuthForm passwordAuth={passwordAuth} />
      </section>
    </div>
  );
}
