import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { Mascot } from "@/components/landing/mascot";
import { ActionForm } from "@/components/ui/ActionForm";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GoalStatusBadge, PointStatusBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDateTime, formatTime, WEEKDAY_NAMES } from "@/lib/domain/time";
import type { Goal, HelpRequest, Point, User } from "@/types";
import { GoalForm } from "./GoalForm";
import { ProgressUpdateForm } from "./ProgressUpdateForm";

/** White card with a Fraunces title and one line saying what it is for. */
function Panel({
  title,
  hint,
  badge,
  children,
  className = "",
}: {
  title: string;
  hint?: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-5 sm:p-6 ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-xl font-bold tracking-tight text-ink">{title}</h3>
          {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
        </div>
        {badge}
      </div>
      {children}
    </section>
  );
}

/** A designed "nothing here" row: small mascot, a sentence in ink. */
function Quiet({ title, hint, mood = "happy" }: { title: string; hint?: string; mood?: "happy" | "peek" }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-sun-wash px-4 py-3.5">
      <Mascot mood={mood} color="#2E7D5B" width={40} height={40} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {hint ? <p className="mt-0.5 text-sm leading-snug text-ink">{hint}</p> : null}
      </div>
    </div>
  );
}

/**
 * Moderator panels for one point: goal creation, member progress, shared
 * resources and support requests. Every action here re-checks that the viewer
 * moderates the point.
 */
export function ModeratorPanel({
  entries,
  timeZone,
  createGoalAction,
  updateProgressAction,
  resolveAction,
}: {
  entries: {
    point: Point;
    chordName: string;
    members: User[];
    goals: Goal[];
    helpRequests: HelpRequest[];
    requesters: Map<string, User>;
    assistant?: ReactNode;
  }[];
  timeZone: string;
  createGoalAction: (pointId: string, formData: FormData) => void | Promise<void>;
  updateProgressAction: (goalId: string, formData: FormData) => void | Promise<void>;
  resolveAction: (requestId: string) => void | Promise<void>;
}) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-14">
      {entries.map(({ point, chordName, members, goals, helpRequests, requesters, assistant }, index) => {
        const openRequests = helpRequests.filter((request) => request.status === "open");
        const resources = goals.flatMap((goal) =>
          goal.resources.map((resource, index) => ({
            id: `${goal.id}-${index}`,
            label: resource,
            goalTitle: goal.title,
          })),
        );

        return (
          // A native <details>: each point folds away with no script, and the open state is
          // left to the browser (the prop is constant, so a re-render never re-opens it).
          // Only the first point starts open so the rest are one glance away, not a scroll.
          <details key={point.id} open={index === 0} aria-labelledby={`point-${point.id}`} className="group">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 rounded-2xl [&::-webkit-details-marker]:hidden">
              <div className="flex min-w-0 items-center gap-4">
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-sun text-ink transition-transform duration-200 ease-out-quart group-open:rotate-180"
                >
                  <ChevronDown size={20} />
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink">
                    <span className="font-semibold">{chordName}</span>
                    <span className="rounded-full bg-sun-soft px-2.5 py-0.5 text-xs font-semibold">
                      {WEEKDAY_NAMES[point.schedule.weekday] ?? "Weekly"} at{" "}
                      <span className="tnum">{formatTime(point.schedule.time, point.schedule.timezone)}</span>
                    </span>
                  </p>
                  <h2 id={`point-${point.id}`} className="mt-1.5 font-display text-3xl font-bold tracking-tight text-ink">
                    {point.title}
                  </h2>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {openRequests.length > 0 ? (
                  <Badge tone="coral">
                    <span className="tnum">{openRequests.length}</span> open {openRequests.length === 1 ? "request" : "requests"}
                  </Badge>
                ) : null}
                <PointStatusBadge status={point.status} />
                <Badge tone="muted">
                  <span className="tnum">{members.length}</span> {members.length === 1 ? "member" : "members"}
                </Badge>
                <Button href={`/points/${point.id}`} variant="ink" size="md" className="min-h-11">
                  Open point
                </Button>
              </div>
            </summary>

            <div className="mt-5 space-y-5">
              <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
                <div className="space-y-4 lg:col-span-7">
                  <Panel title="Member progress" hint="Reputation, latest goal, and how far each member has got.">
                    {members.length === 0 ? (
                      <Quiet title="No members yet" hint="Members who join this point show up here." mood="happy" />
                    ) : (
                      <ul className="space-y-3">
                        {members.map((member) => {
                          const memberGoals = goals.filter((goal) => goal.assignments.some((a) => a.userId === member.id));
                          const latest = memberGoals[0];
                          const assignment = latest?.assignments.find((a) => a.userId === member.id);
                          const isModerator = member.id === point.moderatorId;

                          return (
                            <li key={member.id} className="rounded-xl border border-line bg-paper p-4">
                              <div className="flex items-start gap-3">
                                <Avatar name={member.name} color={member.avatarColor} size={40} />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate text-base font-semibold text-ink">{member.name}</p>
                                    <Badge tone={isModerator ? "sun" : "muted"}>{isModerator ? "Moderator" : "Member"}</Badge>
                                    {assignment ? <GoalStatusBadge status={assignment.status} /> : null}
                                  </div>
                                  <p className="mt-0.5 truncate text-sm text-muted">{latest?.title ?? "No goals yet"}</p>
                                </div>
                              </div>

                              <div className="mt-4 space-y-3 border-t border-line pt-4">
                                <div className="flex items-center gap-3">
                                  <span className="w-20 shrink-0 text-xs text-muted">Reputation</span>
                                  <ProgressBar value={member.reputation} label={`${member.name} reputation`} />
                                  <span className="tnum w-9 shrink-0 text-right text-sm font-bold text-ink">{member.reputation}</span>
                                </div>
                              {assignment && latest ? (
                                <>
                                  <div className="flex items-center gap-3">
                                    <span className="w-20 shrink-0 text-xs text-muted">Goal</span>
                                    <ProgressBar value={assignment.progress} label={`${member.name} goal progress`} />
                                    <span className="tnum w-9 shrink-0 text-right text-sm font-bold text-ink">{assignment.progress}%</span>
                                  </div>
                                  {isModerator ? null : (
                                    <ProgressUpdateForm
                                      action={updateProgressAction.bind(null, latest.id)}
                                      memberId={member.id}
                                      memberName={member.name}
                                      status={assignment.status}
                                      progress={assignment.progress}
                                    />
                                  )}
                                </>
                              ) : null}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </Panel>

                  <Panel title="Recorded goals" hint="The targets this point is working through.">
                    {goals.length === 0 ? (
                      <Quiet title="No goals recorded yet" hint="Record the first one with the form beside this list." mood="happy" />
                    ) : (
                      <ul className="space-y-2">
                        {goals.map((goal) => (
                          <li
                            key={goal.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-ink">{goal.title}</p>
                              <p className="mt-0.5 text-xs text-muted">Due {formatDateTime(goal.deadline, timeZone)}</p>
                            </div>
                            <GoalStatusBadge status={goal.status} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </Panel>

                  <Panel title="Resources" hint="Handouts and links attached to this point’s goals.">
                    {resources.length === 0 ? (
                      <Quiet title="Nothing shared yet" hint="Add resources when you record a goal." mood="happy" />
                    ) : (
                      <ul className="space-y-2">
                        {resources.map((resource) => (
                          <li key={resource.id} className="rounded-xl border border-line bg-paper px-4 py-3">
                            {/^https?:\/\//.test(resource.label) ? (
                              <a
                                href={resource.label}
                                target="_blank"
                                rel="noreferrer"
                                className="link break-all text-sm"
                              >
                                {resource.label}
                              </a>
                            ) : (
                              <p className="text-sm font-semibold text-ink">{resource.label}</p>
                            )}
                            <p className="mt-0.5 text-xs text-muted">{resource.goalTitle}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Panel>
                </div>

                <div className="space-y-4 lg:col-span-5">
                  <Panel
                    title="Support requests"
                    hint="Members who asked for a hand."
                    badge={openRequests.length > 0 ? <Badge tone="coral">{openRequests.length} open</Badge> : null}
                  >
                    {openRequests.length === 0 ? (
                      <Quiet title="All clear" hint="Nobody is waiting on you right now." />
                    ) : (
                      <ul className="space-y-2.5">
                        {openRequests.map((request) => {
                          const requester = requesters.get(request.userId);
                          return (
                            <li key={request.id} className="rounded-xl border border-line bg-sun-wash p-4">
                              <div className="flex items-start gap-3">
                                {requester ? <Avatar name={requester.name} color={requester.avatarColor} size={32} /> : null}
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-ink">{requester?.name ?? "Member"}</p>
                                  <p className="mt-1 text-sm leading-relaxed text-ink">{request.reason}</p>
                                  <p className="mt-1.5 text-xs text-muted">{formatDateTime(request.createdAt, timeZone)}</p>
                                </div>
                              </div>
                              <ActionForm
                                action={resolveAction.bind(null, request.id)}
                                size="md"
                                variant="secondary"
                                pendingLabel="Resolving…"
                                className="mt-3 [&_button]:min-h-10"
                              >
                                Mark resolved
                              </ActionForm>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </Panel>

                  <Panel title="Record a goal" hint="One clear target, a deadline, and who it is for.">
                    <GoalForm action={createGoalAction.bind(null, point.id)} members={members} />
                  </Panel>
                </div>
              </div>

              {assistant ? (
                <section aria-label="Meeting notes and check-ins" className="space-y-3 pt-2">
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight text-ink">Meeting notes and check-ins</h3>
                    <p className="mt-1 text-sm text-muted">
                      Turn a session into a summary, or ask which members may need a check-in.
                    </p>
                  </div>
                  {assistant}
                </section>
              ) : null}
            </div>
          </details>
        );
      })}
    </div>
  );
}
