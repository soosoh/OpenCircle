import { FACTS, MEETUP_WEEKS } from "@/components/landing/facts";
import { Mascot } from "@/components/landing/mascot";
import {
  ArrowRight,
  ChevronDown,
  Clock,
  UsersRound,
} from "lucide-react";

/**
 * The app "screenshot" family for the landing page. Every window mirrors a
 * surface the member actually gets after signing in — the dashboard, the
 * chords index and the point room — and every number comes from the fact
 * bible (`facts.ts`) or the seeded demo data the real pages render.
 *
 * One card grammar throughout, matching the signed-in dashboard: white cards
 * with a hairline, display-serif card titles, small muted meta, a dark fill
 * for progress and one solid action. Nothing floats on a shadow.
 */

export type PanelAvatar = { name: string; color: string };

export type DashboardPanel = {
  user: PanelAvatar;
  chords: { id: string; label: string; color: string }[];
  points: { title: string; chord: string; chordColor: string; meets: string; members: PanelAvatar[] }[];
  goals: { label: string; value: number }[];
  average: number;
  next: { title: string; when: string; members: number };
};

export type ChordsPanel = {
  cards: {
    id: string;
    name: string;
    color: string;
    points: number;
    members: number;
    stack: PanelAvatar[];
    audience: string;
  }[];
};

export type PointPanel = {
  title: string;
  chord: { name: string; color: string };
  schedule: string;
  zone: string;
  moderator: PanelAvatar;
  members: PanelAvatar[];
  goals: { label: string; value: number }[];
  chat: { name: string; color: string; text: string; kind: string }[];
  meetingId: string;
};

export type LandingPanel = {
  dashboard: DashboardPanel;
  chords: ChordsPanel;
  point: PointPanel;
};

const WINDOW = "overflow-hidden rounded-[1.6rem] border border-line bg-surface";
const CARD = "rounded-2xl border border-line bg-surface p-4";
const CARD_TITLE = "font-display text-base font-bold leading-tight tracking-tight text-ink";
const LABEL = "text-[11px] leading-snug text-muted";
const MICRO = "text-[10px] leading-snug text-muted";
const BAR_TRACK = "h-1.5 overflow-hidden rounded-full bg-line";
const MINT_PILL = "rounded-full bg-sage px-2 py-0.5 text-[10px] font-semibold text-mint";

/* ---- Shared pieces ---- */

function WindowChrome({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-line bg-mist px-3.5 py-2.5">
      <span className="size-2 rounded-full bg-coral" />
      <span className="size-2 rounded-full bg-sun" />
      <span className="size-2 rounded-full bg-mint" />
      <span className="ml-2 min-w-0 truncate rounded-full bg-surface px-2.5 py-0.5 text-[10px] text-muted">
        {url}
      </span>
    </div>
  );
}

/* A speech bubble sat next to a cast character. White paper with a matching
   tail so it reads as spoken, not printed. `side` is where the bubble sits
   relative to its speaker: side="left" means the speaker is on the right, so the
   tail leaves the bubble's right edge and points at them. */
export function SpeechBubble({
  title,
  body,
  side = "left",
  className,
}: {
  title: string;
  body?: string;
  side?: "left" | "right";
  className?: string;
}) {
  return (
    <div
      className={`relative max-w-[13rem] rounded-2xl border border-line bg-surface px-3 py-2.5 ${className ?? ""}`}
    >
      <p className="text-xs font-bold leading-tight text-ink">{title}</p>
      {body ? <p className="mt-0.5 text-[11px] leading-snug text-muted">{body}</p> : null}
      <span
        aria-hidden="true"
        className={`absolute top-1/2 size-2.5 -translate-y-1/2 rotate-45 border-line bg-surface ${
          side === "right" ? "-left-[6px] border-b border-l" : "-right-[6px] border-t border-r"
        }`}
      />
    </div>
  );
}

/* ---- Dot-matrix numerals: the one font numbers lead cards with. ---- */

const BITMAP: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
};

export function DotDigits({ value, className }: { value: string; className?: string }) {
  const chars = value.split("");
  const width = chars.length * 6 - 1;
  const dots: { x: number; y: number }[] = [];
  chars.forEach((char, charIndex) => {
    const rows = BITMAP[char] ?? [];
    rows.forEach((row, y) => {
      row.split("").forEach((bit, x) => {
        if (bit === "1") dots.push({ x: charIndex * 6 + x + 0.5, y: y + 0.5 });
      });
    });
  });
  return (
    <svg viewBox={`0 0 ${width} 7`} className={className} aria-hidden="true" role="presentation">
      {dots.map((dot, i) => (
        <circle key={i} cx={dot.x} cy={dot.y} r={0.42} fill="currentColor" />
      ))}
    </svg>
  );
}

function AvatarChip({ name, color, ring }: { name: string; color: string; ring?: boolean }) {
  const size = ring ? "size-4" : "size-5";
  return (
    <span
      className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full border border-line text-[8px] font-bold text-white`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
      title={name}
    >
      {name[0]}
    </span>
  );
}

/* One goal row used by the point card and the dashboard. The fill grows in on
   mount, staggered per goal (delay) — data arriving. */
function GoalRow({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-xs font-medium text-ink">{label}</p>
        <span className="shrink-0 rounded-full bg-mist px-2 py-0.5 text-[11px] font-bold text-ink tnum">
          {value}%
        </span>
      </div>
      <div className={`mt-1.5 ${BAR_TRACK}`}>
        <div
          className="h-full origin-left rounded-full bg-ink animate-grow"
          style={{ width: `${value}%`, animationDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

/* ================= The Circle tab: the dashboard you sign into ================= */

const WEEK_BARS = [
  28, 42, 34, 55, 38, 60, 44, 36, 52, 58, 46, 64, 40, 70, 52, 44, 58, 36, 66, 50,
  62, 48, 72, 56, 46, 60, 68, 74,
];
const STREAK_BARS = [10, 16, 22, 14, 26, 20];
const WEEK_LABELS = ["Week 1", "Week 2", "Week 3", "Week 4"];

function MiniBars() {
  return (
    <div className="flex items-end gap-1.5" aria-hidden="true">
      {STREAK_BARS.map((height, index) => (
        <span
          key={index}
          className={`w-1.5 origin-bottom rounded-full animate-equalize ${index === 4 ? "bg-mint" : "bg-sage"}`}
          style={{ height: `${height}px`, animationDelay: `-${index * 130}ms` }}
        />
      ))}
    </div>
  );
}

/* The momentum chart: 28 bars = 4 weeks × 7 meetups-possible days. */
function MomentumBars({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-end gap-[3px] ${className}`}>
      {WEEK_BARS.map((height, index) => (
        <span
          key={index}
          className={`flex-1 origin-bottom rounded-full animate-rise ${
            index === WEEK_BARS.length - 1
              ? "bg-mint"
              : index >= WEEK_BARS.length - 6
                ? "bg-mint/45"
                : "bg-line"
          }`}
          style={{ height: `${height}%`, animationDelay: `${index * 28}ms` }}
        />
      ))}
    </div>
  );
}

export function StreakCard({ className = "" }: { className?: string }) {
  return (
    <div className={`${CARD} ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <p className={CARD_TITLE}>Current streak</p>
        <span className={`shrink-0 ${MINT_PILL}`}>+1 wk</span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <DotDigits value={String(FACTS.streak)} className="h-9 w-auto text-ink" />
        <MiniBars />
      </div>
      <p className={`mt-3 border-t border-line pt-2.5 ${MICRO}`}>
        Personal best: {FACTS.personalBest} weeks — six of them straight.
      </p>
    </div>
  );
}

export function ShowingUpCard({ className = "" }: { className?: string }) {
  return (
    <div className={`${CARD} ${className}`}>
      <p className={CARD_TITLE}>Showing up</p>
      <p className={`mt-0.5 ${LABEL}`}>the last 12 meetups</p>
      <div className="mt-3 flex items-center gap-1" aria-hidden="true">
        {MEETUP_WEEKS.map((tone, index) => (
          <span
            key={index}
            className={`h-4 flex-1 origin-center rounded-[3px] animate-pop ${
              tone === 0 ? "bg-line" : "bg-mint"
            }`}
            style={{ animationDelay: `${index * 55}ms` }}
          />
        ))}
      </div>
      <p className={`mt-3 flex flex-wrap items-center gap-1.5 ${MICRO}`}>
        <span aria-hidden="true" className="size-2 rounded-[2px] bg-line" />
        <span>missed</span>
        <span aria-hidden="true" className="ml-1 size-2 rounded-[2px] bg-mint" />
        <span>
          a 5-week run, one miss, then <span className="font-semibold text-mint">{FACTS.streak} straight</span>
        </span>
      </p>
    </div>
  );
}

export function MomentumCard({ className = "" }: { className?: string }) {
  return (
    <div className={`${CARD} ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={CARD_TITLE}>Weekly momentum</p>
        <span className="flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-[11px] font-semibold text-muted">
          Last 4 weeks
          <ChevronDown size={10} strokeWidth={2.5} aria-hidden="true" />
        </span>
      </div>
      <MomentumBars className="mt-4 h-28" />
      <div className={`mt-2 flex ${MICRO}`} aria-hidden="true">
        {WEEK_LABELS.map((week) => (
          <span key={week} className="flex-1 text-center">
            {week}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DashboardHomeMockup({ panel }: { panel: DashboardPanel }) {
  return (
    <div className={`mx-auto w-full ${WINDOW}`}>
      <WindowChrome url="studycircle.app/dashboard" />
      <div className="grid gap-3 bg-sun p-3 sm:p-4 md:grid-cols-12">
        {/* This week's goals — the real goals the demo member recorded */}
        <div className={`${CARD} md:col-span-8`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className={CARD_TITLE}>This week&apos;s goals</p>
            <span className={LABEL}>recorded by the moderator · avg {panel.average}%</span>
          </div>
          <div className="mt-3 space-y-3">
            {panel.goals.map((goal, index) => (
              <GoalRow key={goal.label} label={goal.label} value={goal.value} delay={index * 140} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-line pt-2.5">
            <span className={`flex min-w-0 items-center gap-1.5 ${MICRO}`}>
              <UsersRound size={11} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
              <span className="truncate">
                {panel.next.members} members in {panel.next.title}
              </span>
            </span>
            <span className={`shrink-0 ${MINT_PILL}`}>up to date</span>
          </div>
        </div>

        <StreakCard className="md:col-span-4" />

        <MomentumCard className="md:col-span-8" />

        <ShowingUpCard className="md:col-span-4" />

        {/* Next meetup — the same strip the real dashboard ends on */}
        <div className={`${CARD} flex flex-wrap items-center justify-between gap-3 !px-4 !py-3 md:col-span-12`}>
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-white" aria-hidden="true">
              <Clock size={16} strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-ink">Next meetup · {panel.next.when}</p>
              <p className={`truncate ${LABEL}`}>
                {panel.next.title} · {panel.next.members} members
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SpeechBubble
              side="left"
              title="See you at the meeting room."
              className="hidden lg:block"
            />
            <Mascot mood="cheer" color="#2E7D5B" className="size-9 animate-bob [animation-delay:-1.8s]" />
            <span className="inline-flex items-center gap-2 rounded-full bg-ink py-1 pl-1 pr-4 text-white">
              <span className="flex size-7 items-center justify-center rounded-full bg-sun text-ink" aria-hidden="true">
                <ArrowRight size={13} strokeWidth={2.5} />
              </span>
              <span className="text-xs font-bold">Join the session</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= The Chords tab: the real chords index ================= */

function audienceLabel(audience: string) {
  return audience === "college" ? "College · 18+" : audience === "high-school" ? "High school" : "Every age";
}

export function ChordsMockup({ panel }: { panel: ChordsPanel }) {
  const shown = panel.cards;
  return (
    <div className={`mx-auto w-full ${WINDOW}`}>
      <WindowChrome url="studycircle.app/chords" />
      <div className="bg-paper p-3.5 sm:p-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className={CARD_TITLE}>Chords</p>
            <p className={`mt-0.5 ${LABEL}`}>Subjects are chords inside the circle</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-semibold text-ink">
            All ages
            <ChevronDown size={12} strokeWidth={2.25} aria-hidden="true" />
          </span>
        </div>

        <div className="mt-3 grid items-start gap-2 sm:grid-cols-2">
          {shown.map((chord, index) => (
            <div
              key={chord.id}
              className="flex min-w-0 flex-col gap-2.5 rounded-xl border border-line bg-surface px-3 py-2.5 animate-fade-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex min-w-0 items-start gap-2">
                <span className="mt-1 size-3 shrink-0 rounded-full" style={{ backgroundColor: chord.color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-tight text-ink">{chord.name} Chord</p>
                  <p className={`truncate ${LABEL}`}>{audienceLabel(chord.audience)}</p>
                </div>
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line text-coral"
                  aria-hidden="true"
                >
                  <ArrowRight size={12} strokeWidth={2.25} className="-rotate-45" />
                </span>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-2">
                {chord.stack.length > 0 ? (
                  <span className="flex shrink-0 -space-x-1.5" aria-hidden="true">
                    {chord.stack.slice(0, 4).map((member) => (
                      <AvatarChip key={member.name} name={member.name} color={member.color} />
                    ))}
                  </span>
                ) : (
                  <span className={MICRO}>new</span>
                )}
                <span className={`truncate ${MICRO}`}>
                  {chord.points} {chord.points === 1 ? "point" : "points"} ·{" "}
                  {chord.members} {chord.members === 1 ? "member" : "members"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Character note pinned under the grid */}
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-line bg-surface px-3 py-2.5">
          <Mascot
            mood="peek"
            color="#2E7D5B"
            className="size-9 shrink-0 -scale-x-100"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold leading-snug text-ink">
              {shown.length} chords are live right now.
            </p>
            <p className={`line-clamp-2 ${MICRO}`}>
              Join one, then find the point that meets when you actually can.
            </p>
          </div>
          <span className={`shrink-0 self-center ${MICRO}`}>live</span>
        </div>
      </div>
    </div>
  );
}

/* ================= The Points tab: the real point room ================= */

export function PointMockup({ panel }: { panel: PointPanel }) {
  return (
    <div className={`w-full ${WINDOW}`}>
      <WindowChrome url="studycircle.app/points/ap-bio-genetics" />
      <div className="space-y-3.5 bg-paper p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: panel.chord.color }} />
            <span className="truncate text-[13px] font-semibold text-ink">{panel.title}</span>
          </div>
          <span className="shrink-0 rounded-full bg-sun-soft px-2.5 py-1 text-[10px] font-semibold text-sun-ink">
            Weekly point
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
          <Clock size={16} strokeWidth={2.25} className="shrink-0 text-mint" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-ink">{panel.schedule}</p>
            <p className={LABEL}>your timezone · repeats weekly</p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <span className="flex shrink-0 -space-x-1.5">
            <span
              className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-line text-[8px] font-bold text-white"
              style={{ backgroundColor: panel.moderator.color }}
              aria-hidden="true"
              title={panel.moderator.name}
            >
              {panel.moderator.name[0]}
            </span>
            {panel.members.map((member) => (
              <AvatarChip key={member.name} name={member.name} color={member.color} />
            ))}
            <Mascot mood="wink" color="#F4D35E" className="relative z-10 size-5 -scale-x-100" />
          </span>
          <span className={`min-w-0 truncate ${LABEL}`}>
            {panel.members.length + 1} members · {panel.moderator.name.split(" ")[0]} the moderator
          </span>
        </div>

        {/* The real chat keeps a seat open for you */}
        <div className="space-y-2">
          {panel.chat.map((message, index) => (
            <div
              key={`${message.name}-${index}`}
              className="flex items-start gap-2 rounded-xl border border-line bg-surface px-3 py-2 animate-fade-up"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <AvatarChip name={message.name} color={message.color} ring />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-ink">{message.name}</p>
                <p className={`line-clamp-2 ${LABEL}`}>{message.text}</p>
              </div>
              <span className="shrink-0 rounded-full bg-mist px-1.5 py-0.5 text-[9px] font-medium capitalize text-muted">
                {message.kind}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
          <p className={LABEL}>This week&apos;s goals — averaged across the point</p>
          {panel.goals.map((goal, goalIndex) => (
            <GoalRow key={goal.label} label={goal.label} value={goal.value} delay={goalIndex * 140} />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`flex min-w-0 items-center gap-1.5 ${MICRO}`}>
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-mint" />
            Meeting reminders go out before each session
          </span>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink py-1 pl-1 pr-4 text-white">
            <span className="flex size-7 items-center justify-center rounded-full bg-sun text-ink" aria-hidden="true">
              <ArrowRight size={13} strokeWidth={2.5} />
            </span>
            <span className="text-xs font-bold">Join this point</span>
          </span>
        </div>
      </div>
    </div>
  );
}
