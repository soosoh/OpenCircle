import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { getUser } from "@/lib/database/repository";
import type { User } from "@/types";

/**
 * Session seam for both data backends. The API below is shared by every page and
 * action, so callers never see which backend is active:
 *
 * - DATA_BACKEND=supabase: real authentication with Supabase Auth (email + password).
 *   The session is a signed JWT stored in Supabase's auth cookies — not forgeable.
 *   Needs SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SERVICE_ROLE_KEY.
 * - DATA_BACKEND=memory (default): the demo session — a plain cookie holding the
 *   signed-in user id, gated by DEMO_PASSWORD. Local development only; never expose
 *   a memory-backend deployment publicly.
 *
 * Server-only: nothing in this module may be imported from a client component.
 */
const SESSION_COOKIE = "sc_user";

/** Shared password for the seeded demo accounts (memory backend only). */
export const DEMO_PASSWORD = "demo1234";

export type AuthState = { error?: string };

/** True when sessions are backed by Supabase Auth instead of the demo cookie. */
export function isSupabaseAuthEnabled(): boolean {
  return (process.env.DATA_BACKEND ?? "memory") === "supabase";
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`DATA_BACKEND=supabase requires ${name}.`);
  return value;
}

/**
 * Supabase client bound to the request cookies. Only call it from a Server
 * Component render or a server action; cookie writes outside those throw and are
 * swallowed (a session created during a read-only render is simply dropped).
 */
async function supabaseAuth() {
  const cookieStore = await cookies();
  const client = createServerClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_PUBLISHABLE_KEY"), {
    cookies: {
      getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) cookieStore.set(name, value, options);
        } catch {
          /* read-only render context: the new session is dropped with the response */
        }
      },
    },
  });
  return client.auth;
}

/** Service-role admin API for creating auth users. Server-only; never shipped to the browser. */
function supabaseAdmin() {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  }).auth.admin;
}

export async function getSessionUserId(): Promise<string | null> {
  if (isSupabaseAuthEnabled()) {
    // getUser() validates the JWT with Supabase Auth; getSession() only reads the
    // cookie and would trust a token this server has not verified.
    const { data, error } = await (await supabaseAuth()).getUser();
    if (error) return null;
    return data.user?.id ?? null;
  }
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

/** Demo backend only: records the signed-in user id in the session cookie. */
export async function setSessionUser(userId: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, userId, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
}

/** Clears whichever session is active (Supabase auth cookies and/or the demo cookie). */
export async function clearSession(): Promise<void> {
  if (isSupabaseAuthEnabled()) {
    try {
      await (await supabaseAuth()).signOut();
    } catch {
      // Best effort: still clear the demo cookie so a failed auth call cannot strand it.
    }
  }
  const cookieStore = await cookies();
  if (cookieStore.has(SESSION_COOKIE)) cookieStore.delete(SESSION_COOKIE);
}

/**
 * Supabase Auth: creates an auth user with the given credentials and returns its id.
 * Email confirmation is bypassed so sign-up works without SMTP on the free tier.
 * Throws an Error with a user-readable message on invalid input or duplicate email.
 */
export async function supabaseCreateUser(email: string, password: string): Promise<string> {
  const { data, error } = await supabaseAdmin().createUser({ email, password, email_confirm: true });
  if (error) throw new Error(readableAuthError(error.message, email));
  return data.user.id;
}

/**
 * Supabase Auth: signs in with email + password and writes the auth cookies.
 * Returns the user id, or null when the credentials are rejected.
 */
export async function supabaseSignIn(email: string, password: string): Promise<string | null> {
  const { data, error } = await (await supabaseAuth()).signInWithPassword({ email, password });
  if (error || !data.user) return null;
  return data.user.id;
}

/** Best-effort translation of Supabase auth errors into short, user-readable copy. */
function readableAuthError(message: string, email: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "An account with that email already exists.";
  }
  if (lower.includes("password")) return message;
  if (lower.includes("email")) return `Invalid email address (${email}).`;
  return message;
}
