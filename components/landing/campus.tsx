import type { ReactNode } from "react";

/**
 * THE page background — and each slide gets its own evening:
 *
 *   circle   the lit schoolhouse, trail and the study walk (the canonical night)
 *   chords   an open pavilion with string lights, pennants, readers beneath
 *   points   a fire ring: tents in an arc, the storyteller, three seated friends
 *   progress dawn over the summit: moon, banner run, milestone flags, cheering
 *
 * One shared ridge skeleton (far ranges, mist, treeline, ground, grain) keeps
 * the four scenes reading as one world; the centerpiece band, glow tint and sky
 * change per scene. Every character is drawn from the same parametric anatomy
 * (head with ears, blinking eyes, scarf and backpack gear, stride poses) so the
 * cast is consistent — no ad-hoc stick figures anywhere.
 *
 * Fixed to the viewport, layered above the night gradient, below the grain and
 * every panel; pointer-transparent throughout.
 */

type Scene = "circle" | "chords" | "points" | "progress";

/* ------------------------------------------------------------------ */
/* characters                                                          */
/* ------------------------------------------------------------------ */

const INK = "#07060c";
const INK_LIT = "#0b0817";
const CREAM = "#f4f2e8";
const MINT = "#22a58a";
const VIOLET = "#b7aaff";

/** A round head with ears, face turned toward the walk direction. */
function Head({ lit = INK_LIT }: { lit?: string }) {
  return (
    <g fill={lit}>
      <circle cx="0" cy="-39.5" r="5.6" />
      <circle cx="-4.4" cy="-44.4" r="2.1" />
      <circle cx="4.4" cy="-44.4" r="2.1" />
      <g transform="translate(0.9 -40)">
        <g className="animate-blink" fill={CREAM}>
          <circle cx="1.6" cy="0" r="1.05" />
          <circle cx="4.4" cy="0" r="1.05" />
        </g>
      </g>
    </g>
  );
}

function Scarf({ gear }: { gear: string }) {
  return <rect x="-4.2" y="-34.2" width="9" height="3.4" rx="1.7" fill={gear} />;
}

function Backpack({ gear }: { gear: string }) {
  return <rect x="-12" y="-31.5" width="9" height="11.5" rx="3.4" fill={gear} />;
}

/** Mid-stride walker: same anatomy every time, gear colors vary. Origin = feet. */
function Walker({
  x,
  y,
  gear = MINT,
  flip = false,
  delay = 0,
  lit = INK_LIT,
  item,
}: {
  x: number;
  y: number;
  gear?: string;
  flip?: boolean;
  delay?: number;
  lit?: string;
  item?: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y}) ${flip ? "scale(-1 1)" : ""}`}>
      {/* far-side leg + arm, tucked behind the torso */}
      <line x1="-0.5" y1="-16" x2="-6" y2="1.2" stroke={lit} strokeWidth="3.4" strokeLinecap="round" />
      <line x1="-1.5" y1="-29" x2="-5.5" y2="-22.5" stroke={lit} strokeWidth="2.6" strokeLinecap="round" />
      <Backpack gear={gear} />
      {/* near-side leg, mid-stride */}
      <line x1="1" y1="-16" x2="6.5" y2="0" stroke={lit} strokeWidth="3.4" strokeLinecap="round" />
      {/* torso, head, gear */}
      <rect x="-6.3" y="-33" width="13.4" height="17.5" rx="6.6" fill={lit} />
      <Scarf gear={gear} />
      <Head lit={lit} />
      {/* near-side arm + held item */}
      <line x1="2" y1="-29.5" x2="5.8" y2="-22.8" stroke={lit} strokeWidth="2.6" strokeLinecap="round" />
      {item}
    </g>
  );
}

/** Standing, cheering or pointing — planted feet, no stride. */
function StandingFigure({
  x,
  y,
  pose = "down",
  gear = VIOLET,
  flip = false,
  delay = 0,
  lit = INK_LIT,
}: {
  x: number;
  y: number;
  pose?: "down" | "cheer" | "point";
  gear?: string;
  flip?: boolean;
  delay?: number;
  lit?: string;
}) {
  const arms =
    pose === "cheer" ? (
      <>
        <line x1="-2.5" y1="-29" x2="-7.5" y2="-40" stroke={lit} strokeWidth="2.6" strokeLinecap="round" />
        <line x1="2.5" y1="-29" x2="7.5" y2="-40" stroke={lit} strokeWidth="2.6" strokeLinecap="round" />
      </>
    ) : pose === "point" ? (
      <>
        <line x1="-2" y1="-29" x2="-5.5" y2="-22" stroke={lit} strokeWidth="2.6" strokeLinecap="round" />
        <line x1="2" y1="-29" x2="8.5" y2="-34" stroke={lit} strokeWidth="2.6" strokeLinecap="round" />
      </>
    ) : (
      <>
        <line x1="-2.5" y1="-29" x2="-5.5" y2="-21" stroke={lit} strokeWidth="2.6" strokeLinecap="round" />
        <line x1="2.5" y1="-29" x2="5.5" y2="-21" stroke={lit} strokeWidth="2.6" strokeLinecap="round" />
      </>
    );
  return (
    <g transform={`translate(${x} ${y}) ${flip ? "scale(-1 1)" : ""}`} className="animate-bob" style={{ animationDelay: `${delay}s` }}>
      <line x1="-2.8" y1="-16" x2="-2.8" y2="0" stroke={lit} strokeWidth="3.4" strokeLinecap="round" />
      <line x1="2.8" y1="-16" x2="2.8" y2="0" stroke={lit} strokeWidth="3.4" strokeLinecap="round" />
      <Backpack gear={gear} />
      <rect x="-6.3" y="-33" width="13.4" height="17.5" rx="6.6" fill={lit} />
      <Scarf gear={gear} />
      <Head lit={lit} />
      {arms}
    </g>
  );
}

/** Seated by the fire, legs folded under, face tilted up. */
function SeatedFigure({ x, y, gear = MINT, lit = INK_LIT }: { x: number; y: number; gear?: string; lit?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-7 0 Q0 -7.5 7 0 Z" fill={lit} />
      <rect x="-5.8" y="-27.5" width="12" height="15.5" rx="6" fill={lit} />
      <Scarf gear={gear} />
      <g fill={lit}>
        <circle cx="0" cy="-33.5" r="5.4" />
        <circle cx="-4.3" cy="-38.2" r="2" />
        <circle cx="4.3" cy="-38.2" r="2" />
      </g>
      <g transform="translate(0.9 -34)" className="animate-blink" fill={CREAM}>
        <circle cx="1.3" cy="0" r="1" />
        <circle cx="3.9" cy="0" r="1" />
      </g>
      <line x1="4.5" y1="-24" x2="8.5" y2="-19" stroke={lit} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/** The dog, walking or curled. */
function Dog({
  x,
  y,
  pose = "walk",
  flip = false,
}: {
  x: number;
  y: number;
  pose?: "walk" | "curled";
  flip?: boolean;
}) {
  if (pose === "curled") {
    return (
      <g transform={`translate(${x} ${y}) ${flip ? "scale(-1 1)" : ""}`}>
        <path d="M-9 0 Q-10 -7.5 0 -8.5 Q9 -8 9.5 0 Z" fill={INK} />
        <circle cx="6.8" cy="-6.4" r="3.9" fill={INK} />
        <circle cx="5" cy="-9.6" r="1.5" fill={INK} />
        <circle cx="4.4" cy="-6" r="0.9" fill={CREAM} className="animate-blink" />
        <path d="M-9 0 Q-12.5 -3 -11 -6.5" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) ${flip ? "scale(-1 1)" : ""}`}>
      <rect x="-9" y="-9" width="17.5" height="8.4" rx="4.2" fill={INK} />
      <line x1="-5.5" y1="-1.5" x2="-5.5" y2="0.5" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="-1.5" y1="-1.5" x2="-1.5" y2="1" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="2.5" y1="-1.5" x2="2.5" y2="1" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="6" y1="-1.5" x2="6" y2="0.5" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M6 -7.5 Q10.5 -8.5 11.5 -4.5" stroke={INK} strokeWidth="4.4" strokeLinecap="round" fill="none" />
      <circle cx="11.5" cy="-11.5" r="4.1" fill={INK} />
      <circle cx="9.2" cy="-14.8" r="1.7" fill={INK} />
      <circle cx="12.6" cy="-10.9" r="0.95" fill={CREAM} className="animate-blink" />
      <path d="M-8.5 -8.5 Q-12.5 -12 -11 -16" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
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
      <path
        d="M700 545 Q820 420 920 380 Q1030 340 1120 410 Q1300 520 1440 470 L1440 620 L-60 620 Z"
        fill="#221d47"
      />
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
          <g fill="#191430">
            <rect x="1030" y="488" width="132" height="76" rx="2" />
            <path d="M1202 566 L1202 488 L1096 444 L1040 488 L1022 488 L1022 566 Z" />
            <rect x="1080" y="420" width="10" height="30" />
          </g>
          <path d="M1022 489 L1096 445 L1180 492" stroke="#8b7ff7" strokeWidth="1.8" strokeLinecap="round" opacity="0.3" fill="none" />
          <g fill={CREAM}>
            <rect x="1049" y="510" width="12" height="15" rx="2" opacity="0.5" />
            <rect x="1077" y="510" width="12" height="15" rx="2" opacity="0.34" />
            <rect x="1133" y="510" width="12" height="15" rx="2" opacity="0.5" />
            <rect x="1161" y="510" width="12" height="15" rx="2" opacity="0.3" />
            <rect x="1049" y="540" width="12" height="15" rx="2" opacity="0.3" />
            <rect x="1133" y="540" width="12" height="15" rx="2" opacity="0.42" className="animate-twinkle [animation-delay:-1.8s]" />
          </g>
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

function SchoolCluster() {
  return (
    <g>
      <g fill="#1c1734">
        <rect x="486" y="628" width="84" height="36" />
        <path d="M478 630 L528 608 L578 630 Z" />
        <rect x="612" y="546" width="252" height="114" />
        <path d="M588 548 L738 498 L888 548 Z" />
        <rect x="864" y="586" width="66" height="74" />
        <path d="M858 588 L897 568 L936 588 Z" />
        <rect x="910" y="556" width="12" height="26" />
        <rect x="706" y="480" width="56" height="180" />
        <path d="M698 482 L734 448 L770 482 Z" />
      </g>
      <g stroke={VIOLET} strokeLinecap="round" fill="none" opacity="0.34" strokeWidth="2">
        <path d="M592 546 L738 500 L884 546" />
        <path d="M706 480 L734 450 L762 480" />
      </g>
      <g stroke={VIOLET} strokeLinecap="round" fill="none" opacity="0.26" strokeWidth="1.8">
        <path d="M478 629 L528 609 L578 629" />
        <path d="M858 587 L897 569 L936 587" />
      </g>
      <line x1="734" y1="448" x2="734" y2="416" stroke="#1c1734" strokeWidth="3.2" />
      <path d="M736 416 L760 423 L736 431 Z" fill={VIOLET} />
      <g fill={CREAM} opacity="0.55">
        <rect x="652" y="590" width="14" height="18" rx="2.5" />
        <rect x="686" y="590" width="14" height="18" rx="2.5" />
        <rect x="766" y="590" width="14" height="18" rx="2.5" />
        <rect x="800" y="590" width="14" height="18" rx="2.5" />
        <rect x="652" y="632" width="14" height="18" rx="2.5" />
        <rect x="686" y="632" width="14" height="18" rx="2.5" />
        <rect x="766" y="632" width="14" height="18" rx="2.5" />
        <rect x="800" y="632" width="14" height="18" rx="2.5" />
      </g>
      <rect x="720" y="590" width="14" height="18" rx="2.5" fill={MINT} className="animate-twinkle [animation-delay:-2.5s]" />
      <rect x="720" y="632" width="14" height="18" rx="2.5" fill={CREAM} opacity="0.4" />
      <path d="M726 660 L726 640 Q733 634 740 640 L740 660 Z" fill="#0b0817" />
      <path d="M724 661 L724 639 Q733 631 742 639 L742 661" stroke={CREAM} strokeWidth="1.4" opacity="0.35" fill="none" />
      <rect x="727" y="512" width="14" height="18" rx="4" fill={CREAM} opacity="0.5" />
      <circle cx="734" cy="556" r="12" fill={CREAM} opacity="0.92" className="animate-twinkle" />
      <line x1="734" y1="556" x2="734" y2="549" stroke="#1c1734" strokeWidth="2" strokeLinecap="round" />
      <line x1="734" y1="556" x2="740" y2="556" stroke="#1c1734" strokeWidth="2" strokeLinecap="round" />
      <circle cx="518" cy="646" r="3" fill={CREAM} opacity="0.4" />
    </g>
  );
}

function BookStack({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g fill={INK}>
        <rect x="-31" y="-24" width="62" height="12" rx="2" transform="rotate(-6)" />
        <rect x="-23" y="-12" width="78" height="13" rx="2" />
      </g>
      <rect x="-18" y="-11" width="3" height="11" fill={CREAM} opacity="0.32" />
    </g>
  );
}

function BookAt({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 46} ${y + 12} Q${x - 24} ${y} ${x} ${y + 6} Q${x + 24} ${y + 12} ${x + 46} ${y + 6} L${x + 46} ${y + 18} Q${x + 24} ${y + 24} ${x} ${y + 18} Q${x - 24} ${y + 12} ${x - 46} ${y + 24} Z`} fill={INK} />
      <line x1={x} y1={y + 6} x2={x} y2={y + 18} stroke={CREAM} strokeWidth="1.4" opacity="0.4" />
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
      <BookStack x={586} y={700} s={0.9} />
      <BookAt x={554} y={694} />
      <BookStack x={352} y={680} />
      <BookStack x={1252} y={662} s={1.05} />
      <Walker x={652} y={702} gear={MINT} delay={-0.5} />
      <Walker x={690} y={684} gear={VIOLET} delay={-1.7} />
      <Walker
        x={720}
        y={666}
        gear={CREAM}
        delay={-2.9}
        item={<rect x="6.5" y="-26" width="13" height="8" rx="1.5" fill={INK} />}
      />
      <Walker x={764} y={648} gear={MINT} delay={-3.6} />
      <Dog x={802} y={662} pose="walk" />
      <FramePines />
    </>
  );
}

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

/** Scene 2 — chords: the open pavilion, strung with lights. */
function ChordsScene() {
  return (
    <>
      <SecondRange dorm />
      <MainRidge />
      <g>
        {/* pavilion: platform, poles, wide open roof */}
        <g fill="#1c1734">
          <rect x="600" y="556" width="280" height="14" />
          <rect x="624" y="470" width="7" height="88" />
          <rect x="849" y="470" width="7" height="88" />
          <path d="M580 472 L738 424 L896 472 Z" />
          <rect x="592" y="472" width="16" height="10" />
          <rect x="866" y="472" width="18" height="10" />
        </g>
        <path d="M584 472 L738 426 L892 472" stroke={VIOLET} strokeWidth="2" strokeLinecap="round" opacity="0.32" fill="none" />
        {/* pennants strung under the roof edge */}
        <path d="M596 484 Q738 502 880 484" stroke={CREAM} strokeWidth="1" opacity="0.22" fill="none" />
        <path d="M636 490 L636 506 L648 498 Z" fill={VIOLET} />
        <path d="M700 495 L700 511 L712 503 Z" fill={MINT} />
        <path d="M764 495 L764 511 L776 503 Z" fill={VIOLET} />
        <path d="M824 490 L824 506 L836 502 Z" fill={MINT} />
        {/* string lights: the chord itself, hung between the poles */}
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
        {/* lamplight pool on the platform */}
        <ellipse cx="738" cy="610" rx="200" ry="26" fill="#8b7ff7" opacity="0.07" />
      </g>
      {/* a second, smaller kiosk on the left */}
      <g fill="#1c1734">
        <rect x="470" y="616" width="74" height="48" />
        <path d="M462 618 L507 592 L552 618 Z" />
      </g>
      <path d="M464 617 L507 594 L548 616" stroke={VIOLET} strokeWidth="1.8" strokeLinecap="round" opacity="0.3" fill="none" />
      <rect x="484" y="632" width="11" height="14" rx="2" fill={CREAM} opacity="0.42" className="animate-twinkle [animation-delay:-2s]" />
      <RidgePines />
      <TreelineBand />
      <Ground />
      <ellipse cx="700" cy="682" rx="180" ry="24" fill="#8b7ff7" opacity="0.07" />
      {/* readers and a wanderer beneath the strings */}
      <Walker x={592} y={706} gear={VIOLET} flip delay={-1.1} />
      <g>
        {/* seated reader with an open book */}
        <SeatedFigure x={708} y={700} gear={CREAM} />
        <path d="M672 690 Q684 682 698 687 Q712 692 724 687 L724 695 Q712 700 698 695 Q684 690 672 702 Z" transform="translate(24 24) scale(0.62)" fill={CREAM} opacity="0.85" />
      </g>
      <StandingFigure x={776} y={692} pose="point" gear={MINT} delay={-2.4} />
      <Dog x={838} y={700} pose="curled" />
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
        {/* five tents in a loose arc */}
        {[
          [572, 630],
          [636, 612],
          [708, 602],
          [788, 606],
          [862, 622],
        ].map(([tx, ty], i) => (
          <g key={i} fill="#1c1734">
            <path d={`M${tx - 30} ${ty + 34} L${tx} ${ty} L${tx + 30} ${ty + 34} Z`} />
            <rect x={tx - 4} y={ty + 14} width="8" height="20" rx="3" fill={CREAM} opacity="0.18" />
          </g>
        ))}
        {/* the fire on its stone ring */}
        <ellipse cx="724" cy="668" rx="120" ry="20" fill="#8b7ff7" opacity="0.05" />
        <circle cx="724" cy="652" r="56" fill={CREAM} opacity="0.05" />
        <circle cx="724" cy="654" r="30" fill={CREAM} opacity="0.07" />
        <g>
          {[-14, -7, 0, 7, 14].map((dx, i) => (
            <circle key={i} cx={724 + dx} cy={660 + (i % 2 ? 2 : 0)} r={2.4} fill={INK_LIT} />
          ))}
        </g>
        <g className="animate-twinkle [animation-delay:-1.2s]">
          <path d="M724 662 Q712 646 724 630 Q729 640 732 634 Q738 648 728 660 Z" fill={CREAM} opacity="0.75" />
          <path d="M722 660 Q717 650 723 642 Q726 648 728 646 Q730 654 725 659 Z" fill={MINT} opacity="0.8" />
        </g>
      </g>
      <RidgePines />
      <TreelineBand />
      <Ground />
      <ellipse cx="724" cy="690" rx="200" ry="26" fill={CREAM} opacity="0.07" />
      {/* three friends seated around the fire, one telling the story */}
      <SeatedFigure x={640} y={706} gear={MINT} />
      <SeatedFigure x={812} y={702} gear={CREAM} />
      <Dog x={856} y={712} pose="curled" />
      <StandingFigure x={748} y={676} pose="cheer" gear={VIOLET} delay={-2.8} />
      <SeatedFigure x={588} y={712} gear={VIOLET} />
      <FramePines />
    </>
  );
}

/** Scene 4 — progress: dawn over the summit, milestones planted. */
function ProgressScene() {
  return (
    <>
      {/* dawn wash + crescent moon */}
      <ellipse cx="300" cy="470" rx="420" ry="140" fill="#e2578a" opacity="0.09" />
      <ellipse cx="1180" cy="430" rx="380" ry="130" fill="#8b7ff7" opacity="0.07" />
      <path d="M1130 120 A26 26 0 1 0 1152 168 A20 20 0 1 1 1130 120 Z" fill={CREAM} opacity="0.75" />
      <SecondRange dorm />
      <MainRidge />
      <SchoolCluster />
      {/* the banner run: a rope of milestone pennants between the summits */}
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
          <path
            key={i}
            d={`M${px} ${py} L${px} ${py + 15} L${px + 12} ${py + 7} Z`}
            fill={c}
            opacity="0.85"
            className="animate-twinkle"
            style={{ animationDelay: `-${(i % 5) * 1.4}s` }}
          />
        ))}
      </g>
      <RidgePines />
      <TreelineBand />
      <Ground />
      <ellipse cx="720" cy="682" rx="220" ry="28" fill="#e2d9ff" opacity="0.07" />
      {/* the cast at the top: one planted the pennant on the tower, two cheer, one arrives */}
      <Walker x={600} y={706} gear={MINT} delay={-2.2} />
      <StandingFigure x={664} y={694} pose="cheer" gear={VIOLET} delay={-1.4} />
      <StandingFigure x={806} y={688} pose="cheer" gear={CREAM} delay={-3.1} />
      <g transform="translate(734 448)">
        {/* the summit mascot with a planted pennant */}
        <g className="animate-bob" style={{ animationDelay: "-2s" }}>
          <line x1="-2.8" y1="-16" x2="-2.8" y2="0" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
          <line x1="2.8" y1="-16" x2="2.8" y2="0" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
          <rect x="-6" y="-31" width="12.6" height="16.5" rx="6.2" fill={INK} />
          <rect x="-8.4" y="-29" width="8.4" height="10.5" rx="3.2" fill={MINT} />
          <line x1="-2.4" y1="-29.5" x2="-7" y2="-21" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
          <line x1="2.6" y1="-29.5" x2="8.2" y2="-36" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
          <line x1="8.2" y1="-36" x2="8.2" y2="-46" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M9.4 -46 L22 -41 L9.4 -37 Z" fill={MINT} />
          <circle cx="0.6" cy="-36.5" r="5.3" fill={INK} />
          <circle cx="-3.6" cy="-41" r="2" fill={INK} />
          <circle cx="4.4" cy="-41" r="2" fill={INK} />
          <g transform="translate(1.4 -37)" className="animate-blink" fill={CREAM}>
            <circle cx="1.4" cy="0" r="0.95" />
            <circle cx="4" cy="0" r="0.95" />
          </g>
        </g>
      </g>
      <Dog x={866} y={704} pose="walk" />
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
