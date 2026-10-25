/**
 * THE page background, on every slide: the campus at night as a full-viewport
 * wallpaper — fixed to the window so the panels scroll across it, like a
 * landscape illustration behind frosted glass. Composed bottom-anchored so
 * the scene always meets the ground:
 *
 * - four depth layers in tight atmospheric steps: a curved far range, a
 *   steeper second range, the main ridge carrying the school, and the
 *   footer-dark ground;
 * - the schoolhouse cluster is complete architecture: hall with two rows of
 *   lit rectangular windows, a wing and a barn, and the tall clock tower
 *   with its pennant — every roofline carrying a thin lit edge;
 * - mist rests between the ranges; a light pool lifts the near trail, where
 *   four students and their dog climb past stacks of books toward the door;
 * - the told details stay inside the center band so the xMidYMax slice keeps
 *   them on phones.
 *
 * Pure inline SVG; the layer above the page content never captures a pointer.
 */
export function CampusHorizon() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <svg viewBox="0 0 1440 720" preserveAspectRatio="xMidYMax slice" className="block h-full w-full">
        <defs>
          <radialGradient id="campus-glow" gradientUnits="userSpaceOnUse" cx="735" cy="470" r="380">
            <stop offset="0%" stopColor="#6f5ffb" stopOpacity="0.18" />
            <stop offset="55%" stopColor="#3a4e96" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#3a4e96" stopOpacity="0" />
          </radialGradient>
          <filter id="campus-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        {/* the horizon glow behind the whole range */}
        <ellipse cx="735" cy="480" rx="400" ry="200" fill="url(#campus-glow)" />

        {/* sparse stars */}
        <g fill="#b7aaff">
          <circle cx="210" cy="120" r="1.6" opacity="0.5" className="animate-twinkle" />
          <circle cx="430" cy="90" r="1.3" opacity="0.4" />
          <circle cx="970" cy="110" r="1.5" opacity="0.5" className="animate-twinkle [animation-delay:-3s]" />
          <circle cx="1230" cy="150" r="1.7" opacity="0.45" />
          <circle cx="620" cy="200" r="1.2" opacity="0.35" />
          <circle cx="1050" cy="70" r="1.2" opacity="0.4" />
        </g>

        {/*
         * LAYER 1 — the far range: long, curved, staggered landforms in a
         * tone close to the sky, so distance reads as haze, not as a purple
         * triangle parade. Rim light only on the two tallest near-summits,
         * drawn along the actual slope lines.
         */}
        <g>
          <path
            d="M-60 560 Q90 420 200 392 Q300 368 380 430 Q470 500 560 545"
            fill="#221d47"
          />
          <path d="M560 545 L640 460 L760 545" fill="#221d47" />
          <path
            d="M700 545 Q820 420 920 380 Q1030 340 1120 410 Q1300 520 1440 470 L1440 620 L-60 620 Z"
            fill="#221d47"
          />
          <path d="M920 382 Q1006 348 1090 402" stroke="#a5b4fc" strokeWidth="2.2" strokeLinecap="round" opacity="0.24" fill="none" />
          <path d="M300 369 Q350 372 396 402" stroke="#a5b4fc" strokeWidth="2.2" strokeLinecap="round" opacity="0.22" fill="none" />
          {/* hazier most-distant ridge, almost part of the sky */}
          <path d="M-40 480 Q260 430 560 466 Q860 500 1180 456 Q1330 440 1440 462 V640 H-40 Z" fill="#1c1840" />
        </g>

        {/* mist on the far shoulders */}
        <rect x="120" y="500" width="460" height="16" rx="8" fill="#8b7ff7" opacity="0.055" />
        <rect x="260" y="512" width="300" height="10" rx="5" fill="#8b7ff7" opacity="0.045" />
        <rect x="840" y="470" width="480" height="14" rx="7" fill="#8b7ff7" opacity="0.05" />

        {/*
         * LAYER 2 — the second range, steeper, one step darker; school-less
         * but with a dorm on its right shoulder, a flag on the left summit,
         * and pines in the saddle.
         */}
        <g>
          <path d="M-60 640 Q80 520 190 472 Q320 420 470 640 Z" fill="#1c1739" />
          <path d="M190 474 Q330 440 430 560" stroke="#8b7ff7" strokeWidth="1.8" strokeLinecap="round" opacity="0.2" fill="none" />
          <path d="M400 640 Q600 470 760 430 Q900 396 1060 560 Q1180 620 1280 640 Z" fill="#1c1739" />
          {/* left summit flag — one of the climb's milestones */}
          <line x1="190" y1="472" x2="190" y2="448" stroke="#1c1739" strokeWidth="2.6" />
          <path d="M192 448 L214 454 L192 461 Z" fill="#b7aaff" />
          {/* right summit flag */}
          <line x1="900" y1="396" x2="900" y2="372" stroke="#1c1739" strokeWidth="2.6" />
          <path d="M902 372 L924 378 L902 385 Z" fill="#22a58a" />

          {/* the dorm on the right shoulder: full building, reliably lit */}
          <g fill="#191430">
            <rect x="1030" y="488" width="132" height="76" rx="2" />
            <path d="M1202 566 L1202 488 L1096 444 L1040 488 L1022 488 L1022 566 Z" />
            <rect x="1080" y="420" width="10" height="30" />
          </g>
          <path d="M1022 489 L1096 445 L1180 492" stroke="#8b7ff7" strokeWidth="1.8" strokeLinecap="round" opacity="0.3" fill="none" />
          <g fill="#f4f2e8">
            <rect x="1049" y="510" width="12" height="15" rx="2" opacity="0.5" />
            <rect x="1077" y="510" width="12" height="15" rx="2" opacity="0.34" />
            <rect x="1133" y="510" width="12" height="15" rx="2" opacity="0.5" />
            <rect x="1161" y="510" width="12" height="15" rx="2" opacity="0.3" />
            <rect x="1049" y="540" width="12" height="15" rx="2" opacity="0.3" />
            <rect x="1133" y="540" width="12" height="15" rx="2" opacity="0.42" className="animate-twinkle [animation-delay:-1.8s]" />
          </g>
        </g>

        {/*
         * LAYER 3 — the main ridge, flat enough to build on, and the school
         * cluster: hall + wing + barn + clock tower. Buildings draw after the
         * ridge so strokes never dissolve into it.
         */}
        <path d="M0 600 Q220 584 420 592 Q560 596 640 586 Q760 570 900 580 Q1140 592 1440 566 V720 H0 Z" fill="#1c1734" />

        <g fill="#1c1734">
          {/* barn, left */}
          <rect x="486" y="628" width="84" height="36" />
          <path d="M478 630 L528 608 L578 630 Z" />
          {/* main hall */}
          <rect x="612" y="546" width="252" height="114" />
          <path d="M588 548 L738 498 L888 548 Z" />
          {/* right wing */}
          <rect x="864" y="586" width="66" height="74" />
          <path d="M858 588 L897 568 L936 588 Z" />
          <rect x="910" y="556" width="12" height="26" />
          {/* clock tower */}
          <rect x="706" y="480" width="56" height="180" />
          <path d="M698 482 L734 448 L770 482 Z" />
        </g>

        {/* lit edges on every roof — architecture, not silhouette mush */}
        <g stroke="#b7aaff" strokeLinecap="round" fill="none" opacity="0.34" strokeWidth="2">
          <path d="M592 546 L738 500 L884 546" />
          <path d="M706 480 L734 450 L762 480" />
        </g>
        <g stroke="#b7aaff" strokeLinecap="round" fill="none" opacity="0.26" strokeWidth="1.8">
          <path d="M478 629 L528 609 L578 629" />
          <path d="M858 587 L897 569 L936 587" />
        </g>

        {/* tower mast + pennant */}
        <line x1="734" y1="448" x2="734" y2="416" stroke="#1c1734" strokeWidth="3.2" />
        <path d="M736 416 L760 423 L736 431 Z" fill="#b7aaff" />

        {/* the lit school: rows of real windows */}
        <g fill="#f4f2e8" opacity="0.55">
          <rect x="652" y="590" width="14" height="18" rx="2.5" />
          <rect x="686" y="590" width="14" height="18" rx="2.5" />
          <rect x="766" y="590" width="14" height="18" rx="2.5" />
          <rect x="800" y="590" width="14" height="18" rx="2.5" />
          <rect x="652" y="632" width="14" height="18" rx="2.5" />
          <rect x="686" y="632" width="14" height="18" rx="2.5" />
          <rect x="766" y="632" width="14" height="18" rx="2.5" />
          <rect x="800" y="632" width="14" height="18" rx="2.5" />
        </g>
        <rect x="720" y="590" width="14" height="18" rx="2.5" fill="#22a58a" className="animate-twinkle [animation-delay:-2.5s]" />
        <rect x="720" y="632" width="14" height="18" rx="2.5" fill="#f4f2e8" opacity="0.4" />
        {/* the arched front door, open for the evening session */}
        <path d="M726 660 L726 640 Q733 634 740 640 L740 660 Z" fill="#0b0817" />
        <path d="M724 661 L724 639 Q733 631 742 639 L742 661" stroke="#f4f2e8" strokeWidth="1.4" opacity="0.35" fill="none" />
        {/* tower window + the clock */}
        <rect x="727" y="512" width="14" height="18" rx="4" fill="#f4f2e8" opacity="0.5" />
        <circle cx="734" cy="556" r="12" fill="#f4f2e8" opacity="0.92" className="animate-twinkle" />
        <line x1="734" y1="556" x2="734" y2="549" stroke="#1c1734" strokeWidth="2" strokeLinecap="round" />
        <line x1="734" y1="556" x2="740" y2="556" stroke="#1c1734" strokeWidth="2" strokeLinecap="round" />
        {/* the barn's one lamp */}
        <circle cx="518" cy="646" r="3" fill="#f4f2e8" opacity="0.4" />

        {/* pines along the main ridge */}
        <g fill="#1c1734">
          <path d="M436 612 L448 652 L422 652 Z" />
          <path d="M462 604 L474 652 L450 652 Z" />
          <path d="M952 606 L965 656 L939 656 Z" />
          <path d="M982 598 L996 654 L968 654 Z" />
          <path d="M1010 608 L1021 650 L999 650 Z" />
        </g>

        {/*
         * LAYER 3.5 — a recessed treeline band between ridge and ground so
         * the eye gets one more step of distance before the foreground.
         */}
        <path d="M0 660 Q240 646 480 654 Q760 664 1000 652 Q1240 644 1440 650 V720 H0 Z" fill="#171226" />
        <g fill="#171226">
          <path d="M248 646 L262 694 L232 694 Z" />
          <path d="M286 638 L302 694 L270 694 Z" />
          <path d="M322 646 L334 692 L308 692 Z" />
          <path d="M1104 646 L1118 694 L1090 694 Z" />
          <path d="M1142 638 L1158 694 L1126 694 Z" />
        </g>

        {/*
         * LAYER 4 — near ground. Footer color, a light pool around the
         * trail so the climbers stay legible, book stacks with page edges,
         * and the tallest pines at the frame edges.
         */}
        <path d="M0 690 Q200 678 420 686 Q640 694 860 682 Q1160 672 1440 684 V720 H0 Z" fill="#0f0d15" />

        {/* light pool around the trailhead */}
        <ellipse cx="700" cy="672" rx="230" ry="30" fill="#8b7ff7" opacity="0.08" />

        {/* the trail */}
        <path d="M580 712 Q636 690 664 678 Q706 660 726 648" stroke="#1a1626" strokeWidth="7" strokeLinecap="round" fill="none" />

        {/* books at the trailhead (center-safe), plus flanking stacks */}
        <g fill="#07060c">
          <rect x="548" y="676" width="62" height="12" rx="2" transform="rotate(-6 578 682)" />
          <rect x="556" y="688" width="78" height="13" rx="2" />
          {/* the open book */}
          <path d="M508 700 Q530 688 554 694 Q578 700 600 694 L600 706 Q578 712 554 706 Q530 700 508 712 Z" />
        </g>
        <line x1="554" y1="694" x2="554" y2="706" stroke="#f4f2e8" strokeWidth="1.4" opacity="0.4" />
        <g fill="#07060c">
          <rect x="308" y="662" width="58" height="12" rx="2" transform="rotate(6 338 668)" />
          <rect x="304" y="674" width="80" height="13" rx="2" />
          <rect x="1218" y="648" width="66" height="12" rx="2" transform="rotate(5 1251 654)" />
          <rect x="1214" y="660" width="88" height="13" rx="2" />
        </g>
        <g fill="#f4f2e8" opacity="0.32">
          <rect x="560" y="689" width="3" height="11" />
          <rect x="554" y="702" width="3" height="10" />
          <rect x="1218" y="661" width="3" height="11" />
          <rect x="308" y="675" width="3" height="11" />
        </g>

        {/* students climbing toward the evening session */}
        <g fill="#07060c" stroke="#07060c" strokeLinecap="round">
          {/* 1st: heavy backpack, leading */}
          <line x1="648" y1="668" x2="645" y2="688" strokeWidth="4.6" />
          <line x1="645" y1="688" x2="636" y2="704" strokeWidth="3" />
          <line x1="645" y1="688" x2="656" y2="703" strokeWidth="3" />
          <line x1="649" y1="674" x2="660" y2="666" strokeWidth="2.2" />
          <circle cx="651" cy="658" r="5" stroke="none" />
          <rect x="633" y="664" width="11" height="14" rx="3" stroke="none" />
          {/* 2nd: mid-stride */}
          <line x1="688" y1="660" x2="685" y2="679" strokeWidth="4.6" />
          <line x1="685" y1="679" x2="676" y2="695" strokeWidth="3" />
          <line x1="685" y1="679" x2="696" y2="694" strokeWidth="3" />
          <line x1="689" y1="666" x2="700" y2="659" strokeWidth="2.2" />
          <circle cx="691" cy="650" r="5" stroke="none" />
          <rect x="673" y="655" width="11" height="14" rx="3" stroke="none" />
          {/* 3rd: carrying a book */}
          <line x1="716" y1="646" x2="713" y2="665" strokeWidth="4.6" />
          <line x1="713" y1="665" x2="704" y2="681" strokeWidth="3" />
          <line x1="713" y1="665" x2="724" y2="680" strokeWidth="3" />
          <line x1="717" y1="652" x2="728" y2="645" strokeWidth="2.2" />
          <circle cx="719" cy="636" r="5" stroke="none" />
          <rect x="703" y="641" width="11" height="14" rx="3" stroke="none" />
          <rect x="726" y="651" width="14" height="8" rx="1.5" stroke="none" />
          {/* 4th: tallest, looking up at the tower */}
          <line x1="762" y1="628" x2="758" y2="648" strokeWidth="4.6" />
          <line x1="758" y1="648" x2="750" y2="664" strokeWidth="3" />
          <line x1="758" y1="648" x2="769" y2="663" strokeWidth="3" />
          <circle cx="761" cy="618" r="5.1" stroke="none" />
        </g>
        {/* the dog, bringing up the rear */}
        <g fill="#07060c" stroke="#07060c">
          <path d="M788 656 Q798 647 808 655 L808 661 L788 661 Z" strokeWidth="0" />
          <line x1="786" y1="654" x2="780" y2="648" strokeWidth="2.8" />
          <line x1="791" y1="661" x2="791" y2="668" strokeWidth="2.2" />
          <line x1="805" y1="661" x2="805" y2="668" strokeWidth="2.2" />
          <circle cx="810" cy="651" r="3.6" strokeWidth="0" />
        </g>

        {/* foreground pines, blackest and largest, at the frame edges */}
        <g fill="#07060c">
          <path d="M1310 664 L1334 720 L1286 720 Z" />
          <path d="M1360 690 L1378 720 L1342 720 Z" />
          <path d="M1404 668 L1424 720 L1384 720 Z" />
          <path d="M120 690 L138 720 L102 720 Z" />
          <path d="M64 674 L84 720 L44 720 Z" />
        </g>

        {/* film grain over the scene */}
        <rect width="1440" height="720" filter="url(#campus-grain)" opacity="0.08" />
      </svg>
    </div>
  );
}
