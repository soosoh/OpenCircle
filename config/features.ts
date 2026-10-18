/**
 * Feature toggles. Keep both false to run the whole app offline with mock data.
 * - ENABLE_AI_MODERATOR: uses OpenAI (needs OPENAI_API_KEY). Off = human moderators only.
 * - ENABLE_ZOOM_API: uses Zoom (needs ZOOM_* env vars). Off = "Demo Meeting Room".
 * See README.md for how to turn these on.
 */
export const FEATURES: { ENABLE_AI_MODERATOR: boolean; ENABLE_ZOOM_API: boolean } = {
  ENABLE_AI_MODERATOR: false,
  ENABLE_ZOOM_API: false,
};
