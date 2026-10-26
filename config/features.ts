/**
 * Feature toggles. Nothing needs editing here: with no keys set the whole app runs offline
 * on mock data.
 * - ENABLE_AI_MODERATOR: turns on by itself when AI_API_KEY (or the older OPENAI_API_KEY) is set,
 *   so a deploy without the key keeps using mock responses. Set ENABLE_AI_MODERATOR=false in the
 *   environment to force it off even with a key present.
 * - ENABLE_ZOOM_API: uses Zoom (needs ZOOM_* env vars). Off = "Demo Meeting Room".
 * See README.md for how to turn these on.
 */
const aiKeyPresent = Boolean(process.env.AI_API_KEY || process.env.OPENAI_API_KEY);

export const FEATURES: { ENABLE_AI_MODERATOR: boolean; ENABLE_ZOOM_API: boolean } = {
  ENABLE_AI_MODERATOR: aiKeyPresent && process.env.ENABLE_AI_MODERATOR !== "false",
  ENABLE_ZOOM_API: false,
};
