/**
 * The finale under the page, on every slide: a layered night silhouette of
 * the campus — the "hikers crossing mountain ridges" idiom, retold with the
 * material of this product. A lit schoolhouse with a clock tower stands on
 * the mid ridge; books pile up on the near ridge; and a small line of
 * students (one brought their dog) climbs toward the evening session.
 * Pure inline SVG — crisp at any width, weighs nothing, and the last ridge
 * fades into the exact footer color so the campus becomes the ground.
 */
export function CampusHorizon() {
  return (
    <div aria-hidden="true" className="-mx-3 -mb-10 mt-1 sm:-mx-5">
      <svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice" className="block h-60 w-full sm:h-72">
        <defs>
          {/* one warm-cool glow behind the lit schoolhouse */}
          <radialGradient id="campus-glow" gradientUnits="userSpaceOnUse" cx="725" cy="200" r="300">
            <stop offset="0%" stopColor="#7c6aff" stopOpacity="0.16" />
            <stop offset="60%" stopColor="#3a4e96" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#3a4e96" stopOpacity="0" />
          </radialGradient>
          <filter id="campus-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        {/* glow */}
        <ellipse cx="725" cy="205" rx="305" ry="125" fill="url(#campus-glow)" />

        {/* far mountain mounds */}
        <path d="M-40 214 L150 96 L400 214 Z" fill="#221c44" opacity="0.55" />
        <path d="M1040 214 L1230 108 L1480 214 Z" fill="#221c44" opacity="0.55" />
        <path d="M0 208 Q260 158 520 186 T1020 172 Q1250 156 1440 184 V300 H0 Z" fill="#1b1638" opacity="0.85" />

        {/* mid ridge — the schoolhouse fuses into it */}
        <g fill="#1e1939">
          <rect x="560" y="150" width="330" height="76" />
          <path d="M540 152 L725 100 L910 152 Z" />
          <rect x="695" y="84" width="52" height="70" />
          <path d="M684 86 L721 52 L758 86 Z" />
          <line x1="721" y1="52" x2="721" y2="24" stroke="#1e1939" strokeWidth="3" />
          <path d="M723 26 L754 33 L723 41 Z" />
          <rect x="852" y="118" width="14" height="34" />
          <rect x="1070" y="176" width="220" height="56" />
          <rect x="1240" y="152" width="12" height="26" />
          <rect x="586" y="196" width="16" height="30" />
          <rect x="856" y="196" width="16" height="30" />
        </g>

        {/* pines along the mid ridge */}
        <g fill="#1e1939">
          <path d="M487 192 L499 226 L475 226 Z" />
          <path d="M517 186 L531 226 L503 226 Z" />
          <path d="M547 194 L558 226 L536 226 Z" />
          <path d="M951 188 L964 226 L938 226 Z" />
          <path d="M986 182 L998 226 L974 226 Z" />
          <path d="M1018 194 L1030 226 L1006 226 Z" />
        </g>

        {/* the lit windows; a few of them breathe */}
        <g fill="#f4f2e8" opacity="0.45">
          <circle cx="600" cy="180" r="3.2" />
          <circle cx="760" cy="180" r="3.2" />
          <circle cx="800" cy="180" r="3.2" />
          <circle cx="620" cy="202" r="3.2" />
          <circle cx="660" cy="202" r="3.2" />
          <circle cx="780" cy="202" r="3.2" />
        </g>
        <circle cx="680" cy="180" r="3.4" fill="#22a58a" className="animate-twinkle [animation-delay:-2.5s]" />
        <circle cx="740" cy="202" r="3.4" fill="#22a58a" className="animate-twinkle [animation-delay:-4s]" />
        {/* the clock, keeping the evening */}
        <circle cx="721" cy="112" r="8.5" fill="#f4f2e8" opacity="0.92" className="animate-twinkle" />
        <line x1="721" y1="112" x2="721" y2="107" stroke="#1e1939" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="721" y1="112" x2="726" y2="112" stroke="#1e1939" strokeWidth="1.6" strokeLinecap="round" />

        {/* far building windows */}
        <g fill="#f4f2e8" opacity="0.35">
          <circle cx="1110" cy="198" r="3" />
          <circle cx="1150" cy="198" r="3" />
          <circle cx="1190" cy="198" r="3" />
          <circle cx="1230" cy="198" r="3" />
        </g>

        {/* near ridge — the same color as the page footer, so it becomes ground */}
        <path
          d="M0 252 Q140 232 300 242 Q460 250 600 234 Q760 218 940 226 Q1150 234 1440 208 V300 H0 Z"
          fill="#0f0d15"
        />
        <rect width="1440" height="300" filter="url(#campus-grain)" opacity="0.09" />

        {/* near pines */}
        <g fill="#0b0913">
          <path d="M1032 232 L1046 276 L1018 276 Z" />
          <path d="M1078 244 L1090 276 L1066 276 Z" />
          <path d="M1122 234 L1134 276 L1110 276 Z" />
          <path d="M1170 246 L1183 276 L1157 276 Z" />
          <path d="M1226 238 L1239 276 L1213 276 Z" />
        </g>

        {/* stacks of books, leaning into the night */}
        <g fill="#0b0913">
          <rect x="100" y="229" width="48" height="11" rx="2" transform="rotate(-6 124 234)" />
          <rect x="110" y="240" width="66" height="12" rx="2" />
          <rect x="104" y="252" width="74" height="12" rx="2" />
          <rect x="84" y="265" width="70" height="12" rx="2" />

          <rect x="284" y="228" width="46" height="11" rx="2" transform="rotate(7 307 233)" />
          <rect x="286" y="240" width="70" height="12" rx="2" />
          <rect x="292" y="252" width="58" height="12" rx="2" />
          <rect x="280" y="265" width="66" height="12" rx="2" />
        </g>
        {/* hairline page edges so the stacks read as books */}
        <g fill="#f4f2e8" opacity="0.3">
          <rect x="104" y="241" width="3" height="10" />
          <rect x="104" y="253" width="3" height="10" />
          <rect x="286" y="241" width="3" height="10" />
          <rect x="292" y="253" width="3" height="10" />
        </g>

        {/* the open book, resting mid-ridge */}
        <g fill="#0b0913">
          <path d="M400 246 Q424 232 452 238 Q480 244 504 238 L504 250 Q480 256 452 250 Q424 244 400 258 Z" />
        </g>
        <line x1="452" y1="238" x2="452" y2="250" stroke="#f4f2e8" strokeWidth="1.4" opacity="0.35" />

        {/* a small line of students, climbing toward the evening session */}
        <g fill="#0b0913" stroke="#0b0913" strokeLinecap="round">
          <line x1="436" y1="222" x2="434" y2="238" strokeWidth="4" />
          <line x1="434" y1="238" x2="428" y2="252" strokeWidth="2.5" />
          <line x1="434" y1="238" x2="442" y2="250" strokeWidth="2.5" />
          <line x1="437" y1="228" x2="446" y2="222" strokeWidth="2" />
          <circle cx="439" cy="216" r="4.4" stroke="none" />
          <rect x="426" y="220" width="8" height="11" rx="2" stroke="none" />

          <line x1="502" y1="210" x2="500" y2="226" strokeWidth="4" />
          <line x1="500" y1="226" x2="494" y2="240" strokeWidth="2.5" />
          <line x1="500" y1="226" x2="508" y2="239" strokeWidth="2.5" />
          <line x1="503" y1="216" x2="512" y2="210" strokeWidth="2" />
          <circle cx="505" cy="204" r="4.4" stroke="none" />
          <rect x="492" y="208" width="8" height="11" rx="2" stroke="none" />

          <line x1="566" y1="199" x2="564" y2="215" strokeWidth="4" />
          <line x1="564" y1="215" x2="558" y2="229" strokeWidth="2.5" />
          <line x1="564" y1="215" x2="572" y2="228" strokeWidth="2.5" />
          <line x1="567" y1="205" x2="576" y2="200" strokeWidth="2" />
          <circle cx="569" cy="193" r="4.4" stroke="none" />
          <rect x="556" y="197" width="8" height="11" rx="2" stroke="none" />
          {/* the third one carries a book */}
          <rect x="574" y="205" width="12" height="7" rx="1.5" stroke="none" />
        </g>
        {/* and one friend brought the dog */}
        <g fill="#0b0913" stroke="#0b0913">
          <path d="M596 228 Q604 220 613 227 L613 232 L596 232 Z" strokeWidth="0" />
          <line x1="595" y1="226" x2="590" y2="221" strokeWidth="2.5" />
          <line x1="599" y1="232" x2="599" y2="238" strokeWidth="2" />
          <line x1="610" y1="232" x2="610" y2="238" strokeWidth="2" />
          <circle cx="614" cy="223" r="3.4" strokeWidth="0" />
        </g>
      </svg>
    </div>
  );
}
