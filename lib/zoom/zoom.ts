import { FEATURES } from "@/config/features";

/**
 * Zoom integration (server-only). When ENABLE_ZOOM_API is false, every function returns mock
 * meeting data and never reads ZOOM_* env vars. When true, it uses Zoom Server-to-Server OAuth.
 * Env: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET.
 * Transcripts require cloud recording with audio transcript enabled on the Zoom account.
 */

export interface ZoomMeeting {
  meetingId: string;
  meetingUrl: string;
  meetingPassword: string;
}

const ZOOM_API = "https://api.zoom.us/v2";
let cachedToken: { value: string; expiresAt: number } | null = null;

function mockMeeting(topic: string): ZoomMeeting {
  const meetingId = `demo-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
  return { meetingId, meetingUrl: `demo://room/${meetingId}`, meetingPassword: "demo" };
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;
  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    throw new Error("ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET must be set, or keep ENABLE_ZOOM_API false.");
  }
  const basic = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!response.ok) throw new Error(`Zoom token request failed with status ${response.status}`);
  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function zoomFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const response = await fetch(`${ZOOM_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
  });
  if (!response.ok) throw new Error(`Zoom ${path} failed with status ${response.status}`);
  return response;
}

/** Creates a scheduled meeting for a point. */
export async function createZoomMeeting(input: { topic: string; startTime: string; durationMinutes?: number }): Promise<ZoomMeeting> {
  if (!FEATURES.ENABLE_ZOOM_API) return mockMeeting(input.topic);
  const response = await zoomFetch("/users/me/meetings", {
    method: "POST",
    body: JSON.stringify({
      topic: input.topic,
      type: 2,
      start_time: input.startTime,
      duration: input.durationMinutes ?? 60,
      settings: { auto_recording: "cloud" },
    }),
  });
  const data = (await response.json()) as { id: number; join_url: string; password?: string };
  return { meetingId: String(data.id), meetingUrl: data.join_url, meetingPassword: data.password ?? "" };
}

/** Returns the URL a participant should open. Zoom has no separate join call, so this is the stored join URL. */
export async function joinZoomMeeting(meetingUrl: string): Promise<string> {
  return meetingUrl;
}

/** Returns the plain-text transcript of the meeting's cloud recording, or "" if none exists yet. */
export async function getMeetingTranscript(meetingId: string): Promise<string> {
  if (!FEATURES.ENABLE_ZOOM_API) return "Mock transcript: Bob finished chapters 1-3 but struggled with genetics.";
  const response = await zoomFetch(`/meetings/${meetingId}/recordings`);
  const data = (await response.json()) as { recording_files?: { file_type: string; download_url: string }[] };
  const transcript = data.recording_files?.find((f) => f.file_type === "TRANSCRIPT");
  if (!transcript) return "";
  const token = await getAccessToken();
  const text = await fetch(transcript.download_url, { headers: { Authorization: `Bearer ${token}` } });
  return text.ok ? text.text() : "";
}

/** Ends a live meeting. */
export async function endMeeting(meetingId: string): Promise<void> {
  if (!FEATURES.ENABLE_ZOOM_API) return;
  await zoomFetch(`/meetings/${meetingId}/status`, { method: "PUT", body: JSON.stringify({ action: "end" }) });
}
