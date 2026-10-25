import { Mascot } from "@/components/landing/mascot";

/**
 * THE page background — and each slide gets its own evening:
 *
 *   circle   the lit schoolhouse, lamplit trail and the walk of friends
 *   chords   an open pavilion with string lights, pennants and the cast beneath
 *   points   a fire ring: staked tents, crossed logs, a breathing flame
 *   progress dawn over the summit: moon, birds, a rope of milestone pennants
 *
 * One shared ridge skeleton (far ranges, mist, treeline, ground, grain) keeps
 * the four scenes reading as one world; the centerpiece band, glow tint and sky
 * change per scene.
 *
 * The figures are the page's real characters: `Mascot` components nested into
 * the scene at exact user-unit sizes, each with a contact shadow that stays
 * flat on the ground while the body bobs. The dog (no mascot exists for him)
 * borrows the same face language plus a collar; his blink group carries the
 * transform-box/origin pair the keyframe needs.
 *
 * Fixed to the viewport above the night gradient, below grain and panels;
 * pointer-transparent throughout.
 */

type Scene = "circle" | "chords" | "points" | "progress";

/* palette shared with the rest of the page */
const CREAM = "#f4f2e8";
const INK = "#07060c";
const INK_SOFT = "#0b0817";
const MINT = "#22a58a";
const VIOLET = "#b7aaff";
const CORAL = "#e2578a";
const INDIGO = "#4f46e5";
const LILAC = "#8b7ff7";

/* ------------------------------------------------------------------ */
/* buildings and books — real architecture, real objects               */
/* ------------------------------------------------------------------ */

const WALL = "#2a2450";
const ROOF = "#141021";
const PLINTH = "#1a1533";
const POLE = "#3d3770";
const FOLIAGE = "#221d3f";

/** One framed window: lintel, glass, mullions, sill — rows read as glazing. */
function Window({
  x,
  y,
  w = 14,
  h = 18,
  mint = false,
  delay = "0s",
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  mint?: boolean;
  delay?: string;
}) {
  return (
    <g>
      <rect x={x - 1} y={y - 2.2} width={w + 2} height={2.2} fill={ROOF} />
      <rect x={x} y={y} width={w} height={h} rx={2} stroke={ROOF} strokeWidth={1.4} fill={mint ? MINT : CREAM} opacity={mint ? 0.75 : 0.6} className={mint ? "animate-twinkle" : undefined} style={mint ? { animationDelay: delay } : undefined} />
      <line x1={x + w / 2} y1={y + 1.5} x2={x + w / 2} y2={y + h - 1.5} stroke={ROOF} strokeWidth={1.1} opacity={0.7} />
      <line x1={x + 1} y1={y + h / 2} x2={x + w - 1} y2={y + h / 2} stroke={ROOF} strokeWidth={1.1} opacity={0.7} />
      <rect x={x - 2.6} y={y + h} width={w + 5.2} height={2.4} rx={1} fill={PLINTH} />
    </g>
  );
}

/** Soft chimney smoke: three puffs breathing upward. */
function Smoke({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cy={-3} r={2.1} fill={CREAM} opacity={0.1} className="animate-float" />
      <circle cy={-9.5} r={2.8} fill={CREAM} opacity={0.07} className="animate-float" style={{ animationDelay: "-2.2s" }} />
      <circle cy={-16.5} r={3.6} fill={CREAM} opacity={0.05} className="animate-float" style={{ animationDelay: "-4.1s" }} />
    </g>
  );
}

/** A low bush with mint berries — grounds the buildings. */
function Bush({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse rx={8} ry={5} fill={FOLIAGE} />
      <ellipse cx={6.5} cy={-1.8} rx={5.6} ry={4.2} fill={WALL} />
      <circle cx={-1.5} cy={-4} r={1.2} fill={MINT} opacity={0.55} />
      <circle cx={7.5} cy={-3.6} r={1} fill={MINT} opacity={0.4} />
    </g>
  );
}

/** A street lamp: pole, curved arm, glow pool — the trail's guide light. */
function Lamppost({ x, ground }: { x: number; ground: number }) {
  return (
    <g transform={`translate(${x} ${ground})`}>
      <ellipse cx={2} cy={1} rx={5} ry={1.4} fill="#050308" opacity={0.3} />
      <line y2={-46} stroke={POLE} strokeWidth={2.6} strokeLinecap="round" />
      <circle cy={-46} r={1.7} fill={POLE} />
      <path d="M0 -43.5 Q7 -49 11.8 -45" stroke={POLE} strokeWidth={2.2} strokeLinecap="round" fill="none" />
      <line x1={11.8} y1={-45} x2={11.8} y2={-42.4} stroke={POLE} strokeWidth={1.6} strokeLinecap="round" />
      <circle cx={11.8} cy={-38.6} r={9} fill={CREAM} opacity={0.05} />
      <circle cx={11.8} cy={-38.6} r={5} fill={CREAM} opacity={0.12} />
      <circle cx={11.8} cy={-38.6} r={3.4} fill={CREAM} opacity={0.95} />
      <ellipse cx={11.8} cy={-1} rx={16} ry={4.5} fill={CREAM} opacity={0.05} />
    </g>
  );
}

/** A sentry mailbox at the trailhead, flag up. */
function Mailbox({ x, ground }: { x: number; ground: number }) {
  return (
    <g transform={`translate(${x} ${ground})`}>
      <ellipse rx={6} ry={1.5} fill="#050308" opacity={0.25} />
      <line y2={-8.5} stroke={PLINTH} strokeWidth={2} strokeLinecap="round" />
      <rect x={-5.6} y={-15.8} width={11.2} height={7.6} rx={1.8} fill={WALL} stroke={PLINTH} strokeWidth={0.8} />
      <line x1={-1} y1={-15.4} x2={-1} y2={-8.6} stroke={PLINTH} strokeWidth={1} />
      <path d="M5.6 -15.6 L8.6 -17.2 L5.6 -13 Z" fill={MINT} opacity={0.85} />
    </g>
  );
}

/** Flat stepping stones climbing the trail. */
function SteppingStones({ path }: { path: ReadonlyArray<readonly [number, number]> }) {
  return (
    <g>
      {path.map(([sx, sy], i) => (
        <g key={i}>
          <ellipse cx={sx} cy={sy} rx={5.2} ry={2} fill="#201a2e" />
          <path d={`M${sx - 3.6} ${sy - 0.9} Q${sx} ${sy - 2.1} ${sx + 3.6} ${sy - 0.9}`} stroke={CREAM} strokeWidth={0.9} fill="none" opacity={0.14} />
        </g>
      ))}
    </g>
  );
}

/** A split-rail fence segment by the barn. */
function Fence({ x, ground }: { x: number; ground: number }) {
  return (
    <g stroke="#312b63" strokeLinecap="round">
      {[0, 13, 26].map((dx) => (
        <line key={dx} x1={x + dx} y1={ground} x2={x + dx} y2={ground - 8.5} strokeWidth={2} />
      ))}
      <line x1={x - 2} y1={ground - 4} x2={x + 28} y2={ground - 4} strokeWidth={1.4} opacity={0.8} />
      <line x1={x - 2} y1={ground - 7.4} x2={x + 28} y2={ground - 7.4} strokeWidth={1.4} opacity={0.8} />
    </g>
  );
}

/** The schoolhouse cluster: bell tower, clock, lantern-lit door, smoke. */
function SchoolCluster() {
  return (
    <g>
      <rect x="612" y="550" width="252" height="102" fill={WALL} />
      <rect x="600" y="650" width="276" height="12" fill={PLINTH} />
      <rect x="864" y="592" width="70" height="60" fill={WALL} />
      <path d="M856 596 L899 574 L942 596 Z" fill={ROOF} />
      <rect x="906" y="566" width="9" height="20" fill={ROOF} />
      <rect x="902" y="562" width="17" height="5" rx="1.5" fill={PLINTH} />
      <rect x="706" y="474" width="56" height="178" fill={WALL} />
      <rect x="486" y="626" width="84" height="38" fill={WALL} />
      <path d="M570 552 L738 486 L906 552 Z" fill={ROOF} />
      <path d="M570 552 L906 552 L888 562 L588 562 Z" fill={INK_SOFT} />
      <path d="M578 550 L738 492 L898 550" stroke={VIOLET} strokeWidth="2" strokeLinecap="round" opacity="0.34" fill="none" />
      <path d="M696 474 L734 436 L772 474 Z" fill={ROOF} />
      <path d="M700 472 L734 440 L768 472" stroke={VIOLET} strokeWidth="2" strokeLinecap="round" opacity="0.34" fill="none" />
      <path d="M478 628 L528 606 L578 628" stroke={VIOLET} strokeWidth="1.8" strokeLinecap="round" opacity="0.26" fill="none" />
      <path d="M856 595 L899 575 L940 594" stroke={VIOLET} strokeWidth="1.8" strokeLinecap="round" opacity="0.26" fill="none" />
      <rect x="512" y="640" width="32" height="24" fill={INK_SOFT} stroke={PLINTH} strokeWidth="1.4" />
      <line x1="528" y1="640" x2="528" y2="664" stroke={PLINTH} strokeWidth="1.4" />
      <circle cx="524" cy="652" r="1.4" fill={CREAM} opacity="0.5" />

      <Window x={630} y={588} />
      <Window x={662} y={588} />
      <Window x={764} y={588} />
      <Window x={796} y={588} />
      <Window x={720} y={588} mint delay="-2.5s" />
      <Window x={630} y={628} />
      <Window x={664} y={628} />
      <Window x={778} y={628} />
      <Window x={812} y={628} />
      <Window x={884} y={608} w={11} h={14} />
      <Window x={911} y={608} w={11} h={14} mint delay="-4.2s" />

      {/* the arched front door, keystone, lantern and lit steps */}
      <path d="M718 662 L718 634 Q733 622 748 634 L748 662 Z" fill={INK_SOFT} />
      <path d="M716 663 L716 633 Q733 619 750 633 L750 663" stroke={CREAM} strokeWidth="1.5" opacity="0.4" fill="none" />
      <rect x="731.4" y="620.4" width="3.4" height="5" rx="0.8" fill={PLINTH} />
      <path d="M733 619.5 V616" stroke={POLE} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="733" cy="612.4" r={5} fill={CREAM} opacity={0.12} />
      <circle cx="733" cy="612.4" r={2.2} fill={CREAM} opacity={0.95} className="animate-twinkle" style={{ animationDelay: "-3.4s" }} />
      <rect x="712" y="662" width="42" height="5" fill={PLINTH} />
      <rect x="708" y="667" width="50" height="4" fill={PLINTH} opacity="0.75" />
      <ellipse cx="733" cy="671" rx={26} ry={4} fill={CREAM} opacity={0.045} />

      {/* tower: bell in the belfry, ribboned clock, finial pennant */}
      <path d="M723 500 Q734 492 745 500 L745 514 L723 514 Z" fill={INK_SOFT} />
      <path d="M729.5 511.5 L729.5 506 Q729.5 500.6 734 499.2 Q738.5 500.6 738.5 506 L738.5 511.5 Z" fill={CREAM} opacity="0.4" />
      <circle cx="734" cy="513.2" r="0.9" fill={CREAM} opacity="0.4" />
      <circle cx="734" cy="551" r="15.4" fill="none" stroke="#443c78" strokeWidth="1.2" opacity="0.8" />
      <circle cx="734" cy="548" r="14" fill={CREAM} opacity="0.92" className="animate-twinkle" />
      <line x1="734" y1="534.6" x2="734" y2="537.4" stroke={WALL} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="734" y1="561.4" x2="734" y2="558.6" stroke={WALL} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="720.6" y1="548" x2="723.4" y2="548" stroke={WALL} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="747.4" y1="548" x2="744.6" y2="548" stroke={WALL} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="727" y1="541" x2="729.1" y2="543.1" stroke={WALL} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      <line x1="741" y1="541" x2="738.9" y2="543.1" stroke={WALL} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      <line x1="727" y1="555" x2="729.1" y2="552.9" stroke={WALL} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      <line x1="741" y1="555" x2="738.9" y2="552.9" stroke={WALL} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      <line x1="734" y1="548" x2="734" y2="540.5" stroke={WALL} strokeWidth="2" strokeLinecap="round" />
      <line x1="734" y1="548" x2="740.5" y2="550.5" stroke={WALL} strokeWidth="2" strokeLinecap="round" />
      <line x1="734" y1="436" x2="734" y2="408" stroke={WALL} strokeWidth="3" />
      <path d="M736 408 L762 415 L736 423 Z" fill={VIOLET} />
      <circle cx="518" cy="646" r="3" fill={CREAM} opacity="0.4" />

      <Smoke x={910.5} y={560} />
      <Bush x={598} y={666} />
      <Bush x={880} y={666} />
      <Bush x={578} y={668} s={0.8} />
    </g>
  );
}

/** A stack of real books: ink blocks, cream fore-edges, colored title bands. */
function BookStack({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const bands = [MINT, VIOLET, CORAL, CREAM];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse rx={40} ry={5} fill="#050308" opacity={0.22} />
      <g transform="rotate(-68 -40 0)">
        <rect x="-46" y="8" width="11" height="40" rx="2" fill={INK} />
        <rect x="-46" y="8" width="11" height="40" rx="2" fill="none" stroke={PLINTH} strokeWidth="1" />
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`rotate(${i === 0 ? -5 : i === 2 ? 4 : 0})`}>
          <rect x="-34" y={-14 - i * 13.4} width={64 - i * 6} height="12.4" rx="2.4" fill={INK} />
          <rect x={26 - i * 6} y={-13 - i * 13.4} width="3.6" height="10.4" fill={CREAM} opacity={0.4} />
          <rect x="-22" y={-14 - i * 13.4} width="9" height="12.4" fill={bands[i]} opacity="0.55" />
        </g>
      ))}
    </g>
  );
}

/** The open book at the trailhead, with a page seam and fore-edge. */
function BookAt({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path
        d={`M${x - 46} ${y + 12} Q${x - 24} ${y} ${x} ${y + 6} Q${x + 24} ${y + 12} ${x + 46} ${y + 6} L${x + 46} ${y + 18} Q${x + 24} ${y + 24} ${x} ${y + 18} Q${x - 24} ${y + 12} ${x - 46} ${y + 24} Z`}
        fill={INK}
      />
      <line x1={x} y1={y + 6} x2={x} y2={y + 18} stroke={CREAM} strokeWidth="1.4" opacity="0.45" />
      <line x1={x - 26} y1={y + 5} x2={x - 8} y2={y + 10} stroke={CREAM} strokeWidth="1" opacity="0.28" />
      <line x1={x + 8} y1={y + 10} x2={x + 26} y2={y + 5} stroke={CREAM} strokeWidth="1" opacity="0.28" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* the cast: real mascots nested into the scene, plus the dog          */
/* ------------------------------------------------------------------ */

const FOOT = 0.947; // feet bottom within the mascot box (y=60.6 of 64)

function SceneMascot({
  x,
  ground,
  size = 10,
  mood = "happy",
  color = MINT,
  tilt = 0,
  bob,
}: {
  /** scene x of the character's center */
  x: number;
  /** scene y of the ground under the feet */
  ground: number;
  /** rendered box in scene units: 9/10/11 → 36/40/44 */
  size?: 9 | 10 | 11;
  mood?: "happy" | "cheer" | "peek" | "wink";
  color?: string;
  tilt?: number;
  bob?: string;
}) {
  const box = size * 4;
  const ax = x - box / 2; // content centers on 32/64 of the box
  const by = ground - FOOT * box;
  return (
    <g transform={`translate(${ax} ${by})`}>
      {/* contact shadow stays flat on the ground; body tilts/bobs above it */}
      <ellipse cx={box / 2} cy={FOOT * box + 0.6} rx={box * 0.42} ry={box * 0.085} fill="#050308" opacity="0.32" />
      <g
        transform={`rotate(${tilt} ${box / 2} ${FOOT * box - 2})`}
        className={bob ? "animate-bob" : undefined}
        style={bob ? { animationDelay: bob } : undefined}
      >
        <Mascot mood={mood} color={color} width={box} height={box} />
      </g>
    </g>
  );
}

/**
 * The dog, walking or curled — the one hand-drawn character (no mascot exists
 * for him): same face language, a mint collar to keep him in the family.
 */
function Dog({
  x,
  y,
  pose = "walk",
}: {
  x: number;
  y: number;
  pose?: "walk" | "curled";
}) {
  if (pose === "curled") {
    return (
      <g transform={`translate(${x} ${y})`}>
        <ellipse cy={0.8} rx={10.5} ry={2} fill="#050308" opacity={0.3} />
        <path d="M-9 -1.5 Q-10.5 -6 -6.5 -6.8" stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" />
        <path d="M-9 0 Q-10.6 -6.4 -1 -7.8 Q8 -7.4 9.6 -0.6 L9.6 0 Q0 0.9 -9 0 Z" fill={INK} />
        <circle cx="6.6" cy="-6.6" r="3.7" fill={INK} />
        <path d="M4.6 -9.4 Q3 -11.4 5 -11.6 Q6.4 -10.6 6.2 -9.2 Z" fill={INK} />
        <path d="M8.8 -9.9 Q10.8 -12 11.4 -9.6 Q10.2 -8.8 8.8 -9.4 Z" fill={INK} />
        <g className="animate-blink [transform-box:fill-box] [transform-origin:center]">
          <circle cx="5" cy="-6.7" r="1.1" fill={CREAM} />
          <circle cx="5" cy="-6.7" r="0.5" fill={INK_SOFT} />
        </g>
        <path d="M3.5 -4.5 Q5 -3.6 6.5 -4.2" stroke={CREAM} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.85" />
        <path d="M3.9 -3.5 Q6.7 -2.3 9.3 -3.9" stroke={MINT} strokeWidth="1.7" strokeLinecap="round" fill="none" opacity="0.9" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse rx={11} ry={2.2} fill="#050308" opacity={0.3} />
      <path d="M-8.6 -6.8 Q-13 -9 -12.4 -13" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <line x1="-5.2" y1="-4.6" x2="-7.6" y2="0.8" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      <line x1="3" y1="-4.6" x2="5.4" y2="0.8" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      <rect x="-9.5" y="-9.8" width="18.6" height="8.2" rx="4" fill={INK} />
      <line x1="-3.6" y1="-4.4" x2="-1.2" y2="0.9" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      <line x1="5.6" y1="-4.4" x2="8" y2="0.9" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      <rect x="7.6" y="-10.6" width="2.8" height="4" rx="1" fill={MINT} opacity="0.9" />
      <circle cx="11.8" cy="-12" r="4.4" fill={INK} />
      <path d="M14.6 -15.7 Q16.8 -18.2 17.8 -15.4 Q16.4 -13.8 14.6 -14.4 Z" fill={INK} />
      <path d="M9.2 -15.8 Q6.6 -17.6 6.4 -15 Q7.6 -13.6 9.8 -14.2 Z" fill={INK} />
      <g className="animate-blink [transform-box:fill-box] [transform-origin:center]">
        <circle cx="10" cy="-12.4" r="1.25" fill={CREAM} />
        <circle cx="10.35" cy="-12.25" r="0.6" fill={INK_SOFT} />
      </g>
      <circle cx="7.9" cy="-10.2" r="1.6" fill={INK} />
      <path d="M6.9 -7.9 Q8.6 -6.9 10.3 -7.7" stroke={CREAM} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.85" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* scenery skeleton (shared by every scene)                            */
/* ------------------------------------------------------------------ */

function FarRange() {
  return (
    <g>
      <path d="M-60 560 Q90 420 200 392 Q300 368 380 430 Q470 500 560 545" fill="#221d47" />
      <path d="M560 545 L640 460 L760 545" fill="#221d47" />
      <path d="M700 545 Q820 420 920 380 Q1030 340 1120 410 Q1300 520 1440 470 L1440 620 L-60 620 Z" fill="#221d47" />
      <path d="M920 382 Q1006 348 1090 402" stroke="#a5b4fc" strokeWidth="2.2" strokeLinecap="round" opacity="0.24" fill="none" />
      <path d="M300 369 Q350 372 396 402" stroke="#a5b4fc" strokeWidth="2.2" strokeLinecap="round" opacity="0.22" fill="none" />
      <path d="M-40 480 Q260 430 560 466 Q860 500 1180 456 Q1330 440 1440 462 V640 H-40 Z" fill="#1c1840" />
    </g>
  );
}

function Mist() {
  return (
    <g>
      <rect x="120" y="500" width="460" height="16" rx="8" fill="#8b7ff7" opacity="0.055" />
      <rect x="260" y="512" width="300" height="10" rx="5" fill="#8b7ff7" opacity="0.045" />
      <rect x="840" y="470" width="480" height="14" rx="7" fill="#8b7ff7" opacity="0.05" />
    </g>
  );
}

function SecondRange({ dorm = true }: { dorm?: boolean }) {
  return (
    <g>
      <path d="M-60 640 Q80 520 190 472 Q320 420 470 640 Z" fill="#1c1739" />
      <path d="M190 474 Q330 440 430 560" stroke="#8b7ff7" strokeWidth="1.8" strokeLinecap="round" opacity="0.2" fill="none" />
      <path d="M400 640 Q600 470 760 430 Q900 396 1060 560 Q1180 620 1280 640 Z" fill="#1c1739" />
      <line x1="190" y1="472" x2="190" y2="448" stroke="#1c1739" strokeWidth="2.6" />
      <path d="M192 448 L214 454 L192 461 Z" fill={VIOLET} />
      <line x1="900" y1="396" x2="900" y2="372" stroke="#1c1739" strokeWidth="2.6" />
      <path d="M902 372 L924 378 L902 385 Z" fill={MINT} />
      <g fill="#241e4a">
        <path d="M356 560 L368 600 L344 600 Z" />
        <path d="M382 552 L395 598 L369 598 Z" />
        <path d="M408 558 L419 600 L397 600 Z" />
      </g>
      {dorm && (
        <g>
          <rect x="1030" y="490" width="132" height="74" fill="#241e48" />
          <path d="M1018 492 L1096 446 L1178 494 L1202 494 L1202 566 L1018 566 Z" fill={ROOF} />
          <rect x="1080" y="420" width="10" height="30" fill={ROOF} />
          <rect x="1076" y="416" width="18" height="5" rx="1.5" fill={PLINTH} />
          <path d="M1020 492 L1096 447 L1176 493" stroke={VIOLET} strokeWidth="1.8" strokeLinecap="round" opacity="0.3" fill="none" />
          <Window x={1052} y={512} w={12} h={15} />
          <Window x={1080} y={512} w={12} h={15} />
          <Window x={1140} y={512} w={12} h={15} />
          <Window x={1168} y={512} w={12} h={15} mint delay="-1.8s" />
          <Window x={1052} y={540} w={12} h={15} />
          <Window x={1140} y={540} w={12} h={15} />
          <Smoke x={1085} y={414} />
        </g>
      )}
    </g>
  );
}

function MainRidge() {
  return <path d="M0 600 Q220 584 420 592 Q560 596 640 586 Q760 570 900 580 Q1140 592 1440 566 V720 H0 Z" fill="#1c1734" />;
}

function TreelineBand() {
  return (
    <g>
      <path d="M0 660 Q240 646 480 654 Q760 664 1000 652 Q1240 644 1440 650 V720 H0 Z" fill="#171226" />
      <g fill="#171226">
        <path d="M248 646 L262 694 L232 694 Z" />
        <path d="M286 638 L302 694 L270 694 Z" />
        <path d="M322 646 L334 692 L308 692 Z" />
        <path d="M1104 646 L1118 694 L1090 694 Z" />
        <path d="M1142 638 L1158 694 L1126 694 Z" />
      </g>
    </g>
  );
}

function Ground() {
  return <path d="M0 690 Q200 678 420 686 Q640 694 860 682 Q1160 672 1440 684 V720 H0 Z" fill="#0f0d15" />;
}

function FramePines() {
  return (
    <g fill={INK}>
      <path d="M1310 664 L1334 720 L1286 720 Z" />
      <path d="M1360 690 L1378 720 L1342 720 Z" />
      <path d="M1404 668 L1424 720 L1384 720 Z" />
      <path d="M120 690 L138 720 L102 720 Z" />
      <path d="M64 674 L84 720 L44 720 Z" />
    </g>
  );
}

function RidgePines() {
  return (
    <g fill="#1c1734">
      <path d="M436 612 L448 652 L422 652 Z" />
      <path d="M462 604 L474 652 L450 652 Z" />
      <path d="M952 606 L965 656 L939 656 Z" />
      <path d="M982 598 L996 654 L968 654 Z" />
      <path d="M1010 608 L1021 650 L999 650 Z" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* scene bands                                                         */
/* ------------------------------------------------------------------ */

function StringLights({ a, b, sag, lights }: { a: [number, number]; b: [number, number]; sag: number; lights: { x: number; y: number; mint?: boolean; delay?: string }[] }) {
  const [ax, ay] = a;
  const [bx, by] = b;
  const cx = (ax + bx) / 2;
  const cy = Math.max(ay, by) + sag;
  return (
    <g>
      <path d={`M${ax} ${ay} Q${cx} ${cy} ${bx} ${by}`} stroke={CREAM} strokeWidth="1.2" opacity="0.3" fill="none" />
      {lights.map((l, i) => (
        <circle
          key={i}
          cx={l.x}
          cy={l.y}
          r="2.1"
          fill={l.mint ? MINT : CREAM}
          opacity={l.mint ? 0.75 : 0.65}
          className="animate-twinkle"
          style={{ animationDelay: l.delay ?? `-${(i % 5) * 1.3}s` }}
        />
      ))}
    </g>
  );
}

/** A meeting table with benches and cups, set on the pavilion platform. */
function TableSet() {
  return (
    <g>
      <rect x="700" y="542" width="60" height="3.5" rx="1" fill="#241e48" />
      <rect x="703" y="545.5" width="2.4" height="10.8" fill="#241e48" />
      <rect x="754.6" y="545.5" width="2.4" height="10.8" fill="#241e48" />
      <rect x="676" y="551.6" width="22" height="3.2" rx="1" fill="#241e48" />
      <rect x="762" y="551.6" width="22" height="3.2" rx="1" fill="#241e48" />
      <rect x="712" y="538.2" width="2.8" height="3.8" rx="0.8" fill={CREAM} opacity="0.55" />
      <rect x="728" y="538.2" width="2.8" height="3.8" rx="0.8" fill={MINT} opacity="0.6" />
      <rect x="744" y="538.2" width="2.8" height="3.8" rx="0.8" fill={CREAM} opacity="0.55" />
    </g>
  );
}

/** The pavilion's nameplate: a tiny friend's face, mounted on the pole. */
function SignBoard() {
  return (
    <g transform="rotate(-3 627.5 500)">
      <rect x="613.5" y="490" width="28" height="18" rx="3" fill="#1c1734" stroke={PLINTH} strokeWidth="1.2" />
      <circle cx="618.6" cy="493.6" r="0.9" fill={PLINTH} />
      <circle cx="636.4" cy="493.6" r="0.9" fill={PLINTH} />
      <circle cx="627.5" cy="500.5" r="5.6" fill={MINT} />
      <g className="animate-blink [transform-box:fill-box] [transform-origin:center]">
        <circle cx="625.9" cy="499.2" r="0.75" fill={INK_SOFT} />
        <circle cx="629.3" cy="499.2" r="0.75" fill={INK_SOFT} />
      </g>
      <path d="M625.3 502.6 Q627.5 504.2 629.7 502.6" stroke={CREAM} strokeWidth="0.9" strokeLinecap="round" fill="none" />
    </g>
  );
}

/** Scene 1 — circle: the canonical study walk. */
function CircleScene() {
  return (
    <>
      <SecondRange dorm />
      <MainRidge />
      <SchoolCluster />
      <RidgePines />
      <TreelineBand />
      <Ground />
      <ellipse cx="700" cy="672" rx="230" ry="30" fill="#8b7ff7" opacity="0.08" />
      <path d="M580 712 Q636 690 664 678 Q706 660 726 648" stroke="#1a1626" strokeWidth="7" strokeLinecap="round" fill="none" />
      <SteppingStones
        path={[
          [600, 706],
          [628, 694],
          [656, 677],
          [688, 661],
          [714, 648],
        ]}
      />
      <Fence x={446} ground={663} />
      <Lamppost x={588} ground={708} />
      <Mailbox x={470} ground={700} />
      <Bush x={394} y={686} />
      <Bush x={1190} y={678} s={0.9} />
      <BookStack x={566} y={706} s={0.95} />
      <BookAt x={554} y={694} />
      <BookStack x={352} y={680} />
      <BookStack x={1252} y={662} s={1.05} />
      {/* the walk of friends heading to the evening session */}
      <SceneMascot x={652} ground={708} size={9} mood="peek" color={MINT} tilt={-4} />
      <SceneMascot x={690} ground={690} size={10} mood="happy" color={CORAL} tilt={3} />
      <SceneMascot x={724} ground={672} size={10} mood="wink" color={INDIGO} />
      <SceneMascot x={760} ground={654} size={11} mood="cheer" color={MINT} bob="-1.6s" />
      <Dog x={802} y={668} />
      <FramePines />
    </>
  );
}

/** Scene 2 — chords: the open pavilion, strung with lights. */
function ChordsScene() {
  return (
    <>
      <SecondRange dorm />
      <MainRidge />
      <g>
        <g fill="#1c1734">
          <rect x="600" y="556" width="280" height="14" />
          <rect x="624" y="470" width="7" height="88" />
          <rect x="849" y="470" width="7" height="88" />
          <path d="M580 472 L738 424 L896 472 Z" />
          <rect x="592" y="472" width="16" height="10" />
          <rect x="866" y="472" width="18" height="10" />
        </g>
        <path d="M584 472 L738 426 L892 472" stroke={VIOLET} strokeWidth="2" strokeLinecap="round" opacity="0.32" fill="none" />
        <path d="M596 484 Q738 502 880 484" stroke={CREAM} strokeWidth="1" opacity="0.22" fill="none" />
        <path d="M636 490 L636 506 L648 498 Z" fill={VIOLET} />
        <path d="M700 495 L700 511 L712 503 Z" fill={MINT} />
        <path d="M764 495 L764 511 L776 503 Z" fill={VIOLET} />
        <path d="M824 490 L824 506 L836 502 Z" fill={MINT} />
        <StringLights
          a={[628, 474]}
          b={[738, 500]}
          sag={16}
          lights={[
            { x: 660, y: 480 },
            { x: 688, y: 492 },
            { x: 714, y: 496, mint: true },
          ]}
        />
        <StringLights
          a={[738, 500]}
          b={[854, 474]}
          sag={16}
          lights={[
            { x: 764, y: 498 },
            { x: 796, y: 496, mint: true },
            { x: 826, y: 488 },
          ]}
        />
        <StringLights
          a={[852, 486]}
          b={[930, 540]}
          sag={12}
          lights={[
            { x: 884, y: 498, mint: true },
            { x: 908, y: 518 },
          ]}
        />
        <TableSet />
        <SignBoard />
        <ellipse cx="738" cy="610" rx="200" ry="26" fill="#8b7ff7" opacity="0.07" />
      </g>
      <g fill="#1c1734">
        <rect x="470" y="616" width="74" height="48" />
        <path d="M462 618 L507 592 L552 618 Z" />
      </g>
      <path d="M464 617 L507 594 L548 616" stroke={VIOLET} strokeWidth="1.8" strokeLinecap="round" opacity="0.3" fill="none" />
      <Window x={484} y={632} w={11} h={14} mint delay="-2s" />
      <Bush x={540} y={672} s={0.85} />
      <RidgePines />
      <TreelineBand />
      <Ground />
      <ellipse cx="700" cy="682" rx="180" ry="24" fill="#8b7ff7" opacity="0.07" />
      {/* friends gathered beneath the strings */}
      <SceneMascot x={618} ground={706} size={9} mood="happy" color={CORAL} tilt={5} />
      <SceneMascot x={702} ground={702} size={10} mood="wink" color={LILAC} bob="-2.4s" />
      <SceneMascot x={764} ground={696} size={11} mood="cheer" color={INDIGO} />
      <BookStack x={842} y={690} s={0.8} />
      <Dog x={886} y={704} pose="curled" />
      <FramePines />
    </>
  );
}

/** Scene 3 — points: the fire ring. */
function PointsScene() {
  return (
    <>
      <SecondRange dorm={false} />
      <MainRidge />
      <g>
        {([
          [572, 630],
          [636, 612],
          [708, 602],
          [788, 606],
          [862, 622],
        ] as ReadonlyArray<readonly [number, number]>).map(([tx, ty], i) => (
          <g key={i}>
            <path d={`M${tx - 30} ${ty + 34} L${tx} ${ty} L${tx + 30} ${ty + 34} Z`} fill="#1c1734" />
            <path d={`M${tx - 30} ${ty + 34} L${tx} ${ty} L${tx + 30} ${ty + 34}`} stroke={VIOLET} strokeWidth="1.4" strokeLinecap="round" opacity="0.2" fill="none" />
            {/* guy lines and pegs */}
            <line x1={tx - 4} y1={ty + 8} x2={tx - 42} y2={ty + 34} stroke={PLINTH} strokeWidth="1" opacity="0.5" />
            <line x1={tx + 4} y1={ty + 8} x2={tx + 42} y2={ty + 34} stroke={PLINTH} strokeWidth="1" opacity="0.5" />
            <circle cx={tx - 43} cy={ty + 34} r="1.3" fill={PLINTH} />
            <circle cx={tx + 43} cy={ty + 34} r="1.3" fill={PLINTH} />
            <rect x={tx - 4} y={ty + 14} width="8" height="20" rx="3" fill={CREAM} opacity="0.18" />
            {i === 0 && <path d={`M${tx + 6} ${ty - 2} L${tx + 6} ${ty - 16} L${tx + 20} ${ty - 12} L${tx + 6} ${ty - 9} Z`} fill={MINT} />}
            {i === 3 && <path d={`M${tx - 8} ${ty - 2} L${tx - 8} ${ty - 16} L${tx - 22} ${ty - 12} L${tx - 8} ${ty - 9} Z`} fill={VIOLET} />}
          </g>
        ))}
        {/* the fire on its stone ring: crossed logs, breathing glow */}
        <ellipse cx="724" cy="668" rx="120" ry="20" fill="#8b7ff7" opacity="0.05" />
        <circle cx="724" cy="652" r="56" fill={CREAM} opacity="0.05" className="animate-twinkle" style={{ animationDelay: "-2s" }} />
        <circle cx="724" cy="654" r="30" fill={CREAM} opacity="0.07" />
        <g>
          {[-14, -7, 0, 7, 14].map((dx, i) => (
            <circle key={i} cx={724 + dx} cy={660 + (i % 2 ? 2 : 0)} r={2.4} fill={INK_SOFT} />
          ))}
        </g>
        <g transform="rotate(-21 724 659)">
          <rect x="712" y="657.5" width="24" height="3" rx="1.5" fill="#1f1834" />
          <circle cx="736" cy="659" r="1" fill={CREAM} opacity="0.3" />
        </g>
        <g transform="rotate(21 724 659)">
          <rect x="712" y="657.5" width="24" height="3" rx="1.5" fill="#1f1834" />
          <circle cx="712" cy="659" r="1" fill={CREAM} opacity="0.3" />
        </g>
        <g className="animate-twinkle [animation-delay:-1.2s]">
          <g transform="translate(724 662)">
            <path d="M0 0 Q-12 -16 0 -32 Q5 -22 8 -28 Q14 -14 4 0 Z" fill={CREAM} opacity="0.75" />
            <path d="M-2 0 Q-7 -10 -1 -18 Q2 -12 4 -14 Q6 -6 1 0 Z" fill={MINT} opacity="0.8" transform="translate(0.5 1)" />
          </g>
        </g>
      </g>
      <RidgePines />
      <TreelineBand />
      <Ground />
      <ellipse cx="724" cy="690" rx="200" ry="26" fill={CREAM} opacity="0.07" />
      {/* the fire ring: tellers and listeners, one mid-story */}
      <SceneMascot x={606} ground={714} size={9} mood="peek" color={VIOLET} tilt={-5} />
      <SceneMascot x={662} ground={706} size={9} mood="happy" color={MINT} />
      <SceneMascot x={812} ground={700} size={10} mood="happy" color={CORAL} tilt={4} />
      <SceneMascot x={752} ground={666} size={11} mood="cheer" color={INDIGO} bob="-2.8s" />
      <Bush x={540} y={702} s={0.85} />
      <Bush x={944} y={662} />
      <Dog x={866} y={716} pose="curled" />
      <FramePines />
    </>
  );
}

/** Scene 4 — progress: dawn over the summit, milestones planted. */
function ProgressScene() {
  return (
    <>
      <ellipse cx="300" cy="470" rx="420" ry="140" fill="#e2578a" opacity="0.09" />
      <ellipse cx="1180" cy="430" rx="380" ry="130" fill="#8b7ff7" opacity="0.07" />
      <path d="M1130 120 A26 26 0 1 0 1152 168 A20 20 0 1 1 1130 120 Z" fill={CREAM} opacity="0.75" />
      {/* early birds drift across the dawn */}
      <g stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.3">
        <path d="M415 198 Q417.8 194.6 420 198 Q422.2 194.6 425 198" />
        <path d="M462 224 Q464.8 220.6 467 224 Q469.2 220.6 472 224" />
        <path d="M396 246 Q398.8 242.6 401 246 Q403.2 242.6 406 246" />
      </g>
      <SecondRange dorm />
      <MainRidge />
      <SchoolCluster />
      <g>
        <line x1="392" y1="560" x2="1060" y2="536" stroke={CREAM} strokeWidth="1" opacity="0.22" />
        {(
          [
            [470, 552, MINT],
            [560, 548, VIOLET],
            [652, 545, CREAM],
            [750, 542, VIOLET],
            [848, 540, MINT],
            [944, 538, VIOLET],
          ] as ReadonlyArray<readonly [number, number, string]>
        ).map(([px, py, c], i) => (
          <g key={i}>
            <circle cx={px} cy={py} r="1.3" fill={CREAM} opacity="0.5" />
            <path
              d={`M${px} ${py} L${px} ${py + 15} L${px + 12} ${py + 7} Z`}
              fill={c}
              opacity="0.85"
              className="animate-twinkle"
              style={{ animationDelay: `-${(i % 5) * 1.4}s` }}
            />
          </g>
        ))}
      </g>
      <RidgePines />
      <TreelineBand />
      <Ground />
      <ellipse cx="720" cy="682" rx="220" ry="28" fill="#e2d9ff" opacity="0.07" />
      {/* the summit has been reached: one planted the pennant, two cheer, one arrives */}
      <path d="M752 444 L752 430 L768 434 L752 439 Z" fill={MINT} />
      <line x1="751" y1="444" x2="751" y2="426" stroke={PLINTH} strokeWidth="2" />
      <SceneMascot x={732} ground={448} size={9} mood="cheer" color={INDIGO} bob="-2s" />
      <SceneMascot x={664} ground={698} size={10} mood="wink" color={MINT} bob="-1.2s" />
      <SceneMascot x={806} ground={690} size={10} mood="happy" color={CORAL} />
      <SceneMascot x={604} ground={710} size={9} mood="peek" color={LILAC} tilt={-4} />
      <Dog x={868} y={702} />
      <FramePines />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* the component                                                       */
/* ------------------------------------------------------------------ */

const GLOW_TINT: Record<Scene, { cx: number; color: string; opacity: number }> = {
  circle: { cx: 735, color: "#6f5ffb", opacity: 0.18 },
  chords: { cx: 738, color: "#5fd7b4", opacity: 0.12 },
  points: { cx: 724, color: "#ffd9a8", opacity: 0.1 },
  progress: { cx: 760, color: "#c78df5", opacity: 0.13 },
};

export function CampusHorizon({ scene = "circle" }: { scene?: Scene }) {
  const glow = GLOW_TINT[scene];
  return (
    <div key={scene} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 animate-fade-up">
      <svg viewBox="0 0 1440 720" preserveAspectRatio="xMidYMax slice" className="block h-full w-full">
        <defs>
          <radialGradient id="campus-glow" gradientUnits="userSpaceOnUse" cx={glow.cx} cy="470" r="380">
            <stop offset="0%" stopColor={glow.color} stopOpacity={glow.opacity} />
            <stop offset="55%" stopColor="#3a4e96" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#3a4e96" stopOpacity="0" />
          </radialGradient>
          <filter id="campus-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        <ellipse cx={glow.cx} cy="480" rx="400" ry="200" fill="url(#campus-glow)" />

        {/* stars — richest on the first three nights, sparse at dawn */}
        <g fill="#b7aaff">
          {scene !== "progress" ? (
            <>
              <circle cx="210" cy="120" r="1.6" opacity="0.5" className="animate-twinkle" />
              <circle cx="430" cy="90" r="1.3" opacity="0.4" />
              <circle cx="620" cy="200" r="1.2" opacity="0.35" />
              <circle cx="1050" cy="70" r="1.2" opacity="0.4" />
            </>
          ) : (
            <circle cx="970" cy="80" r="1.3" opacity="0.35" />
          )}
          <circle cx={scene === "progress" ? 300 : 970} cy="110" r="1.5" opacity="0.5" className="animate-twinkle [animation-delay:-3s]" />
          <circle cx={scene === "progress" ? 760 : 1230} cy={scene === "progress" ? 200 : 150} r="1.7" opacity="0.45" />
        </g>

        <FarRange />
        <Mist />
        {scene === "circle" && <CircleScene />}
        {scene === "chords" && <ChordsScene />}
        {scene === "points" && <PointsScene />}
        {scene === "progress" && <ProgressScene />}

        <rect width="1440" height="720" filter="url(#campus-grain)" opacity="0.08" />
      </svg>
    </div>
  );
}
