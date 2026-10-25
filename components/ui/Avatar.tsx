/** Circular initials avatar. `color` is the user's avatarColor. */
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
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${className}`}
      style={{ width: size, height: size, backgroundColor: color, fontSize: Math.round(size * 0.38) }}
    >
      {initials}
    </span>
  );
}

export function AvatarStack({ people, size = 32 }: { people: { name: string; avatarColor: string }[]; size?: number }) {
  return (
    <div className="flex -space-x-2">
      {people.slice(0, 5).map((person) => (
        <Avatar
          key={person.name}
          name={person.name}
          color={person.avatarColor}
          size={size}
          className="ring-2 ring-surface"
        />
      ))}
      {people.length > 5 ? (
        <span
          className="inline-flex items-center justify-center rounded-full bg-mist font-semibold text-muted ring-2 ring-surface"
          style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
        >
          +{people.length - 5}
        </span>
      ) : null}
    </div>
  );
}
