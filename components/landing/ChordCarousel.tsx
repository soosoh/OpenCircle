import type { ChordDefinition } from "@/config/chords";

/**
 * The chord carousel: a slow, endless marquee of subjects — the band feels
 * "live" the way a campus noticeboard does. Two identical tracks scroll as
 * one loop; hovering pauses it. The duplicate copy is hidden from screen
 * readers, and the reduced-motion floor stills it.
 */

function ChipTrack({ chords, hidden }: { chords: ChordDefinition[]; hidden?: boolean }) {
  return (
    <span className="flex shrink-0 items-center gap-3 pr-3" aria-hidden={hidden ? true : undefined}>
      {chords.map((chord) => (
        <span
          key={chord.id}
          className="flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-sm font-medium text-white/80 backdrop-blur transition-colors duration-300 hover:bg-white/[0.12]"
        >
          <span className="size-4 rounded-full border border-white/40" style={{ backgroundColor: chord.color }} />
          {chord.name}
        </span>
      ))}
    </span>
  );
}

export function ChordCarousel({ chords }: { chords: ChordDefinition[] }) {
  return (
    <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max items-center animate-marquee group-hover:[animation-play-state:paused]">
        <ChipTrack chords={chords} />
        <ChipTrack chords={chords} hidden />
      </div>
    </div>
  );
}
