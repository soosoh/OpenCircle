import { FEATURES } from "@/config/features";
import { nextWeeklyOccurrence, zonedParts } from "@/lib/domain/time";
import type { WeeklySchedule } from "@/types";

/**
 * Zoom integration (server-only). When ENABLE_ZOOM_API is false, every function returns mock
 * meeting data and never reads ZOOM_* env vars. When true, it uses Zoom Server-to-Server OAuth.
 * Env: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET.
 * Transcripts require cloud recording with audio transcript enabled on the Zoom account.
 */

export interface ZoomMeeting {
  /** "demo" when the flag is off or Zoom was unreachable — the in-app meeting room still works. */
  provider: "demo" | "zoom";
  meetingId: string;
  meetingUrl: string;
  meetingPassword: string;
}

const ZOOM_API = "https://api.zoom.us/v2";
const REQUEST_TIMEOUT_MS = 10_000;

let cachedToken: { value: string; expiresAt: number } | null = null;
let tokenInFlight: Promise<string> | null = null;

class ZoomApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ZoomApiError";
  }
}

function mockMeeting(topic: string): ZoomMeeting {
  const meetingId = `demo-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
  return { provider: "demo", meetingId, meetingUrl: `demo://room/${meetingId}`, meetingPassword: "demo" };
}

async function requestToken(): Promise<string> {
  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;
  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    throw new Error("ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET must be set, or keep ENABLE_ZOOM_API false.");
  }
  const basic = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${basic}` },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );
  if (!response.ok) throw new ZoomApiError(`Zoom token request failed with status ${response.status}`, response.status);
  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

/** Single-flight: concurrent callers share one in-flight token request instead of stampeding Zoom. */
async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  if (!tokenInFlight) {
    tokenInFlight = requestToken().finally(() => {
      tokenInFlight = null;
    });
  }
  return tokenInFlight;
}

function invalidateToken(): void {
  cachedToken = null;
}

/** Authenticated fetch with one retry after a 401 (expired/revoked token -> refresh -> retry). */
async function zoomFetch(path: string, init: RequestInit = {}, retried = false): Promise<Response> {
  const token = await getAccessToken();
  const response = await fetch(`${ZOOM_API}${path}`, {
    ...init,
    cache: "no-store",
    signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
  });
  if (response.status === 401 && !retried) {
    invalidateToken();
    return zoomFetch(path, init, true);
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new ZoomApiError(
      `Zoom ${path} failed with status ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
      response.status,
    );
  }
  return response;
}

/**
 * Creates the point's weekly Zoom meeting as a recurring meeting (type 8), so the join URL keeps
 * working every week instead of dying after one session. The start time is the next occurrence of
 * the point's weekly slot in its own timezone. Recording is on automatically for transcripts.
 * If Zoom is unreachable at creation time, falls back to the demo room so point creation never fails.
 */
export async function createZoomMeeting(input: {
  topic: string;
  schedule: WeeklySchedule;
  durationMinutes?: number;
}): Promise<ZoomMeeting> {
  if (!FEATURES.ENABLE_ZOOM_API) return mockMeeting(input.topic);
  try {
    const next = nextWeeklyOccurrence(input.schedule);
    const p = zonedParts(next, input.schedule.timezone);
    const pad = (n: number) => String(n).padStart(2, "0");
    const start = `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:00`;
    const response = await zoomFetch("/users/me/meetings", {
      method: "POST",
      body: JSON.stringify({
        topic: input.topic,
        type: 8,
        start_time: start,
        timezone: input.schedule.timezone,
        duration: input.durationMinutes ?? 60,
        recurrence: { type: 2, repeat_interval: 1, weekly_days: String(1 << input.schedule.weekday), end_times: 52 },
        settings: { auto_recording: "cloud", waiting_room: false, join_before_host: true },
      }),
    });
    const data = (await response.json()) as { id: number; join_url: string; password?: string };
    return { provider: "zoom", meetingId: String(data.id), meetingUrl: data.join_url, meetingPassword: data.password ?? "" };
  } catch (error) {
    console.error("Zoom meeting creation failed; falling back to the demo room for this point.", error);
    return mockMeeting(input.topic);
  }
}

/** Ends a live meeting. A meeting that already ended or never started is treated as success. */
export async function endMeeting(meetingId: string): Promise<void> {
  if (!FEATURES.ENABLE_ZOOM_API) return;
  try {
    await zoomFetch(`/meetings/${meetingId}/status`, { method: "PUT", body: JSON.stringify({ action: "end" }) });
  } catch (error) {
    if (error instanceof ZoomApiError && (error.status === 404 || error.status === 400)) return;
    throw error;
  }
}

/** Returns the plain-text transcript of the meeting's cloud recording, or "" if none exists yet. */
export async function getMeetingTranscript(meetingId: string): Promise<string> {
  if (!FEATURES.ENABLE_ZOOM_API) return "Mock transcript: Bob finished chapters 1-3 but struggled with genetics.";
  let data: { recording_files?: { file_type: string; download_url?: string }[] };
  try {
    const response = await zoomFetch(`/meetings/${meetingId}/recordings`);
    data = (await response.json()) as typeof data;
  } catch (error) {
    if (error instanceof ZoomApiError && error.status === 404) return "";
    throw error;
  }
  const transcript = data.recording_files?.find((file) => file.file_type === "TRANSCRIPT" && file.download_url);
  if (!transcript?.download_url) return "";
  try {
    const token = await getAccessToken();
    const download = await fetch(transcript.download_url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!download.ok) {
      console.error(`Zoom transcript download failed with status ${download.status}`);
      return "";
    }
    return await download.text();
  } catch (error) {
    console.error("Zoom transcript download failed.", error);
    return "";
  }
}
