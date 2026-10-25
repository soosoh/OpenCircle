import type { ChordDefinition } from "@/config/chords";
import { FACTS, AVERAGE_GOAL, chordMeta, MEETUP_WEEKS } from "@/components/landing/facts";
import { Mascot } from "@/components/landing/mascot";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Clock,
} from "lucide-react";

/**
 * The app "screenshot" family for the landing page. All three surfaces share
 * one visual grammar so they read as one product — the same grammar as the
 * page itself: charcoal glass, ivory type, hairline borders, mint accent.
 *   - window frame: glass chrome + traffic lights + app URL
 *   - content field: warmed dark carrying charcoal cards rimmed white/10
 *   - type tones: titles `text-sm font-semibold` ivory, labels
 *     `text-[11px] white/50`, micro `text-[10px] white/40`
 *   - numbers: dot-matrix digits wherever a number leads a card
 * Every number comes from the fact bible (`facts.ts`), never hand-typed here.
 */

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

function AvatarChip({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex size-5 items-center justify-center rounded-full border-2 border-white/10 text-[8px] font-bold text-white"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {name[0]}
    </span>
  );
}

/* One goal row used by BOTH the point card and the dashboard. The fill grows
   in on mount, staggered per goal (delay) — data arriving, not lighting up. */
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

/* --- The Chords tab centerpiece: a soft "browse chords" app window. --- */
export function ChordsMockup({ chords }: { chords: ChordDefinition[] }) {
  const shown = chords.slice(0, 6);
  return (
    <div className={`mx-auto w-full overflow-hidden rounded-[1.6rem] ${CHROME} ${SOFT_SHADOW} transition-transform duration-300 hover:-translate-y-1`}>
      <WindowChrome url="studycircle.app/chords" />
      <div className="bg-[#0f0d16]/70 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className={TITLE}>Pick a chord</p>
            <p className={LABEL}>{chords.length} chords are live right now</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/70">
            Filters
            <ChevronDown size={12} strokeWidth={2.25} aria-hidden="true" />
          </span>
        </div>
        <div className="mt-3 space-y-2">
          {shown.map((chord, index) => {
            const meta = chordMeta(chord);
            return (
              <div
                key={chord.id}
                className="flex items-center gap-3 rounded-2xl bg-white/[0.05] px-3.5 py-3 animate-fade-up"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: chord.color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-paper">{chord.name}</p>
                  <p className={`truncate ${LABEL}`}>
                    {meta.points} points · {meta.members} members
                  </p>
                </div>
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#b7aaff]"
                  aria-hidden="true"
                >
                  <ArrowUpRight size={13} strokeWidth={2.25} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* --- The Points tab centerpiece: the point card as its own app window. --- */
export function PointMockup({ chord }: { chord: ChordDefinition }) {
  return (
    <div className={`w-full overflow-hidden rounded-[1.6rem] ${CHROME} ${SOFT_SHADOW} transition-transform duration-300 hover:-translate-y-1`}>
      <WindowChrome url={`studycircle.app/${chord.id}/points`} />
      <div className="space-y-3.5 bg-[#0f0d16]/70 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full" style={{ backgroundColor: chord.color }} />
            <span className="text-[13px] font-semibold text-paper">{FACTS.point}</span>
          </div>
          <span className="rounded-full bg-[#8b7ff7]/20 px-2.5 py-1 text-[10px] font-semibold text-[#b7aaff] animate-pulse">Recruiting</span>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.05] px-4 py-3">
          <Clock size={16} strokeWidth={2.25} className="shrink-0 text-[#b7aaff]" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold text-paper">{FACTS.schedule}</p>
            <p className={LABEL}>your timezone · repeats weekly</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex -space-x-1.5">
            <AvatarChip name="Sam" color="#4f7cf0" />
            <AvatarChip name="Ana" color="#22a58a" />
            <AvatarChip name="Mei" color="#f0a03c" />
            <AvatarChip name="Lex" color="#e2578a" />
            {/* a member who is literally the brand */}
            <Mascot mood="wink" className="relative z-10 size-5 -scale-x-100 drop-shadow-sm" />
          </span>
          <span className={LABEL}>
            {FACTS.members} members · {FACTS.moderators} moderator
          </span>
        </div>

        <div className="rounded-2xl bg-white/[0.05] p-4">
          <p className={LABEL}>Upcoming session</p>
          <p className="mt-1 text-3xl font-semibold leading-none text-paper">
            1<span className="text-lg text-white/45">d</span>
            <span className="ml-2">21</span><span className="text-lg text-white/45">h</span>
          </p>
          <p className={`mt-1.5 ${MICRO}`}>Set your goal before then.</p>
        </div>

        <div className="space-y-2.5">
          {FACTS.goals.map((goal, goalIndex) => (
            <GoalRow key={goal.label} label={goal.label} value={goal.value} delay={goalIndex * 140} />
          ))}
        </div>

        <span className="inline-flex items-center gap-2.5 rounded-full bg-white py-1 pl-1 pr-4 shadow-[0_16px_32px_-16px_rgba(0,0,0,0.6)]">
          <span className="flex size-7 items-center justify-center rounded-full bg-mint text-white" aria-hidden="true">
            <ArrowRight size={13} strokeWidth={2.5} />
          </span>
          <span className="text-xs font-bold text-ink">Join this point</span>
        </span>
      </div>
    </div>
  );
}

/* --- The Progress tab centerpiece: the dashboard as its own app window. --- */

const WEEK_BARS = [
  28, 42, 34, 55, 38, 60, 44, 36, 52, 58, 46, 64, 40, 70, 52, 44, 58, 36, 66, 50,
  62, 48, 72, 56, 46, 60, 68, 74,
];
const STREAK_BARS = [10, 16, 22, 14, 26, 20];

/* Speaker: one bar per day, four labelled weeks of seven bars. */
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

export function DashboardMockup() {  return (
    <div className={`w-full overflow-hidden rounded-[1.6rem] ${CHROME} ${SOFT_SHADOW} transition-transform duration-300 hover:-translate-y-1`}>
      <WindowChrome url="studycircle.app/dashboard" />
      <div className="grid gap-3 bg-[#0f0d16]/70 p-3.5 sm:p-4 md:grid-cols-12">
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

        {/* Streak */}
        <div className={`${CARD} md:col-span-4`}>
          <div className="flex items-center justify-between">
            <p className={LABEL}>Current streak</p>
            <span className="rounded-full bg-mint/20 px-2 py-0.5 text-[10px] font-semibold text-mint animate-pulse">
              +1 wk
            </span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="flex items-end gap-1.5">
              <DotDigits value={String(FACTS.streak)} className="h-9 w-auto text-paper" />
            </div>
            <MiniBars />
          </div>
          <p className={`mt-2 border-t border-white/10 pt-2 ${MICRO}`}>
            Personal best: {FACTS.personalBest} weeks — see the six straight below.
          </p>
        </div>

        {/* Goals set at check-in — same GoalRow component as the point card */}
        <div className={`${CARD} space-y-3 md:col-span-8`}>
          <div className="flex items-baseline justify-between gap-3">
            <p className={TITLE}>This week&apos;s goals</p>
            <span className={LABEL}>set at the Sunday check-in · avg {AVERAGE_GOAL}%</span>
          </div>
          {FACTS.goals.map((goal, goalIndex) => (
            <GoalRow key={goal.label} label={goal.label} value={goal.value} delay={goalIndex * 140} />
          ))}
        </div>

        {/* Attendance: one cell per weekly meetup — 5-week run, one miss, 6 straight */}
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

        {/* Next meetup strip — same pill grammar as "Join this point" */}
        <div className={`${CARD} flex flex-wrap items-center justify-between gap-3 !px-4 !py-3 md:col-span-12`}>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-mint text-white" aria-hidden="true">
              <Clock size={16} strokeWidth={2.25} />
            </span>
            <div>
              <p className="text-xs font-bold text-paper">Next meetup · {FACTS.time}</p>
              <p className={LABEL}>
                {FACTS.point} · {FACTS.members} members
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2.5 rounded-full bg-white py-1 pl-1 pr-4 shadow-[0_16px_32px_-16px_rgba(0,0,0,0.6)]">
            <span className="flex size-7 items-center justify-center rounded-full bg-mint text-white" aria-hidden="true">
              <ArrowRight size={13} strokeWidth={2.5} />
            </span>
            <span className="text-xs font-bold text-ink">Join the session</span>
          </span>
        </div>
      </div>
    </div>
  );
}
