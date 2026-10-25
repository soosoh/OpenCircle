/**
 * The finale, on every slide: the campus at night, built like a real
 * landscape illustration — four depth layers with atmospheric lightness
 * (far ridges palest and hazier, near ground darkest), moonlit rim light
 * on the tall summits, pennant flags on the peaks, pine clusters at a
 * range of scales, and mist resting between the layers. The schoolhouse
 * with its clock tower is the centerpiece; stacks of books and a short
 * line of students (with their dog) climb the near trail toward it. The
 * near ground is the exact page footer color, so the campus becomes the
 * ground the page stands on. Pure inline SVG — crisp at any width.
 */
export function CampusHorizon() {
  return (
    <div aria-hidden="true" className="-mx-3 -mb-10 mt-1 sm:-mx-5">
      <svg viewBox="0 0 1440 480" preserveAspectRatio="xMidYMax slice" className="block h-80 w-full sm:h-[460px]">
        <defs>
          {/* the indigo horizon glow sitting behind the whole range */}
          <radialGradient id="campus-glow" gradientUnits="userSpaceOnUse" cx="735" cy="300" r="360">
            <stop offset="0%" stopColor="#6f5ffb" stopOpacity="0.20" />
            <stop offset="55%" stopColor="#3a4e96" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#3a4e96" stopOpacity="0" />
          </radialGradient>
          <filter id="campus-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        {/* glow behind everything */}
        <ellipse cx="735" cy="310" rx="380" ry="180" fill="url(#campus-glow)" />

        {/* a handful of stars above the range */}
        <g fill="#b7aaff">
          <circle cx="200" cy="70" r="1.6" opacity="0.5" className="animate-twinkle" />
          <circle cx="420" cy="50" r="1.3" opacity="0.4" />
          <circle cx="980" cy="60" r="1.5" opacity="0.5" className="animate-twinkle [animation-delay:-3s]" />
          <circle cx="1240" cy="90" r="1.7" opacity="0.45" />
          <circle cx="560" cy="105" r="1.2" opacity="0.35" />
        </g>

        {/*
         * LAYER 1 — the far range. Palest of the four layers, big and hazy,
         * with moonlit rim light along the tallest summits (the "snow caps").
         */}
        <g>
          <path d="M-60 320 L180 148 L330 226 L470 130 L610 320 Z" fill="#2c2560" />
          <path d="M470 130 L520 156 L470 164 L430 152 Z" fill="#4d46a0" opacity="0.5" />
          <path d="M470 132 L602 318" stroke="#a5b4fc" strokeWidth="2.4" strokeLinecap="round" opacity="0.3" />
          <path d="M180 150 L308 221" stroke="#a5b4fc" strokeWidth="2.4" strokeLinecap="round" opacity="0.26" />
          <path d="M560 320 L820 190 L1040 320 Z" fill="#2c2560" opacity="0.9" />
          <path d="M820 192 L1016 314" stroke="#a5b4fc" strokeWidth="2.4" strokeLinecap="round" opacity="0.24" />
          <path d="M940 320 L1150 140 L1440 320 Z" fill="#2c2560" opacity="0.95" />
          <path d="M1150 142 L1282 214 L1355 252" stroke="#7ee0c4" strokeWidth="2.4" strokeLinecap="round" opacity="0.3" />
          <path d="M1150 144 L1310 260 L1440 348 L1440 330 Z" fill="#352c68" opacity="0.8" />
          {/* haziest far ridge, almost dissolved into the sky */}
          <path d="M-40 330 Q240 260 520 306 Q700 336 940 300 Q1180 264 1440 314 V420 H-40 Z" fill="#231d4d" />
        </g>

        {/* mist resting on the far shoulders */}
        <rect x="120" y="296" width="420" height="16" rx="8" fill="#8b7ff7" opacity="0.06" />
        <rect x="220" y="302" width="300" height="10" rx="5" fill="#8b7ff7" opacity="0.05" />
        <rect x="820" y="308" width="480" height="14" rx="7" fill="#8b7ff7" opacity="0.05" />

        {/*
         * LAYER 2 — the second range: steeper, darker, with its own little
         * pine treeline in the saddle, and pennant flags on the two most
         * climbable summits (milestones on the way up).
         */}
        <g>
          <path d="M-80 400 L160 252 L340 330 L520 400 Z" fill="#241e4a" />
          <path d="M160 254 L318 330" stroke="#8b7ff7" strokeWidth="2" strokeLinecap="round" opacity="0.22" />
          {/* left summit flag */}
          <line x1="160" y1="252" x2="160" y2="228" stroke="#241e4a" strokeWidth="2.6" />
          <path d="M162 228 L184 234 L162 241 Z" fill="#b7aaff" />
          <path d="M490 400 L720 240 L980 400 Z" fill="#241e4a" />
          <path d="M720 242 L960 396" stroke="#8b7ff7" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
          {/* right summit flag */}
          <line x1="720" y1="240" x2="720" y2="216" stroke="#241e4a" strokeWidth="2.6" />
          <path d="M722 216 L744 222 L722 229 Z" fill="#22a58a" />
          {/* pines tucked into the saddle */}
          <g fill="#241e4a">
            <path d="M356 352 L366 384 L346 384 Z" />
            <path d="M380 344 L392 382 L368 382 Z" />
            <path d="M406 350 L415 384 L396 384 Z" />
          </g>
        </g>

        {/*
         * LAYER 3 — the main ridge, and on it the schoolhouse cluster:
         * the wide hall with two rooflines and rows of lit windows, side
         * wings, and the tall clock tower with its pennant.
         */}
        <path d="M0 356 Q220 344 420 352 Q560 356 640 344 Q720 332 880 340 Q1120 350 1440 322 V480 H0 Z" fill="#1c1734" />

        <g fill="#1c1734">
          {/* left barn, low */}
          <rect x="486" y="382" width="86" height="42" />
          <path d="M478 384 L529 362 L580 384 Z" />
          {/* main hall */}
          <rect x="620" y="300" width="252" height="96" />
          <path d="M596 302 L736 254 L896 302 Z" />
          <rect x="588" y="302" width="20" height="12" />
          <rect x="884" y="302" width="22" height="12" />
          {/* right wing */}
          <rect x="872" y="322" width="70" height="74" />
          <path d="M866 324 L907 306 L948 324 Z" />
          <rect x="918" y="296" width="12" height="26" />
          {/* clock tower */}
          <rect x="700" y="180" width="58" height="122" />
          <path d="M692 182 L729 148 L766 182 Z" />
          <line x1="729" y1="148" x2="729" y2="118" stroke="#1c1734" strokeWidth="3.4" />
          <path d="M731 118 L758 125 L731 133 Z" fill="#b7aaff" />
        </g>

        {/* the lit school: halos first, then warm windows, mint outliers twinkle */}
        <g fill="#f4f2e8" opacity="0.07">
          <circle cx="648" cy="322" r="9" />
          <circle cx="688" cy="322" r="9" />
          <circle cx="768" cy="322" r="9" />
          <circle cx="808" cy="322" r="9" />
          <circle cx="648" cy="362" r="9" />
          <circle cx="708" cy="362" r="9" />
          <circle cx="768" cy="362" r="9" />
          <circle cx="828" cy="362" r="9" />
        </g>
        <g fill="#f4f2e8" opacity="0.6">
          <circle cx="648" cy="322" r="3.4" />
          <circle cx="768" cy="322" r="3.4" />
          <circle cx="688" cy="362" r="3.4" />
          <circle cx="808" cy="362" r="3.4" />
        </g>
        <circle cx="688" cy="322" r="3.6" fill="#22a58a" className="animate-twinkle [animation-delay:-2.5s]" />
        <circle cx="808" cy="322" r="3.6" fill="#f4f2e8" opacity="0.5" />
        <circle cx="648" cy="362" r="3.4" fill="#f4f2e8" opacity="0.45" />
        <circle cx="768" cy="362" r="3.6" fill="#22a58a" className="animate-twinkle [animation-delay:-4.2s]" />
        {/* tower window + the clock, keeping the evening */}
        <rect x="724" y="212" width="10" height="16" rx="4" fill="#f4f2e8" opacity="0.5" />
        <circle cx="729" cy="252" r="12" fill="#f4f2e8" opacity="0.9" className="animate-twinkle" />
        <line x1="729" y1="252" x2="729" y2="245" stroke="#1c1734" strokeWidth="2" strokeLinecap="round" />
        <line x1="729" y1="252" x2="735" y2="252" stroke="#1c1734" strokeWidth="2" strokeLinecap="round" />
        {/* barn and wing windows, sparingly lit */}
        <circle cx="512" cy="398" r="3" fill="#f4f2e8" opacity="0.4" />
        <circle cx="894" cy="348" r="3" fill="#f4f2e8" opacity="0.42" />
        <circle cx="920" cy="348" r="3" fill="#f4f2e8" opacity="0.34" />

        {/* dorm on the right shoulder */}
        <g fill="#1c1734">
          <rect x="1078" y="234" width="128" height="88" />
          <path d="M1068 236 L1142 200 L1216 236 Z" />
          <rect x="1136" y="174" width="10" height="26" />
        </g>
        <g fill="#f4f2e8">
          <circle cx="1102" cy="258" r="3" opacity="0.4" />
          <circle cx="1132" cy="258" r="3" opacity="0.32" />
          <circle cx="1162" cy="258" r="3.2" opacity="0.42" className="animate-twinkle [animation-delay:-1.8s]" />
          <circle cx="1186" cy="258" r="3" opacity="0.3" />
          <circle cx="1102" cy="292" r="3" opacity="0.3" />
          <circle cx="1162" cy="292" r="3" opacity="0.4" />
        </g>

        {/* pines along the main ridge */}
        <g fill="#1c1734">
          <path d="M434 372 L446 410 L420 410 Z" />
          <path d="M462 364 L474 410 L450 410 Z" />
          <path d="M962 366 L975 412 L949 412 Z" />
          <path d="M992 358 L1006 412 L978 412 Z" />
          <path d="M1022 368 L1033 410 L1010 410 Z" />
        </g>

        {/*
         * LAYER 3.5 — a recessed band between ridge and ground, with the
         * mid-scale treeline, so the eye has one more step of distance.
         */}
        <path d="M0 420 Q240 404 480 414 Q760 424 1000 412 Q1240 402 1440 410 V480 H0 Z" fill="#171226" />
        <g fill="#171226">
          <path d="M248 404 L262 452 L232 452 Z" />
          <path d="M286 396 L302 452 L270 452 Z" />
          <path d="M322 404 L334 450 L308 450 Z" />
          <path d="M1044 402 L1058 450 L1028 450 Z" />
          <path d="M1082 394 L1098 450 L1066 450 Z" />
          <path d="M1118 404 L1131 448 L1104 448 Z" />
        </g>

        {/*
         * LAYER 4 — near ground, the exact footer color: stacks of books,
         * the trail up, the four students and their dog, and the tallest
         * pines for foreground scale.
         */}
        <path d="M0 436 Q200 424 420 432 Q640 440 860 428 Q1160 416 1440 430 V480 H0 Z" fill="#0f0d15" />

        {/* the trail, catching a little light */}
        <path
          d="M560 470 Q620 452 648 444 Q690 432 706 420"
          stroke="#161321"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* trailhead book stack (mobile-safe), plus the desktop-side stacks */}
        <g fill="#0b0913">
          <rect x="540" y="428" width="62" height="12" rx="2" transform="rotate(-6 570 434)" />
          <rect x="548" y="440" width="78" height="13" rx="2" />
          <rect x="542" y="453" width="86" height="13" rx="2" />
          <rect x="300" y="422" width="58" height="12" rx="2" transform="rotate(6 330 428)" />
          <rect x="296" y="434" width="80" height="13" rx="2" />
          <rect x="1180" y="410" width="66" height="12" rx="2" transform="rotate(5 1213 416)" />
          <rect x="1176" y="422" width="88" height="13" rx="2" />
          <rect x="1184" y="435" width="78" height="13" rx="2" />
        </g>
        {/* hairline page edges so the stacks read as books */}
        <g fill="#f4f2e8" opacity="0.3">
          <rect x="552" y="441" width="3" height="11" />
          <rect x="546" y="454" width="3" height="11" />
          <rect x="1180" y="423" width="3" height="11" />
          <rect x="300" y="435" width="3" height="11" />
        </g>
        {/* the open book at the trailhead */}
        <path d="M508 452 Q530 440 554 446 Q578 452 600 446 L600 458 Q578 464 554 458 Q530 452 508 464 Z" fill="#0b0913" />
        <line x1="554" y1="446" x2="554" y2="458" stroke="#f4f2e8" strokeWidth="1.4" opacity="0.35" />

        {/* students climbing toward the evening session */}
        <g fill="#0b0913" stroke="#0b0913" strokeLinecap="round">
          {/* 1st: heavy backpack, leading */}
          <line x1="640" y1="430" x2="637" y2="448" strokeWidth="4.4" />
          <line x1="637" y1="448" x2="629" y2="462" strokeWidth="2.8" />
          <line x1="637" y1="448" x2="647" y2="461" strokeWidth="2.8" />
          <line x1="641" y1="436" x2="651" y2="428" strokeWidth="2.2" />
          <circle cx="643" cy="422" r="4.8" stroke="none" />
          <rect x="626" y="427" width="10" height="13" rx="3" stroke="none" />
          {/* 2nd: mid-stride */}
          <line x1="686" y1="424" x2="683" y2="441" strokeWidth="4.4" />
          <line x1="683" y1="441" x2="675" y2="455" strokeWidth="2.8" />
          <line x1="683" y1="441" x2="693" y2="454" strokeWidth="2.8" />
          <line x1="687" y1="430" x2="697" y2="423" strokeWidth="2.2" />
          <circle cx="689" cy="416" r="4.8" stroke="none" />
          <rect x="672" y="421" width="10" height="13" rx="3" stroke="none" />
          {/* 3rd: carrying a book */}
          <line x1="712" y1="412" x2="709" y2="429" strokeWidth="4.4" />
          <line x1="709" y1="429" x2="701" y2="443" strokeWidth="2.8" />
          <line x1="709" y1="429" x2="719" y2="442" strokeWidth="2.8" />
          <line x1="713" y1="418" x2="723" y2="411" strokeWidth="2.2" />
          <circle cx="715" cy="404" r="4.8" stroke="none" />
          <rect x="700" y="409" width="10" height="13" rx="3" stroke="none" />
          <rect x="721" y="417" width="13" height="8" rx="1.5" stroke="none" />
          {/* 4th: tallest, looking up at the tower */}
          <line x1="758" y1="398" x2="754" y2="416" strokeWidth="4.4" />
          <line x1="754" y1="416" x2="747" y2="430" strokeWidth="2.8" />
          <line x1="754" y1="416" x2="764" y2="429" strokeWidth="2.8" />
          <circle cx="757" cy="390" r="4.9" stroke="none" />
        </g>
        {/* the dog, bringing up the rear */}
        <g fill="#0b0913" stroke="#0b0913">
          <path d="M782 424 Q791 415 801 423 L801 429 L782 429 Z" strokeWidth="0" />
          <line x1="780" y1="422" x2="774" y2="416" strokeWidth="2.8" />
          <line x1="785" y1="429" x2="785" y2="436" strokeWidth="2.2" />
          <line x1="798" y1="429" x2="798" y2="436" strokeWidth="2.2" />
          <circle cx="803" cy="419" r="3.6" strokeWidth="0" />
        </g>

        {/* foreground pines, tallest on the right */}
        <g fill="#0b0913">
          <path d="M1318 428 L1338 500 L1298 500 Z" />
          <path d="M1362 446 L1378 500 L1346 500 Z" />
          <path d="M1400 430 L1418 500 L1382 500 Z" />
          <path d="M158 444 L172 500 L144 500 Z" />
          <path d="M204 452 L216 500 L192 500 Z" />
        </g>

        {/* film grain over the whole scene */}
        <rect width="1440" height="480" filter="url(#campus-grain)" opacity="0.08" />
      </svg>
    </div>
  );
}
