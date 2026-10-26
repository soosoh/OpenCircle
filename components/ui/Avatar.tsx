
/** Circular initials avatar with a polished, consistent appearance. */
export function Avatar({
  name,
  color = "#29313D",
  size = 40,
  className = "",
}: {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0]?.toLocaleUpperCase() ?? "")
    .join("");

  const safeSize = Math.max(1, size);

  return (
    <span
      role="img"
      aria-label={name ? `${name} avatar` : "User avatar"}
      className={[
        "inline-flex shrink-0 select-none items-center justify-center",
        "overflow-hidden rounded-full",
        "font-semibold tracking-tight text-white",
        "ring-1 ring-inset ring-white/20",
        "shadow-sm",
        "transition-transform duration-200 ease-out",
        "hover:z-10 hover:scale-105",
        className,
      ].join(" ")}
      style={{
        width: safeSize,
        height: safeSize,
        backgroundColor: color,
        fontSize: Math.max(10, Math.round(safeSize * 0.36)),
        lineHeight: 1,
      }}
    >
      {initials || "?"}
    </span>
  );
}

type AvatarPerson = {
  name: string;
  avatarColor: string;
};

export function AvatarStack({
  people,
  size = 32,
}: {
  people: AvatarPerson[];
  size?: number;
}) {
  const visiblePeople = people.slice(0, 5);
  const remaining = Math.max(0, people.length - visiblePeople.length);
  const safeSize = Math.max(1, size);

  return (
    <div
      className="flex items-center pl-0.5"
      role="group"
      aria-label={`${people.length} ${people.length === 1 ? "person" : "people"}`}
    >
      {visiblePeople.map((person, index) => (
        <div
          key={`${person.name}-${index}`}
          className={[
            "relative shrink-0 rounded-full",
            "transition-transform duration-200 ease-out",
            "hover:z-20 hover:-translate-y-0.5",
            index > 0 ? "-ml-2" : "",
          ].join(" ")}
          style={{ zIndex: visiblePeople.length - index }}
        >
          <Avatar
            name={person.name}
            color={person.avatarColor}
            size={safeSize}
            className="ring-2 ring-surface"
          />
        </div>
      ))}

      {remaining > 0 && (
        <span
          aria-label={`${remaining} more ${remaining === 1 ? "person" : "people"}`}
          className={[
            "relative inline-flex shrink-0 items-center justify-center",
            "-ml-2 rounded-full",
            "border-2 border-surface",
            "bg-mist font-semibold tracking-tight text-muted",
            "shadow-sm transition-colors duration-200",
          ].join(" ")}
          style={{
            width: safeSize,
            height: safeSize,
            fontSize: Math.max(10, Math.round(safeSize * 0.31)),
            lineHeight: 1,
            zIndex: 0,
          }}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
