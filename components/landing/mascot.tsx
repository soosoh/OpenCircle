/**
 * The StudyCircle cast: one character geometry, many moods — the way Duolingo
 * threads its owl through every surface. `Mascot` renders a single character
 * (a circle given a face, seated on the brand's chord-feet); `MascotCrowd`
 * renders the pile of friends for big "you're among people" moments.
 */

type Mood = "happy" | "cheer" | "wink" | "peek";

const CREAM = "#f4f2e8";
const INK = "#1e2030";

function Face({ mood }: { mood: Mood }) {
  return (
    <>
      {/* eyes — small, close-set, pupils drifting down-and-in so it feels alive.
          One quick squash every few seconds: the blink that says "alive". */}
      <g
        className={`${mood === "wink" ? "" : "animate-blink"} [transform-box:fill-box] [transform-origin:center]`}
      >
        {mood === "wink" ? (
        <>
          <circle cx="24" cy="25" r="4" fill={CREAM} />
          <circle cx="25" cy="25.5" r="1.9" fill={INK} />
          <path d="M39 25 q4 3 8 0" fill="none" stroke={CREAM} strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : mood === "peek" ? (
        <>
          <circle cx="24" cy="24" r="3.4" fill={CREAM} />
          <circle cx="40" cy="24" r="3.4" fill={CREAM} />
          <circle cx="25" cy="23.6" r="1.7" fill={INK} />
          <circle cx="41" cy="23.6" r="1.7" fill={INK} />
        </>
      ) : (
        <>
          <circle cx="24" cy="25" r="4" fill={CREAM} />
          <circle cx="40" cy="25" r="4" fill={CREAM} />
          <circle cx="25" cy="25.5" r="1.9" fill={INK} />
          <circle cx="41" cy="25.5" r="1.9" fill={INK} />
        </>
      )}
      </g>

      {/* blush — a little warmth does more than any extra detail */}
      <ellipse cx="16.5" cy="30.5" rx="3.4" ry="2.1" fill={CREAM} opacity="0.35" />
      <ellipse cx="47.5" cy="30.5" rx="3.4" ry="2.1" fill={CREAM} opacity="0.35" />

      {/* mouth */}
      {mood === "cheer" ? (
        <path d="M25 33.5 q7 10.5 14 0 z" fill={CREAM} />
      ) : mood === "peek" ? (
        <path d="M27 34.5 h10" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      ) : (
        <path d="M26 33.5 q6 6.5 12 0" fill="none" stroke={CREAM} strokeWidth="3" strokeLinecap="round" />
      )}
    </>
  );
}

function Body({ color }: { color: string }) {
  // Not a plain ball: it stands on the brand's chord-feet — the chord drawn
  // low, where legs belong, never across the face.
  return (
    <>
      <circle cx="32" cy="28" r="24" fill={color} />
      <line x1="26" y1="48" x2="23" y2="56.5" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="38" y1="48" x2="41" y2="56.5" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="23" cy="58" r="2.6" fill={color} />
      <circle cx="41" cy="58" r="2.6" fill={color} />
    </>
  );
}

export function Mascot({
  mood = "happy",
  color = "#4f46e5",
  className,
  label,
}: {
  mood?: Mood;
  color?: string;
  className?: string;
  /** Set to make it meaningful to screen readers; otherwise it's decoration. */
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <Body color={color} />
      {mood === "cheer" && (
        <>
          {/* raised arms, hands up */}
          <path d="M15 39 q-6.5 -5 -5 -12" fill="none" stroke={CREAM} strokeWidth="3" strokeLinecap="round" />
          <path d="M49 39 q6.5 -5 5 -12" fill="none" stroke={CREAM} strokeWidth="3" strokeLinecap="round" />
          <circle cx="10" cy="26" r="2.8" fill={CREAM} />
          <circle cx="54" cy="26" r="2.8" fill={CREAM} />
        </>
      )}
      <Face mood={mood} />
      {mood === "cheer" && (
        <>
          {/* confetti */}
          <path d="M18 5 v6 M15 8 h6" stroke={CREAM} strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          <path d="M46 3 v6 M43 6 h6" stroke={CREAM} strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          <circle cx="32" cy="3" r="2" fill="#f0a03c" />
        </>
      )}
    </svg>
  );
}

export function MascotCrowd({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-end justify-center ${className ?? ""}`} aria-hidden="true">
      <Mascot mood="wink" color="#22a58a" className="absolute -left-10 bottom-2 size-16 rotate-[-10deg] animate-bob [animation-delay:-1.5s] drop-shadow-md" />
      <Mascot mood="peek" color="#e2578a" className="absolute -right-10 bottom-2 size-16 rotate-[10deg] animate-bob [animation-delay:-3.1s] drop-shadow-md" />
      <Mascot mood="cheer" className="relative size-28 animate-float drop-shadow-xl" />
    </div>
  );
}
