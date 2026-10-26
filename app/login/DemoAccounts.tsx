"use client";

import { useFormStatus } from "react-dom";
import { signIn } from "@/lib/api/actions";
import { Avatar } from "@/components/ui/Avatar";

type Account = { id: string; name: string; avatarColor: string; isCreator: boolean };

/** One-tap sign-in for the seeded accounts (memory backend only; signIn re-checks the password). */
export function DemoAccounts({ users, password }: { users: Account[]; password: string }) {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {users.map((user) => (
        <li key={user.id}>
          <form action={signIn}>
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="password" value={password} />
            <AccountButton user={user} />
          </form>
        </li>
      ))}
    </ul>
  );
}

function AccountButton({ user }: { user: Account }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className="press group flex min-h-14 w-full items-center gap-3 rounded-xl border border-line bg-paper px-3 py-2 text-left hover:border-ink/40 hover:bg-sun-wash"
    >
      <Avatar name={user.name} color={user.avatarColor} size={36} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">{user.name}</span>
        <span className="block truncate text-xs text-muted">
          {pending ? "Signing in…" : user.isCreator ? "Creator" : "Member"}
        </span>
      </span>
      <span aria-hidden="true" className="shrink-0 text-base text-ink transition-transform duration-200 ease-out-quart group-hover:translate-x-0.5">
        →
      </span>
    </button>
  );
}
