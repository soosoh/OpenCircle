"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle,
  Clock,
  Flame,
  Globe,
  GraduationCap,
  Heart,
  Repeat,
  School,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChordCarousel } from "@/components/landing/ChordCarousel";
import { CampusHorizon, CampusSky } from "@/components/landing/campus";
import { FACTS } from "@/components/landing/facts";
import {
  ChordsMockup,
  DashboardHomeMockup,
  DotDigits,
  MomentumCard,
  PointMockup,
  ShowingUpCard,
  SpeechBubble,
  StreakCard,
  type LandingPanel,
} from "@/components/landing/mockups";
import { Mascot, MascotCrowd } from "@/components/landing/mascot";
import type { ChordDefinition } from "@/config/chords";

/**
 * The landing page: one yellow hero band with the campus on its floor, then a
 * paper page whose tab bar stays under the header. Panels are normal page
 * bodies — white cards, plain sections, one pale wash band each — so the app
 * screenshots read as windows into the product rather than more yellow field.
 */

type TabId = "circle" | "chords" | "points" | "progress";

const TABS: { id: TabId; label: string }[] = [
  { id: "circle", label: "The Circle" },
  { id: "chords", label: "Chords" },
  { id: "points", label: "Points" },
  { id: "progress", label: "Progress" },
];

const H2 = "font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl";
const BODY = "mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base";

function TabButton({
  id,
  label,
  active,
  onClick,
}: {
  id: TabId;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`landing-tab-${id}`}
      aria-selected={active}
      aria-controls="landing-panel"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors duration-200 sm:px-5 sm:py-2.5 ${
        active ? "bg-ink text-white" : "text-muted hover:bg-sun-wash hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

/* Live-status dot: a soft radar ping, the way uiverse does presence chips. */
function LiveDot() {
  return (
    <span className="relative flex size-2" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
      <span className="relative inline-flex size-2 rounded-full bg-mint" />
    </span>
  );
}

/* A quiet white card beside the chords window. */
function Callout({ title, body, icon: Icon }: { title: string; body: string; icon: LucideIcon }) {
  return (
    <Card className="h-full">
      <span
        className="flex size-9 items-center justify-center rounded-full bg-sun-soft text-ink"
        aria-hidden="true"
      >
        <Icon size={17} strokeWidth={2} />
      </span>
      <p className="mt-3 font-display text-base font-bold tracking-tight text-ink">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
    </Card>
  );
}

/* Floating stat card — pinned to the circle like a sticker. Solid white so the
   yellow field cannot wash the type out. */
function FloatCard({
  label,
  status,
  value,
  unit,
  icon: Icon,
}: {
  label: string;
  status: string;
  value: string;
  unit: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-ink">{label}</p>
          <p className="mt-0.5 text-[10px] leading-snug text-muted">{status}</p>
        </div>
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sun-soft text-ink"
          aria-hidden="true"
        >
          <Icon size={12} strokeWidth={2.25} />
        </span>
      </div>
      <div className="mt-2.5 flex items-end gap-1.5">
        <DotDigits value={value} className="h-7 w-auto text-ink" />
        <span className="pb-0.5 text-[11px] font-medium text-muted">{unit}</span>
      </div>
    </div>
  );
}

/* Flat cream-and-ochre circle: chords draw themselves across it. No glow. */
function CircleGlyph({ chords }: { chords: ChordDefinition[] }) {
  const chords7 = chords.slice(0, 7);
  return (
    <svg
      viewBox="0 0 240 240"
      className="h-auto w-full"
      role="img"
      aria-label="A circle with chords: each subject connects two points"
    >
      <circle cx="120" cy="120" r="104" fill="#FFF7DF" stroke="#29313D" strokeOpacity="0.12" strokeWidth="1.5" />
      <circle cx="120" cy="120" r="86" fill="#E9BE3F" stroke="#29313D" strokeOpacity="0.12" strokeWidth="1.5" />
      {chords7.map((chord, index) => {
        const angleA = (index / chords7.length) * Math.PI * 2 - Math.PI / 2;
        const angleB = ((index + 1) / chords7.length) * Math.PI * 2 - Math.PI / 2;
        const point = (angle: number) => ({
          x: 120 + 74 * Math.cos(angle),
          y: 120 + 74 * Math.sin(angle),
        });
        const start = point(angleA);
        const end = point(angleB);
        return (
          <g key={chord.id}>
            {/* Each chord draws itself in when the panel mounts, its node
                popping at the start — the circle visibly "gets built". */}
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={chord.color}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.9}
              pathLength={1}
              strokeDasharray={1}
              className="animate-draw"
              style={{ animationDelay: `${index * 110}ms` }}
            />
            <circle
              cx={start.x}
              cy={start.y}
              r={5}
              fill={chord.color}
              className="[transform-box:fill-box] [transform-origin:center] animate-pop"
              style={{ animationDelay: `${index * 110}ms` }}
            />
          </g>
        );
      })}
      {/* The brand mark itself, drawn small: an ink circle with one chord
          across it — same construction as the header logo, one size up. */}
      <g
        className="[transform-box:fill-box] [transform-origin:center] animate-pop"
        style={{ animationDelay: "950ms" }}
      >
        <circle cx="120" cy="120" r="20" fill="#29313D" />
        <line x1="105" y1="126" x2="134" y2="114" stroke="#F4D35E" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="105" cy="126" r="2.6" fill="#F4D35E" />
        <circle cx="134" cy="114" r="2.6" fill="#F4D35E" />
      </g>
    </svg>
  );
}

type TabProps = {
  panel: LandingPanel;
  chords: ChordDefinition[];
  onTab: (tab: TabId) => void;
};

/* ------------------------------- The Circle ------------------------------- */

function CircleTab({ panel, chords, onTab }: TabProps) {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div className="min-w-0">
            <h2 className={H2}>This is your week.</h2>
            <p className={BODY}>
              After sign in you land on one page: your chords, your points, the goals you set together, and the next
              time your group meets.
            </p>
          </div>
          <div className="hidden items-end gap-2 sm:flex">
            <SpeechBubble
              side="right"
              title="Your chords, your points, goals set together."
              className="mb-1"
            />
            <Mascot
              mood="happy"
              color="#F4D35E"
              className="size-11 animate-bob [animation-delay:-1.9s]"
            />
          </div>
        </div>

        <div className="relative mt-7">
          <Mascot
            mood="peek"
            color="#C4462A"
            className="absolute -bottom-4 -left-2 z-10 hidden size-11 -scale-x-100 animate-bob [animation-delay:-2.6s] sm:block"
          />
          <DashboardHomeMockup panel={panel.dashboard} />
        </div>
      </section>

      {/* The one pale band on this tab: the live chord strip. */}
      <section className="full-bleed band-wash mt-14 border-y border-line">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Every subject has a chord.
            </h2>
            <Link
              href="/chords"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:underline"
            >
              Browse chords
              <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-4 rounded-2xl border border-line bg-surface px-2 py-2.5">
            <ChordCarousel chords={chords} />
          </div>
        </div>
      </section>

      {/* The crowd: a plain split, not another card grid. */}
      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-16">
        <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div className="rounded-[2rem] bg-mist px-6 py-10 sm:px-10">
            <MascotCrowd className="mx-auto size-40" />
          </div>
          <div>
            <h2 className={H2}>You don&apos;t do this alone.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              StudyCircle is a social accountability platform. Subjects become chords inside the circle, and each
              chord holds small weekly groups — points — that meet, review goals, and help each other finish what they
              start. No grades, no leaderboards. Just people who notice when you fall behind.
            </p>
            <button
              type="button"
              onClick={() => onTab("chords")}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:underline"
            >
              <GraduationCap size={16} strokeWidth={2} aria-hidden="true" />
              See how we do it
            </button>
          </div>
        </div>
      </section>

      {/* The send-off, dark so it closes the page without a second yellow field. */}
      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-16">
        <div className="rounded-[2rem] bg-ink px-6 py-12 text-center sm:px-12 sm:py-14">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start inside a circle.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
            You bring the goal; the point brings the Sunday. That&apos;s the whole trick.
          </p>
          <div className="mt-7 flex justify-center">
            <Button href="/login" size="lg">
              Get started
              <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* The quiet link index that used to sit inside the send-off card. */}
      <section className="mx-auto max-w-6xl px-4 pb-2 pt-14 sm:px-6">
        <div className="grid grid-cols-2 gap-8 border-t border-line pt-10 sm:grid-cols-4">
          <div>
            <p className="text-sm font-semibold text-ink">About</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><button type="button" className="hover:text-ink" onClick={() => onTab("circle")}>Mission</button></li>
              <li><button type="button" className="hover:text-ink" onClick={() => onTab("chords")}>Chords</button></li>
              <li><button type="button" className="hover:text-ink" onClick={() => onTab("points")}>Points</button></li>
              <li><button type="button" className="hover:text-ink" onClick={() => onTab("points")}>Moderators</button></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><button type="button" className="hover:text-ink" onClick={() => onTab("progress")}>Dashboard preview</button></li>
              <li><button type="button" className="hover:text-ink" onClick={() => onTab("chords")}>Browse chords</button></li>
              <li><Link href="/login" className="hover:text-ink">Log in</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">How it works</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><button type="button" className="hover:text-ink" onClick={() => onTab("points")}>A week in a point</button></li>
              <li><button type="button" className="hover:text-ink" onClick={() => onTab("progress")}>Check-ins</button></li>
              <li><button type="button" className="hover:text-ink" onClick={() => onTab("circle")}>FAQ</button></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">In short</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Circle = the platform</li>
              <li>Chord = a subject community</li>
              <li>Point = a weekly study group</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-xs text-muted">© 2026 StudyCircle · your point is expecting you.</p>
      </section>
    </>
  );
}

/* -------------------------------- The Chords ------------------------------- */

function ChordsTab({ panel, onTab }: TabProps) {
  const audiences = [
    { label: "All ages", body: "Open to everyone studying the subject.", icon: Users, tone: "bg-sun text-ink" },
    {
      label: "College · 18+",
      body: "For university-level work and study loads.",
      icon: GraduationCap,
      tone: "bg-coral text-white",
    },
    {
      label: "High school",
      body: "For SAT prep and subjects tuned to teen schedules.",
      icon: School,
      tone: "bg-ink text-white",
    },
  ];

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-12 text-center sm:px-6 sm:pt-16">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
          Every subject is a chord.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          A chord is a subject community — everything about one subject lives inside it: its members, its points, and
          its weekly rhythm. Join a chord, then find the point that fits.
        </p>
        <div className="mt-5 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink">
            <LiveDot />
            Live on the circle right now
          </span>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-start gap-6 px-4 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-8">
        <div className="relative">
          <Mascot
            mood="happy"
            color="#F4D35E"
            className="absolute -left-4 -top-7 z-10 hidden size-12 rotate-[-8deg] animate-bob [animation-delay:-0.4s] sm:block"
          />
          <ChordsMockup panel={panel.chords} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Callout
            title="Browse, commit, belong"
            body="Every chord shows its live points, so you can join the group that meets when you actually can."
            icon={BookOpen}
          />
          <Callout
            title="In-circle goals"
            body="Goals are set inside points, and everyone in the chord can see them taking shape."
            icon={CheckCircle}
          />
          <Callout
            title="Age-appropriate by design"
            body="Each chord carries an audience. College chords stay 18+, and member search respects it everywhere."
            icon={Shield}
          />
          <Callout
            title="Familiar communities"
            body="Biology, math, CS and more — chords grow from what people actually study."
            icon={Heart}
          />
        </div>
      </section>

      <section className="full-bleed band-wash mt-14 border-y border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Every chord has an audience.
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {audiences.map((row) => (
              <Card key={row.label} className="h-full">
                <span
                  className={`flex size-10 items-center justify-center rounded-full ${row.tone}`}
                  aria-hidden="true"
                >
                  <row.icon size={18} strokeWidth={2} />
                </span>
                <p className="mt-3 font-display text-base font-bold tracking-tight text-ink">{row.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{row.body}</p>
              </Card>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted">
            Audiences are enforced on join and on member search, so a point is always the room it says it is.
          </p>
        </div>
      </section>

      <SignOff onTab={onTab} />
    </>
  );
}

/* -------------------------------- The Points ------------------------------- */

function PointsTab({ panel, onTab }: TabProps) {
  const chips = [
    { label: FACTS.time, icon: Clock },
    { label: "Timezone aware", icon: Globe },
    { label: "Repeats weekly", icon: Repeat },
  ];
  const steps = [
    {
      title: "Review last goals",
      body: "Say what you finished, what you struggled with, and where you need help.",
    },
    {
      title: "Set next goals",
      body: "Agree on one or two concrete objectives for the coming week.",
    },
    {
      title: "Show up",
      body: "The moderator records goals and checks in. Progress is visible to everyone.",
    },
  ];

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-2 lg:gap-14">
        <div>
          <h2 className={H2}>Same time, every week.</h2>
          <p className={BODY}>
            A point is a small group inside a chord that meets at the same time every week. Points store a repeating
            weekly schedule — weekday, time, your timezone — so the meetup is never a mystery.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink"
              >
                <chip.icon size={14} strokeWidth={2.25} className="text-mint" aria-hidden="true" />
                {chip.label}
              </span>
            ))}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <Mascot
            mood="wink"
            color="#F4D35E"
            className="absolute -top-6 right-3 z-10 hidden size-11 animate-bob [animation-delay:-3.4s] sm:block"
          />
          <PointMockup panel={panel.point} />
        </div>
      </section>

      <section className="full-bleed band-wash mt-14 border-y border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            How a point works, week by week.
          </h2>
          <ol className="mt-7 grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-line bg-surface p-5">
                <span className="flex size-8 items-center justify-center rounded-full bg-sun text-sm font-bold text-ink">
                  {index + 1}
                </span>
                <p className="mt-3 font-display text-base font-bold tracking-tight text-ink">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
            Exactly one moderator runs each point — chosen from subject familiarity, experience, past group success,
            and reputation.
          </p>
        </div>
      </section>

      <SignOff onTab={onTab} />
    </>
  );
}

/* ------------------------------- The Progress ------------------------------ */

function ProgressTab({ onTab }: TabProps) {
  const checks = [
    "Streaks count the weeks your point showed up — together.",
    "Goal progress updates at every meetup, in front of everyone.",
    "Fall behind? Adjust goals as a group — no shame, just support.",
  ];

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <div>
            <h2 className={H2}>Your week, visible.</h2>
            <p className={BODY}>
              Goals, streaks, and upcoming meetups live in one place. When you fall behind, the right person notices —
              your point&apos;s members see progress, and check-ins keep the week honest.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-ink">
              {checks.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-mint text-white"
                    aria-hidden="true"
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button href="/login" size="lg">
                Get started
                <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="rounded-[2rem] bg-mist p-4 sm:p-5">
            <div className="space-y-3">
              <StreakCard />
              <ShowingUpCard />
            </div>
            <p className="mt-3 px-1 text-xs leading-relaxed text-muted">
              Every filled square is a meetup your point showed up for. A missed week stays visible — and fixable.
            </p>
          </div>
        </div>
      </section>

      <section className="full-bleed band-wash mt-14 border-y border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Momentum you can see.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              Each bar is a day your point could have met. Four weeks sit side by side, so a good run and a missed week
              are equally plain — no digging, no guessing.
            </p>
          </div>
          <MomentumCard />
        </div>
      </section>

      <SignOff onTab={onTab} />
    </>
  );
}

/* The tour tabs end quietly; the full send-off belongs to the Circle tab. */
function SignOff({ onTab }: { onTab: (tab: TabId) => void }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 pt-12 text-xs text-muted sm:px-6">
      <p>© 2026 StudyCircle · your point is expecting you.</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <button type="button" className="hover:text-ink" onClick={() => onTab("circle")}>
          Mission
        </button>
        <button type="button" className="hover:text-ink" onClick={() => onTab("points")}>
          A week in a point
        </button>
        <button type="button" className="hover:text-ink" onClick={() => onTab("progress")}>
          Dashboard preview
        </button>
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-semibold text-ink hover:underline"
        >
          Start inside a circle
          <ArrowUpRight size={12} strokeWidth={2.5} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export function LandingTabs({
  chords,
  initialTab,
  panel,
}: {
  chords: ChordDefinition[];
  initialTab?: TabId;
  /** The after-sign-in surfaces the windows preview, computed from the seed store. */
  panel: LandingPanel;
}) {
  // Deep-linkable tabs: /?tab=points shares, links, and restores a slide after
  // a reload. The panel still animates every internal switch.
  const [tab, setTab] = useState<TabId>(initialTab ?? "circle");

  return (
    <div className="full-bleed -my-8">
      {/* The page's one bold field: sky, copy, the circle, and the campus on
          its floor. The scene is sized so its crop only ever eats empty sky -
          the hills, roofs and trees are always whole. */}
      <section className="dream relative isolate overflow-hidden">
        <CampusSky />
        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-10 pb-[var(--scene-h)] sm:px-6 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4">
          <div className="text-center lg:text-left">
            <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Make progress, together.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-ink/75 sm:text-lg lg:mx-0">
              Pick a subject, join a point that meets when you actually can, and let a few people notice the week you
              slip.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Button href="/login" variant="ink" size="lg">
                Get started
                <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" />
              </Button>
              <Button type="button" variant="secondary" size="lg" onClick={() => setTab("progress")}>
                Look around first
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[340px]">
            {/* Circle and rider drift together on one slow tide; the stat cards
                stay pinned to the frame — a sun moving behind its stickers. */}
            <div className="relative animate-drift">
              <Mascot
                mood="happy"
                color="#F4D35E"
                label="A round friend sitting on the circle"
                className="absolute -top-[21px] left-1/2 z-10 size-12 -translate-x-1/2 animate-bob [animation-delay:-1.2s]"
              />
              <CircleGlyph chords={chords} />
            </div>
            <div className="absolute -right-3 top-1 hidden w-[46%] max-w-[176px] animate-bob [animation-delay:-1.3s] sm:block">
              <FloatCard
                label="Current streak"
                status="weeks in a row"
                value={String(FACTS.streak)}
                unit="wks"
                icon={Flame}
              />
            </div>
            <div className="absolute -left-3 bottom-4 hidden w-[46%] max-w-[176px] animate-bob [animation-delay:-3.6s] sm:block">
              <FloatCard
                label="Goal progress"
                status="set at the Sunday check-in"
                value={String(panel.dashboard.average)}
                unit="%"
                icon={CheckCircle}
              />
            </div>
          </div>
        </div>

        <CampusHorizon scene={tab} />
      </section>

      {/* The tab bar now lives on paper, pinned under the 60px header. */}
      <div className="sticky top-[var(--header-h)] z-30 border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-6xl justify-center px-4 py-3 sm:px-6">
          <div
            role="tablist"
            aria-label="Landing page sections"
            className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1.5 no-scrollbar"
          >
            {TABS.map((item) => (
              <TabButton
                key={item.id}
                id={item.id}
                label={item.label}
                active={item.id === tab}
                onClick={() => setTab(item.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        key={tab}
        id="landing-panel"
        role="tabpanel"
        aria-labelledby={`landing-tab-${tab}`}
        className="animate-fade-up bg-paper pb-16"
      >
        {tab === "circle" && <CircleTab panel={panel} chords={chords} onTab={setTab} />}
        {tab === "chords" && <ChordsTab panel={panel} chords={chords} onTab={setTab} />}
        {tab === "points" && <PointsTab panel={panel} chords={chords} onTab={setTab} />}
        {tab === "progress" && <ProgressTab panel={panel} chords={chords} onTab={setTab} />}
      </div>
    </div>
  );
}
