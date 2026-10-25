import { ActionForm } from "@/components/ui/ActionForm";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GoalStatusBadge, PointStatusBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDateTime, formatTime, WEEKDAY_NAMES } from "@/lib/domain/time";
import type { ReactNode } from "react";
import type { Goal, HelpRequest, Point, User } from "@/types";
import { GoalForm } from "./GoalForm";
import { ProgressUpdateForm } from "./ProgressUpdateForm";

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
    <div className="space-y-10">
      {entries.map(({ point, chordName, members, goals, helpRequests, requesters, assistant }) => {
        const openRequests = helpRequests.filter((request) => request.status === "open");
        const resources = goals.flatMap((goal) =>
          goal.resources.map((resource, index) => ({
            id: `${goal.id}-${index}`,
            label: resource,
            goalTitle: goal.title,
          })),
        );

        return (
          <section key={point.id} className="space-y-5">
            <header className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted">
                  {chordName} · {WEEKDAY_NAMES[point.schedule.weekday] ?? "Weekly"} at{" "}
                  <span className="tnum">{formatTime(point.schedule.time, point.schedule.timezone)}</span>
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">{point.title}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <PointStatusBadge status={point.status} />
                <Badge tone="muted">
                  <span className="tnum">{members.length}</span> members
                </Badge>
                <Button href={`/points/${point.id}`} variant="secondary" size="sm" className="min-h-10">
                  Open point
                </Button>
              </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
              <div className="space-y-4 lg:col-span-7">
                <Card className="space-y-4">
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight text-ink">Member progress</h3>
                    <p className="mt-1 text-sm text-muted">
                      Reputation, latest goal, and how far each member has got.
                    </p>
                  </div>

                  {members.length === 0 ? (
                    <p className="text-sm text-muted">No members yet.</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {members.map((member) => {
                        const memberGoals = goals.filter((goal) => goal.assignments.some((a) => a.userId === member.id));
                        const latest = memberGoals[0];
                        const assignment = latest?.assignments.find((a) => a.userId === member.id);
                        const isModerator = member.id === point.moderatorId;

                        return (
                          <li key={member.id} className="rounded-xl border border-line bg-paper p-3">
                            <div className="flex items-start gap-3">
                              <Avatar name={member.name} color={member.avatarColor} size={36} />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate text-sm font-semibold text-ink">{member.name}</p>
                                  <Badge tone={isModerator ? "sun" : "muted"}>
                                    {isModerator ? "Moderator" : "Member"}
                                  </Badge>
                                  {assignment ? <GoalStatusBadge status={assignment.status} /> : null}
                                </div>
                                <p className="mt-0.5 truncate text-xs text-muted">
                                  {latest?.title ?? "No goals yet"}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="w-16 shrink-0 text-xs text-muted">Reputation</span>
                                  <ProgressBar value={member.reputation} label={`${member.name} reputation`} />
                                  <span className="tnum w-6 shrink-0 text-right text-xs text-muted">
                                    {member.reputation}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {assignment && latest ? (
                              <div className="mt-3 space-y-2 border-t border-line pt-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-16 shrink-0 text-xs text-muted">Goal</span>
                                  <ProgressBar value={assignment.progress} label={`${member.name} goal progress`} />
                                  <span className="tnum w-6 shrink-0 text-right text-xs font-semibold text-ink">
                                    {assignment.progress}%
                                  </span>
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
                              </div>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Card>

                <Card className="space-y-3">
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight text-ink">Recorded goals</h3>
                    <p className="mt-1 text-sm text-muted">The targets this point is working through.</p>
                  </div>
                  {goals.length === 0 ? (
                    <p className="text-sm text-muted">No goals recorded yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {goals.map((goal) => (
                        <li
                          key={goal.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-ink">{goal.title}</p>
                            <p className="mt-0.5 text-xs text-muted">
                              Due {formatDateTime(goal.deadline, timeZone)}
                            </p>
                          </div>
                          <GoalStatusBadge status={goal.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>

                <Card className="space-y-3">
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight text-ink">Resources</h3>
                    <p className="mt-1 text-sm text-muted">Handouts and links attached to this point&rsquo;s goals.</p>
                  </div>
                  {resources.length === 0 ? (
                    <p className="text-sm text-muted">Nothing shared yet. Add resources when you record a goal.</p>
                  ) : (
                    <ul className="space-y-2">
                      {resources.map((resource) => (
                        <li key={resource.id} className="rounded-xl border border-line bg-paper p-3">
                          {/^https?:\/\//.test(resource.label) ? (
                            <a
                              href={resource.label}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
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
                </Card>
              </div>

              <div className="space-y-4 lg:col-span-5">
                <Card className="space-y-4">
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight text-ink">Record a goal</h3>
                    <p className="mt-1 text-sm text-muted">One clear target, a deadline, and who it is for.</p>
                  </div>
                  <GoalForm action={createGoalAction.bind(null, point.id)} members={members} />
                </Card>

                <Card className="space-y-3">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-lg font-bold tracking-tight text-ink">Support requests</h3>
                      {openRequests.length > 0 ? <Badge tone="coral">{openRequests.length} open</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted">Members who asked for a hand.</p>
                  </div>

                  {openRequests.length === 0 ? (
                    <p className="text-sm text-muted">Nothing open right now.</p>
                  ) : (
                    <ul className="space-y-2">
                      {openRequests.map((request) => {
                        const requester = requesters.get(request.userId);
                        return (
                          <li
                            key={request.id}
                            className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-line bg-paper p-3"
                          >
                            <div className="flex min-w-0 flex-1 items-start gap-3">
                              {requester ? (
                                <Avatar name={requester.name} color={requester.avatarColor} size={28} />
                              ) : null}
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink">{requester?.name ?? "Member"}</p>
                                <p className="mt-0.5 text-sm leading-relaxed text-muted">{request.reason}</p>
                                <p className="mt-1 text-xs text-muted">{formatDateTime(request.createdAt, timeZone)}</p>
                              </div>
                            </div>
                            <ActionForm
                              action={resolveAction.bind(null, request.id)}
                              size="md"
                              variant="secondary"
                              pendingLabel="Resolving…"
                              className="shrink-0"
                            >
                              Resolve
                            </ActionForm>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Card>
              </div>
            </div>

            {assistant ? (
              <section className="space-y-3">
                <div>
                  <h3 className="font-display text-lg font-bold tracking-tight text-ink">Meeting notes and check-ins</h3>
                  <p className="mt-1 text-sm text-muted">
                    Turn a session into a summary, or ask which members may need a check-in.
                  </p>
                </div>
                {assistant}
              </section>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
