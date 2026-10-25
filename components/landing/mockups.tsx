import { FACTS, MEETUP_WEEKS } from "@/components/landing/facts";
import { Mascot } from "@/components/landing/mascot";
import {
  ArrowRight,
  BellRing,
  CalendarCheck,
  ChevronDown,
  Clock,
  MessageCircle,
  UsersRound,
} from "lucide-react";

/**
 * The app "screenshot" family for the landing page. Every window now mirrors
 * a surface the member actually gets after signing in — the dashboard, the
 * chords index, the point room and the progress view — and every number is
 * either from the fact bible (`facts.ts`) or from the seeded demo data the
 * real pages render. Characters from the cast appear inside the shots with
 * speech bubbles and notification tiles, like sticky notes from your people.
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

const CHROME = "border border-white/10 bg-white/[0.06] backdrop-blur";
const SOFT_SHADOW = "shadow-[0_40px_80px_-36px_rgba(0,0,0,0.6)]";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.05] p-4";
const TITLE = "text-sm font-semibold text-paper";
const LABEL = "text-[11px] text-white/50";
const MICRO = "text-[10px] text-white/40";
const BAR_TRACK = "h-1.5 overflow-hidden rounded-full bg-white/10";

/* ---- Shared pieces ---- */

function WindowChrome({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-3.5 py-2.5">
      <span className="size-2 rounded-full bg-coral/80" />
      <span className="size-2 rounded-full bg-sun/80" />
      <span className="size-2 rounded-full bg-mint/80" />
      <span className="ml-2 truncate rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] text-white/55">{url}</span>
    </div>
  );
}

/* A speech bubble sat next to a cast character. Paper white with a candy
   tail so it reads as spoken, not printed. */
export function SpeechBubble({
  title,
  body,
  side = "right",
  className,
}: {
  title: string;
  body?: string;
  side?: "left" | "right";
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl bg-white px-3 py-2.5 shadow-[0_18px_36px_-16px_rgba(0,0,0,0.55)] ${side === "right" ? "rounded-bl-sm" : "rounded-br-sm"} ${className ?? ""}`}
    >
      <p className="text-[11px] font-bold leading-tight text-ink">{title}</p>
      {body ? <p className="mt-0.5 text-[10px] leading-snug text-ink/60">{body}</p> : null}
      <span
        aria-hidden="true"
        className={`absolute top-2.5 size-2.5 rotate-45 bg-white ${side === "right" ? "-left-1" : "-right-1"}`}
      />
    </div>
  );
}

/* One notification tile: icon tile, one line of what happened, and how long
   ago. Used in dashboard + point windows like push notifications. */
export function NotificationTile({
  icon: Icon,
  color,
  title,
  meta,
  when = "just now",
  className,
}: {
  icon: typeof BellRing;
  color: string;
  title: string;
  meta?: string;
  when?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2.5 animate-pop ${className ?? ""}`}
    >
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      >
        <Icon size={12} strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold text-paper">{title}</p>
        {meta ? <p className={`truncate ${MICRO}`}>{meta}</p> : null}
      </div>
      <span className={`shrink-0 ${MICRO}`}>{when}</span>
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
      className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full border-2 border-white/10 text-[8px] font-bold text-white`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
      title={name}
    >
      {name[0]}
    </span>
  );
}

/* One goal row used by the point card, the dashboard and the progress view.
   The fill grows in on mount, staggered per goal (delay) — data arriving. */
function GoalRow({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-xs font-medium text-white/85">{label}</p>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-paper">
          {value}%
        </span>
      </div>
      <div className={`mt-1.5 ${BAR_TRACK}`}>
        <div
          className="h-full origin-left rounded-full bg-gradient-to-r from-mint/60 to-mint animate-grow"
          style={{ width: `${value}%`, animationDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

/* ================= The Circle tab: the dashboard you sign into ================= */

export function DashboardHomeMockup({ panel }: { panel: DashboardPanel }) {
  return (
    <div
      className={`mx-auto w-full overflow-hidden rounded-[1.6rem] ${CHROME} ${SOFT_SHADOW} transition-transform duration-300 hover:-translate-y-1`}
    >
      <WindowChrome url="studycircle.app/dashboard" />
      <div className="grid gap-3 bg-[#0f0d16]/70 p-4 md:grid-cols-12">
        {/* Greeting — the same header the real dashboard renders */}
        <div className={`${CARD} !rounded-2xl flex items-center gap-3 md:col-span-8`}>
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-white/10 text-[11px] font-bold text-white"
            style={{ backgroundColor: panel.user.color }}
            aria-hidden="true"
          >
            {panel.user.name[0]}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-paper">
              Welcome, {panel.user.name.split(" ")[0]}
            </p>
            <p className={`truncate ${LABEL}`}>
              {panel.points.length} points · {panel.chords.length} chords · {panel.goals.length} goals
            </p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-mint/15 px-2.5 py-1 text-[10px] font-semibold text-mint">
            <span className="size-1.5 rounded-full bg-mint" aria-hidden="true" />
            {FACTS.streak} weeks showing up
          </span>
        </div>

        {/* Notification feed — your people leave traces */}
        <div className="space-y-2 md:col-span-4">
          <NotificationTile
            icon={CalendarCheck}
            color="#8b7ff7"
            title={`Meeting ${panel.next.when}`}
            meta={panel.next.title}
            when="next"
          />
          <NotificationTile
            icon={MessageCircle}
            color="#22a58a"
            title="Sarah shared Mendelian ratio notes"
            meta="AP Biology Genetics Point"
            when="1h"
          />
          <Mascot mood="wink" color="#f0a03c" className="ml-1 mt-0.5 size-7 rotate-[8deg] animate-bob [animation-delay:-2s]" />
        </div>

        {/* Your chords — chips, exactly like the real dashboard */}
        <div className={`${CARD} md:col-span-8`}>
          <div className="flex items-baseline justify-between gap-3">
            <p className={TITLE}>Your chords</p>
            <span className={LABEL}>subjects you belong to</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {panel.chords.map((chord, index) => (
              <span
                key={chord.id}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-paper animate-fade-up"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: chord.color }} />
                {chord.label}
              </span>
            ))}
          </div>
        </div>

        {/* Goals this week — same strip the dashboard rebuilds from the store */}
        <div className={`${CARD} flex flex-col justify-center md:col-span-4`}>
          <p className={TITLE}>Goals you set together</p>
          <div className="mt-3 space-y-2.5">
            {panel.goals.map((goal, index) => (
              <GoalRow key={goal.label} label={goal.label} value={goal.value} delay={index * 140} />
            ))}
          </div>
        </div>

        {/* Your points — compact rows of the real cards the dashboard shows */}
        <div className={`space-y-2 md:col-span-8`}>
          {panel.points.slice(0, 2).map((point, index) => (
            <div
              key={point.title}
              className="flex items-center gap-3 rounded-2xl bg-white/[0.05] px-3.5 py-3 animate-fade-up"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: point.chordColor }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-paper">{point.title}</p>
                <p className={`truncate ${LABEL}`}>
                  {point.chord} · meets {point.meets}
                </p>
              </div>
              <span className="flex -space-x-1.5">
                {point.members.slice(0, 3).map((m) => (
                  <AvatarChip key={m.name} name={m.name} color={m.color} />
                ))}
              </span>
            </div>
          ))}
          <p className={`pl-1 ${MICRO}`}>swipe on through — every point carries its weekly meeting card too</p>
        </div>

        {/* Next meetup strip — same pill grammar as Join this point */}
        <div className={`${CARD} flex flex-wrap items-center justify-between gap-3 !px-4 !py-3 md:col-span-12`}>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-mint text-white" aria-hidden="true">
              <Clock size={16} strokeWidth={2.25} />
            </span>
            <div>
              <p className="text-xs font-bold text-paper">Next meetup · {panel.next.when}</p>
              <p className={LABEL}>
                {panel.next.title} · {panel.next.members} members
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2.5 rounded-full bg-white py-1 pl-1 pr-4 shadow-[0_16px_32px_-16px_rgba(0,0,0,0.6)]">
            <span className="flex size-7 items-center justify-center rounded-full bg-mint text-white" aria-hidden="true">
              <ArrowRight size={13} strokeWidth={2.5} />
            </span>
            <span className="text-xs font-bold text-ink">Open the meeting room</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================= The Chords tab: the real chords index ================= */

export function ChordsMockup({ panel }: { panel: ChordsPanel }) {
  const shown = panel.cards;
  return (
    <div className={`mx-auto w-full overflow-hidden rounded-[1.6rem] ${CHROME} ${SOFT_SHADOW} transition-transform duration-300 hover:-translate-y-1`}>
      <WindowChrome url="studycircle.app/chords" />
      <div className="bg-[#0f0d16]/70 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className={TITLE}>Chords</p>
            <p className={LABEL}>Subjects are chords inside the circle</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/70">
            All ages
            <ChevronDown size={12} strokeWidth={2.25} aria-hidden="true" />
          </span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {shown.map((chord, index) => (
            <div
              key={chord.id}
              className="flex flex-col gap-2.5 rounded-2xl bg-white/[0.05] px-3.5 py-3 animate-fade-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-center gap-2.5">
                <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: chord.color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-paper">{chord.name} Chord</p>
                  <p className={`truncate ${LABEL}`}>
                    {chord.audience === "all" ? "Every age" : chord.audience === "college" ? "College · 18+" : "High school"}
                  </p>
                </div>
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#b7aaff]"
                  aria-hidden="true"
                >
                  <ArrowRight size={12} strokeWidth={2.25} className="-rotate-45" />
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex -space-x-1.5" aria-hidden="true">
                  {chord.stack.map((m) => (
                    <AvatarChip key={m.name} name={m.name} color={m.color} />
                  ))}
                </span>
                <span className={MICRO}>
                  {chord.points} points · {chord.members} members
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Character note pinned under the grid */}
        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2.5">
          <Mascot mood="peek" color="#22a58a" className="shrink-0 -scale-x-100" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-paper">Eight chords are live right now.</p>
            <p className={MICRO}>Join one, then find the point that meets when you actually can.</p>
          </div>
          <span className={`shrink-0 self-end ${MICRO}`}>live</span>
        </div>
      </div>
    </div>
  );
}

/* ================= The Points tab: the real point room ================= */

export function PointMockup({ panel }: { panel: PointPanel }) {
  return (
    <div className={`w-full overflow-hidden rounded-[1.6rem] ${CHROME} ${SOFT_SHADOW} transition-transform duration-300 hover:-translate-y-1`}>
      <WindowChrome url={`studycircle.app/points/ap-bio-genetics`} />
      <div className="space-y-3.5 bg-[#0f0d16]/70 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: panel.chord.color }} />
            <span className="truncate text-[13px] font-semibold text-paper">{panel.title}</span>
          </div>
          <span className="shrink-0 rounded-full bg-[#8b7ff7]/20 px-2.5 py-1 text-[10px] font-semibold text-[#b7aaff] animate-pulse">
            Weekly point
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.05] px-4 py-3">
          <Clock size={16} strokeWidth={2.25} className="shrink-0 text-[#b7aaff]" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold text-paper">{panel.schedule}</p>
            <p className={LABEL}>your timezone · repeats weekly</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex -space-x-1.5">
            <span
              className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-[#8b7ff7]/60 text-[8px] font-bold text-white"
              style={{ backgroundColor: panel.moderator.color }}
              aria-hidden="true"
              title={panel.moderator.name}
            >
              {panel.moderator.name[0]}
            </span>
            {panel.members.map((m) => (
              <AvatarChip key={m.name} name={m.name} color={m.color} />
            ))}
            <Mascot mood="wink" className="relative z-10 size-5 -scale-x-100 drop-shadow-sm" />
          </span>
          <span className={`${LABEL}`}>
            {panel.members.length + 1} members · {panel.moderator.name.split(" ")[0]} the moderator
          </span>
        </div>

        {/* The real chat keeps a seat open for you */}
        <div className="space-y-2">
          {panel.chat.map((message, index) => (
            <div
              key={`${message.name}-${index}`}
              className="flex items-start gap-2 rounded-2xl bg-white/[0.05] px-3 py-2 animate-fade-up"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <AvatarChip name={message.name} color={message.color} ring />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-paper">{message.name}</p>
                <p className={`line-clamp-2 ${LABEL}`}>{message.text}</p>
              </div>
              <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-white/35">{message.kind}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2.5 rounded-2xl bg-white/[0.05] p-4">
          <p className={LABEL}>This week&apos;s goals — averaged across the point</p>
          {panel.goals.map((goal, goalIndex) => (
            <GoalRow key={goal.label} label={goal.label} value={goal.value} delay={goalIndex * 140} />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`flex items-center gap-1.5 ${MICRO}`}>
            <BellRing size={10} strokeWidth={2.25} aria-hidden="true" /> Meeting reminders go out before each session
          </span>
          <span className="inline-flex items-center gap-2.5 rounded-full bg-white py-1 pl-1 pr-4 shadow-[0_16px_32px_-16px_rgba(0,0,0,0.6)]">
            <span className="flex size-7 items-center justify-center rounded-full bg-mint text-white" aria-hidden="true">
              <ArrowRight size={13} strokeWidth={2.5} />
            </span>
            <span className="text-xs font-bold text-ink">Join this point</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================= The Progress tab: the week you can see ================= */

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
          className={`w-1.5 origin-bottom rounded-full animate-equalize ${index === 4 ? "bg-mint" : "bg-mint/40"}`}
          style={{ height: `${height}px`, animationDelay: `-${index * 130}ms` }}
        />
      ))}
    </div>
  );
}

export function DashboardMockup({ panel }: { panel: DashboardPanel }) {
  return (
    <div className={`w-full overflow-hidden rounded-[1.6rem] ${CHROME} ${SOFT_SHADOW} transition-transform duration-300 hover:-translate-y-1`}>
      <WindowChrome url="studycircle.app/dashboard" />
      <div className="grid gap-3 bg-[#0f0d16]/70 p-3.5 sm:p-4 md:grid-cols-12">
        {/* This week's goals — the real one seeded demo members recorded */}
        <div className={`${CARD} space-y-3 md:col-span-8`}>
          <div className="flex items-baseline justify-between gap-3">
            <p className={TITLE}>This week&apos;s goals</p>
            <span className={LABEL}>recorded by the moderator · avg {panel.average}%</span>
          </div>
          {panel.goals.map((goal, goalIndex) => (
            <GoalRow key={goal.label} label={goal.label} value={goal.value} delay={goalIndex * 140} />
          ))}
          <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-2.5">
            <span className={`flex items-center gap-1.5 ${MICRO}`}>
              <UsersRound size={10} strokeWidth={2.25} aria-hidden="true" /> {panel.next.members} members in {panel.next.title}
            </span>
            <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[10px] font-semibold text-mint">up to date</span>
          </div>
        </div>

        {/* Streak streak of showing up weeks */}
        <div className={`${CARD} md:col-span-4`}>
          <div className="flex items-center justify-between">
            <p className={LABEL}>Current streak</p>
            <span className="rounded-full bg-mint/20 px-2 py-0.5 text-[10px] font-semibold text-mint animate-pulse">
              +1 wk
            </span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <DotDigits value={String(FACTS.streak)} className="h-9 w-auto text-paper" />
            <MiniBars />
          </div>
          <p className={`mt-2 border-t border-white/10 pt-2 ${MICRO}`}>
            Personal best: {FACTS.personalBest} weeks — see the six straight.
          </p>
        </div>

        {/* Momentum chart: 28 bars = 4 weeks × 7 meetups-possible days */}
        <div className={`${CARD} md:col-span-8`}>
          <div className="flex items-center justify-between gap-3">
            <p className={TITLE}>Weekly momentum</p>
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/70">
              Last 4 weeks
              <ChevronDown size={10} strokeWidth={2.5} aria-hidden="true" />
            </span>
          </div>
          <div aria-hidden="true" className="mt-3 flex h-24 items-end gap-[3px]">
            {WEEK_BARS.map((height, index) => (
              <span
                key={index}
                className={`flex-1 origin-bottom rounded-full animate-rise ${
                  index === WEEK_BARS.length - 1
                    ? "bg-gradient-to-t from-mint/50 to-mint"
                    : index >= WEEK_BARS.length - 6
                      ? "bg-mint/40"
                      : "bg-white/10"
                }`}
                style={{ height: `${height}%`, animationDelay: `${index * 28}ms` }}
              />
            ))}
          </div>
          <div className={`mt-2 flex ${MICRO}`} aria-hidden="true">
            {WEEK_LABELS.map((week) => (
              <span key={week} className="flex-1 text-center">{week}</span>
            ))}
          </div>
        </div>

        {/* Attendance cells — one per weekly meetup */}
        <div className={`${CARD} md:col-span-4`}>
          <p className={TITLE}>Showing up</p>
          <p className={`mt-0.5 ${LABEL}`}>the last 12 meetups</p>
          <div className="mt-3 flex items-center gap-1" aria-hidden="true">
            {MEETUP_WEEKS.map((tone, index) => (
              <span
                key={index}
                className={`h-4 flex-1 origin-center rounded-[3px] animate-pop ${tone === 0 ? "bg-white/10" : "bg-mint"}`}
                style={{ animationDelay: `${index * 55}ms` }}
              />
            ))}
          </div>
          <p className={`mt-2.5 flex flex-wrap items-center gap-1.5 ${MICRO}`}>
            <span aria-hidden="true" className="size-2 rounded-[2px] bg-white/10" />
            <span>missed</span>
            <span aria-hidden="true" className="ml-1 size-2 rounded-[2px] bg-mint" />
            <span>
              a 5-week run, one miss, then <span className="font-semibold text-mint">{FACTS.streak} straight</span>
            </span>
          </p>
        </div>

        {/* Next meetup strip — same pill grammar as Join this point */}
        <div className={`${CARD} relative flex flex-wrap items-center justify-between gap-3 !px-4 !py-3 md:col-span-12`}>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-mint text-white" aria-hidden="true">
              <Clock size={16} strokeWidth={2.25} />
            </span>
            <div>
              <p className="text-xs font-bold text-paper">Next meetup · {panel.next.when}</p>
              <p className={LABEL}>
                {panel.next.title} · {panel.next.members} members
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SpeechBubble
              side="left"
              title="See you at the meeting room."
              className="hidden sm:block"
            />
            <Mascot mood="cheer" color="#22a58a" className="size-10 animate-bob [animation-delay:-1.8s]" />
            <span className="inline-flex items-center gap-2.5 rounded-full bg-white py-1 pl-1 pr-4 shadow-[0_16px_32px_-16px_rgba(0,0,0,0.6)]">
              <span className="flex size-7 items-center justify-center rounded-full bg-mint text-white" aria-hidden="true">
                <ArrowRight size={13} strokeWidth={2.5} />
              </span>
              <span className="text-xs font-bold text-ink">Join the session</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
