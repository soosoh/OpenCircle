"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
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
import { ChordCarousel } from "@/components/landing/ChordCarousel";
import { CampusHorizon } from "@/components/landing/campus";
import { ChordsMockup, DashboardMockup, DotDigits, PointMockup } from "@/components/landing/mockups";
import { FACTS, AVERAGE_GOAL } from "@/components/landing/facts";
import { Mascot, MascotCrowd } from "@/components/landing/mascot";
import type { ChordDefinition } from "@/config/chords";

/**
 * The info-only landing page: four tabs over the night canvas. One material
 * system everywhere — charcoal glass panels (translucent) on the canvas, solid
 * deep frame at the end, white reserved for primary pills and the active tab.
 * The app "screenshots" use the same grammar so the page reads as one product.
 */

type TabId = "circle" | "chords" | "points" | "progress";

const TABS: { id: TabId; label: string }[] = [
  { id: "circle", label: "The Circle" },
  { id: "chords", label: "Chords" },
  { id: "points", label: "Points" },
  { id: "progress", label: "Progress" },
];

/* Night-glass elevation: panels drift above the canvas; shadow is dark, not violet. */
const SOFT_SHADOW = "shadow-[0_40px_80px_-36px_rgba(0,0,0,0.6)]";
const PANEL = `rounded-[2rem] border border-white/10 bg-white/[0.05] backdrop-blur ${SOFT_SHADOW}`;
const GLASS = `rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur ${SOFT_SHADOW}`;

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-white text-ink shadow-[0_10px_24px_-10px_rgba(139,127,247,0.65)]"
          : "text-white/55 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function GetStartedButton() {
  return (
    <Link
      href="/login"
      className="group inline-flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-6 font-semibold text-ink shadow-[0_20px_40px_-16px_rgba(0,0,0,0.7)] transition-transform hover:-translate-y-0.5"
    >
      <span
        className="flex size-9 items-center justify-center rounded-full bg-mint text-white transition-transform duration-200 group-hover:translate-x-0.5"
        aria-hidden="true"
      >
        <ArrowRight size={16} strokeWidth={2.5} />
      </span>
      Get started
    </Link>
  );
}

function Callout({ title, body, color, icon: Icon }: { title: string; body: string; color: string; icon: LucideIcon }) {
  return (
    <div className={`p-5 transition-transform duration-200 hover:-translate-y-1 ${GLASS}`}>
      <div className="flex items-center gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full"
          style={{ color, backgroundColor: `${color}22` }}
          aria-hidden="true"
        >
          <Icon size={17} strokeWidth={2} />
        </span>
        <p className="font-bold text-paper">{title}</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/60">{body}</p>
    </div>
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

/* Floating stat card — pinned to the orb like a sticker. Near-solid night
   material, NOT translucent glass: the bright orb behind must never wash the
   type out (white/55 on milk-glass was unreadable). */
function FloatCard({
  label,
  status,
  value,
  unit,
  icon: Icon,
  color,
}: {
  label: string;
  status: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#171226]/95 p-4 shadow-[0_24px_44px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold text-paper">{label}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-white/60">{status}</p>
        </div>
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-full"
          style={{ color, backgroundColor: `${color}26` }}
          aria-hidden="true"
        >
          <Icon size={12} strokeWidth={2.25} />
        </span>
      </div>
      {/* Numbers lead cards in the dashboards' dot-matrix style, everywhere. */}
      <div className="mt-2.5 flex items-end gap-1.5">
        <DotDigits value={value} className="h-7 w-auto text-paper" />
        <span className="pb-0.5 text-xs font-medium text-white/55">{unit}</span>
      </div>
    </div>
  );
}

/* Glossy soft orb: a moon over the night canvas. */
function CircleGlyph({ chords }: { chords: ChordDefinition[] }) {
  const chords7 = chords.slice(0, 7);
  return (
    <svg viewBox="0 0 240 240" className="h-auto w-full drop-shadow-[0_36px_60px_rgba(110,92,255,0.28)]" role="img" aria-label="A circle with chords: each subject connects two points">
      <defs>
        <radialGradient id="orb-body" cx="38%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="48%" stopColor="#f4f1fc" />
          <stop offset="100%" stopColor="#c9bff0" />
        </radialGradient>
        <radialGradient id="orb-spec" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="120" r="104" fill="url(#orb-body)" />
      <circle cx="120" cy="120" r="104" fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.5" />
      <ellipse cx="92" cy="80" rx="52" ry="30" fill="url(#orb-spec)" opacity="0.7" />
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
            {/* Each chord draws itself in when the section mounts, its node
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
      {/* The brand mark itself, drawn small: a violet circle with one chord
          across it — same construction as the header logo, one size up. */}
      <g
        className="[transform-box:fill-box] [transform-origin:center] animate-pop"
        style={{ animationDelay: "950ms" }}
      >
        <circle cx="120" cy="120" r="20" fill="#8b7ff7" />
        <line x1="105" y1="126" x2="134" y2="114" stroke="#151223" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="105" cy="126" r="2.6" fill="#151223" />
        <circle cx="134" cy="114" r="2.6" fill="#151223" />
      </g>
    </svg>
  );
}

const FLOAT_CARD_A = {
  label: "Point streak",
  status: "12 meetups, one missed",
  value: String(FACTS.streak),
  unit: "wks",
  icon: Flame,
  color: "#f0a03c",
};
const FLOAT_CARD_B = {
  label: "Goal progress",
  status: "set at the Sunday check-in",
  value: String(AVERAGE_GOAL),
  unit: "%",
  icon: CalendarCheck,
  color: "#a5b4fc",
};

export function LandingTabs({ chords }: { chords: ChordDefinition[] }) {
  const [tab, setTab] = useState<TabId>("circle");
  const chemistry = chords.find((chord) => chord.id === "chemistry") ?? chords[0];

  return (
    <div className="full-bleed -my-8 dream px-3 pb-10 sm:px-5">
      {/* The campus at night — the page's entire background, behind every panel. */}
      <CampusHorizon />

      {/* Floating tab bar */}
      <div className="sticky top-[52px] z-30 py-2.5">
        <div role="tablist" aria-label="Landing page sections" className="mx-auto flex w-fit max-w-full justify-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.06] p-1.5 shadow-[0_14px_34px_-16px_rgba(0,0,0,0.65)] backdrop-blur no-scrollbar">
          {TABS.map((t) => (
            <TabButton key={t.id} label={t.label} active={t.id === tab} onClick={() => setTab(t.id)} />
          ))}
        </div>
      </div>

      <div key={tab} role="tabpanel" className="animate-fade-up">
        <div className="mx-auto max-w-6xl space-y-5">
          {tab === "circle" && (
            <>
              {/* Hero */}
              <section className="grid items-center gap-12 px-4 pb-6 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-14">
                <div className="text-center lg:text-left">
                  <h1 className="text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                    <span className="font-medium text-white/40">Make progress</span>{" "}
                    <span className="font-semibold text-white">together.</span>
                    <span className="block font-serif font-medium italic text-mint">every week.</span>
                  </h1>
                  <p className="mx-auto mt-6 max-w-md text-base text-white/60 sm:text-lg lg:mx-0">
                    Pick a subject, join a point that meets when you actually can, and let a few people notice the week
                    you slip.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                    <GetStartedButton />
                    <button
                      type="button"
                      onClick={() => setTab("progress")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white/70 backdrop-blur transition-colors hover:text-white"
                    >
                      Look around first
                    </button>
                  </div>
                </div>

                <div className="relative mx-auto w-full max-w-[360px]">
                  {/* Orb and rider drift together on one slow tide; the stat
                      cards stay pinned to the frame — a moon moving behind
                      its stickers. */}
                  <div className="relative animate-drift">
                    <Mascot
                      mood="happy"
                      color="#e2578a"
                      label="A round friend sitting on the circle"
                      className="absolute -top-[27px] left-1/2 z-10 size-14 -translate-x-1/2 animate-bob [animation-delay:-1.2s] drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]"
                    />
                    <CircleGlyph chords={chords} />
                  </div>
                  <div className="absolute -right-4 top-2 w-[44%] max-w-[200px] animate-bob [animation-delay:-1.3s] sm:-right-8">
                    <FloatCard {...FLOAT_CARD_A} />
                  </div>
                  <div className="absolute -left-4 bottom-6 w-[44%] max-w-[200px] animate-bob [animation-delay:-3.6s] sm:-left-8">
                    <FloatCard {...FLOAT_CARD_B} />
                  </div>
                </div>
              </section>

              {/* Chord carousel — night glass strip holding the lit chips */}
              <section className="relative px-1">
                {/* One more friend perched on the subject band, watching the chips go by */}
                <Mascot
                  mood="happy"
                  color="#22a58a"
                  className="absolute -top-5 right-7 z-10 hidden size-9 animate-bob [animation-delay:-0.9s] sm:block"
                />
                <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-2.5 backdrop-blur shadow-[0_24px_50px_-26px_rgba(0,0,0,0.55)]">
                  <ChordCarousel chords={chords} />
                </div>
              </section>

              {/* Mascot band — the crowd: you never study alone here. */}
              <section className={`px-7 py-10 sm:px-12 sm:py-12 ${PANEL}`}>
                <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 sm:flex-row sm:gap-6">
                  <div className="pr-0 sm:pr-10 lg:pr-14">
                    <MascotCrowd className="size-32" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-paper sm:text-3xl">You don&apos;t do this alone here.</h2>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
                      StudyCircle is a social accountability platform. Subjects become chords inside the circle, and each
                      chord holds small weekly groups — points — that meet, review goals, and help each other finish what
                      they start. No grades, no leaderboards. Just people who notice when you fall behind.
                    </p>
                    <button
                      type="button"
                      onClick={() => setTab("chords")}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#b7aaff] hover:underline"
                    >
                      <GraduationCap size={16} strokeWidth={2} aria-hidden="true" />
                      See how we do it
                    </button>
                  </div>
                </div>
              </section>

              {/* The send-off: big CTA + full footer live HERE, on the Circle
                  tab — the tour tabs get a slim sign-off instead, so no slide
                  repeats the same speech. */}
              <section className="relative">
                {/* Seconds before you scroll away, the mascot peeks over the edge. */}
                <Mascot
                  mood="wink"
                  color="#22a58a"
                  className="absolute -top-10 left-10 z-0 hidden size-16 animate-bob [animation-delay:-2.9s] sm:block"
                />
                <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/10 bg-[#13101d] text-paper shadow-[0_50px_100px_-40px_rgba(0,0,0,0.8)]">
                  <div className="starfield relative px-6 pb-4 pt-16 text-center sm:px-10">
                    <span className="starfield pointer-events-none absolute inset-0 animate-twinkle" aria-hidden="true" />
                    <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                      Start inside a circle.
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-sm text-white/60 sm:text-base">
                      You bring the goal; the point brings the Sunday. That&apos;s the whole trick.
                    </p>
                    <div className="mt-8 pb-4">
                      <GetStartedButton />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 px-6 pb-10 text-sm sm:grid-cols-4 sm:px-10">
                    <div>
                      <p className="font-semibold text-white/90">About</p>
                      <ul className="mt-3 space-y-2 text-white/55">
                        <li><button type="button" className="hover:text-white" onClick={() => setTab("circle")}>Mission</button></li>
                        <li><button type="button" className="hover:text-white" onClick={() => setTab("chords")}>Chords</button></li>
                        <li><button type="button" className="hover:text-white" onClick={() => setTab("points")}>Points</button></li>
                        <li><button type="button" className="hover:text-white" onClick={() => setTab("points")}>Moderators</button></li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-white/90">Product</p>
                      <ul className="mt-3 space-y-2 text-white/55">
                        <li><button type="button" className="hover:text-white" onClick={() => setTab("progress")}>Dashboard preview</button></li>
                        <li><button type="button" className="hover:text-white" onClick={() => setTab("chords")}>Browse chords</button></li>
                        <li><Link href="/login" className="hover:text-white">Log in</Link></li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-white/90">How it works</p>
                      <ul className="mt-3 space-y-2 text-white/55">
                        <li><button type="button" className="hover:text-white" onClick={() => setTab("points")}>A week in a point</button></li>
                        <li><button type="button" className="hover:text-white" onClick={() => setTab("progress")}>Check-ins</button></li>
                        <li><button type="button" className="hover:text-white" onClick={() => setTab("circle")}>FAQ</button></li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-white/90">In short</p>
                      <ul className="mt-3 space-y-2 text-white/55">
                        <li>Circle = the platform</li>
                        <li>Chord = a subject community</li>
                        <li>Point = a weekly study group</li>
                      </ul>
                    </div>
                  </div>

                  <p className="border-t border-white/10 px-6 py-6 text-center text-xs text-white/45">
                    © 2026 StudyCircle · your point is expecting you.
                  </p>
                </div>
              </section>
            </>
          )}

          {tab === "chords" && (
            <>
              <section className="px-4 pt-8 text-center sm:px-6">
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  Subject communities,
                  <span className="block font-serif font-medium italic text-mint">poured into every circle.</span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
                  A chord is a subject community — everything about one subject lives inside it: its members, its
                  points, and its weekly rhythm. Join a chord, then find the point that fits.
                </p>
                <div className="mt-5 flex justify-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-white/75 backdrop-blur">
                    <LiveDot />
                    Live on the circle right now
                  </span>
                </div>
              </section>

              <section className="mx-auto grid max-w-6xl items-center gap-5 px-1 pb-2 lg:grid-cols-[minmax(0,230px)_minmax(0,1fr)_minmax(0,230px)]">
                <div className="order-2 space-y-4 lg:order-none">
                  <Callout title="Browse, commit, belong" body="Every chord shows its live points, so you can join the group that meets when you actually can." color="#8b7ff7" icon={BookOpen} />
                  <Callout title="In-circle goals" body="Goals are set inside points, and everyone in the chord can see them taking shape." color="#22a58a" icon={CheckCircle} />
                </div>
                <div className="order-1 relative px-2 lg:order-none lg:px-0">
                  <Mascot
                    mood="happy"
                    className="absolute -left-5 -top-9 z-10 hidden size-16 rotate-[-8deg] animate-bob [animation-delay:-0.4s] sm:block"
                  />
                  {/* A friend perched on the browse window's frame */}
                  <Mascot
                    mood="happy"
                    color="#e2578a"
                    className="absolute -top-6 right-3 z-10 hidden size-10 animate-bob [animation-delay:-2.5s] sm:block"
                  />
                  <ChordsMockup chords={chords} />
                </div>
                <div className="order-3 space-y-4 lg:order-none">
                  <Callout title="Age-appropriate by design" body="Each chord carries an audience. College chords stay 18+, and member search respects it everywhere." color="#f0a03c" icon={Shield} />
                  <Callout title="Familiar communities" body="Biology, math, CS and more — chords grow from what people actually study." color="#e2578a" icon={Heart} />
                </div>
              </section>

              <section className={`relative p-2.5 ${PANEL}`}>
                {/* One more friend peeking over the audience card */}
                <Mascot
                  mood="peek"
                  color="#22a58a"
                  className="absolute -top-9 right-8 z-0 hidden size-16 animate-bob [animation-delay:-2.2s] sm:block"
                />
                <p className="px-5 pb-1 pt-4 text-center text-xl font-bold text-paper">Every chord knows its audience.</p>
                <div className="mt-2">
                  {[
                    { label: "All ages", body: "Open to everyone studying the subject.", icon: Users, color: "#22a58a" },
                    { label: "College · 18+", body: "For university-level work and study loads.", icon: GraduationCap, color: "#8b7ff7" },
                    { label: "High school", body: "For SAT prep and subjects tuned to teen schedules.", icon: School, color: "#f0a03c" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center gap-4 rounded-2xl px-4 py-4 transition-colors hover:bg-white/[0.04]"
                    >
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: row.color }}
                        aria-hidden="true"
                      >
                        <row.icon size={18} strokeWidth={2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-paper">{row.label}</p>
                        <p className="text-sm text-white/55">{row.body}</p>
                      </div>
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#b7aaff]" aria-hidden="true">
                        <ArrowUpRight size={14} strokeWidth={2.25} />
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {tab === "points" && (
            <>
              <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-2 pt-8 sm:px-6 lg:grid-cols-2 lg:gap-16">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    Meet weekly.
                    <span className="block font-serif font-medium italic text-mint">On everyone&apos;s schedule.</span>
                  </h2>
                  <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/60 sm:text-base">
                    A point is a small group inside a chord that meets at the same time every week. Points store a
                    repeating weekly schedule — weekday, time, your timezone — so the meetup is never a mystery.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    {[
                      { label: FACTS.time, icon: Clock, color: "#a5b4fc" },
                      { label: "Timezone aware", icon: Globe, color: "#22a58a" },
                      { label: "Repeats weekly", icon: Repeat, color: "#f0a03c" },
                    ].map((chip) => (
                      <span key={chip.label} className={`flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur ${SOFT_SHADOW}`}>
                        <chip.icon size={14} strokeWidth={2.25} style={{ color: chip.color }} aria-hidden="true" />
                        {chip.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="relative mx-auto w-full max-w-md">
                  {/* A friend sitting on the point card's window edge */}
                  <Mascot
                    mood="wink"
                    color="#f0a03c"
                    className="absolute -top-7 right-2 z-10 hidden size-12 animate-bob [animation-delay:-3.4s] sm:block"
                  />
                  <PointMockup chord={chemistry} />
                </div>
              </section>

              <section className={`relative px-8 py-10 sm:px-10 ${PANEL}`}>
                <Mascot
                  mood="wink"
                  className="absolute -top-11 left-1/2 hidden size-[4.5rem] -translate-x-1/2 animate-bob [animation-delay:-1.7s] sm:block"
                />
                <h3 className="text-center text-2xl font-bold text-paper">How a point works, week by week.</h3>
                <div className="relative mt-10">
                  <div aria-hidden="true" className="absolute left-[17%] right-[17%] top-5 hidden h-0.5 bg-white/15 sm:block" />
                  <ol className="grid gap-10 sm:grid-cols-3 sm:gap-6">
                    {[
                      { title: "Review last goals", body: "Say what you finished, what you struggled with, and where you need help." },
                      { title: "Set next goals", body: "Agree on one or two concrete objectives for the coming week." },
                      { title: "Show up", body: "The moderator records goals and checks in. Progress is visible to everyone." },
                    ].map((step, index) => (
                      <li key={step.title} className="group relative sm:text-center">
                        <span className="relative z-10 inline-flex size-10 items-center justify-center rounded-full border-2 border-[#8b7ff7] bg-white/[0.06] text-sm font-extrabold text-[#b7aaff] transition-all duration-200 group-hover:scale-110 group-hover:border-[#b7aaff] group-hover:bg-[#8b7ff7]/20">
                          {index + 1}
                        </span>
                        <p className="mt-3 font-bold text-paper">{step.title}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-white/60">{step.body}</p>
                      </li>
                    ))}
                  </ol>
                </div>
                <p className="mt-10 text-center text-sm text-white/45">
                  Exactly one moderator runs each point — chosen from subject familiarity, experience, and past success.
                </p>
              </section>
            </>
          )}

          {tab === "progress" && (
            <section className="relative">
              {/* The mascot standing on the dashboard panel's edge, cheering you on. */}
              <Mascot
                mood="cheer"
                className="absolute -top-10 right-8 z-0 hidden size-20 animate-bob [animation-delay:-0.8s] sm:block"
              />
              <div className={`relative z-10 px-6 pb-10 pt-12 sm:px-10 lg:px-12 ${PANEL}`}>
                <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
                  <div>
                    <h2 className="text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
                      The dashboard
                      <span className="block font-serif font-medium italic text-mint">you&apos;d wake up to.</span>
                    </h2>
                    <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/60 sm:text-base">
                      Goals, streaks, and upcoming meetups live in one place. When you fall behind, the right person
                      notices — your point&apos;s members see progress, and check-ins keep the week honest.
                    </p>
                    <ul className="mt-6 space-y-3 text-sm text-white/75">
                      <li className="flex gap-2.5">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-mint text-white" aria-hidden="true">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        Streaks count the weeks your point showed up — together.
                      </li>
                      <li className="flex gap-2.5">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-mint text-white" aria-hidden="true">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        Goal progress updates at every meetup, in front of everyone.
                      </li>
                      <li className="flex gap-2.5">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-mint text-white" aria-hidden="true">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        Fall behind? Adjust goals as a group — no shame, just support.
                      </li>
                    </ul>
                    <div className="mt-8">
                      <GetStartedButton />
                    </div>
                  </div>
                  <div className="relative">
                    {/* A friend perched on the dashboard window */}
                    <Mascot
                      mood="wink"
                      color="#22a58a"
                      className="absolute -top-6 right-4 z-10 hidden size-11 animate-bob [animation-delay:-4.1s] sm:block"
                    />
                    <DashboardMockup />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* On the tour tabs: a slim, quiet sign-off — the big send-off
              belongs to the Circle tab alone. */}
          {tab !== "circle" && (
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-2 pb-2 pt-4 text-xs text-white/40">
              <p>© 2026 StudyCircle · your point is expecting you.</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/55">
                <button type="button" className="transition-colors hover:text-white" onClick={() => setTab("circle")}>
                  Mission
                </button>
                <button type="button" className="transition-colors hover:text-white" onClick={() => setTab("points")}>
                  A week in a point
                </button>
                <button type="button" className="transition-colors hover:text-white" onClick={() => setTab("progress")}>
                  Dashboard preview
                </button>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 font-semibold text-white/75 transition-colors hover:text-white"
                >
                  Start inside a circle
                  <ArrowRight size={12} strokeWidth={2.5} aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
