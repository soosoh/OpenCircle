import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/database/repository";
import type { User } from "@/types";

/**
 * Demo session: a plain cookie holding the signed-in user id.
 * NOT production auth. The cookie is not signed or verified. Replace this module with real
 * authentication (e.g. Supabase Auth) before exposing the app publicly. See README.md.
 */
const SESSION_COOKIE = "sc_user";

export async function getSessionUserId(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<User | null> {
  const id = await getSessionUserId();
  return id ? getUser(id) : null;
}

/** For pages that need a signed-in user. Redirects to /login otherwise. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function setSessionUser(userId: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, userId, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
