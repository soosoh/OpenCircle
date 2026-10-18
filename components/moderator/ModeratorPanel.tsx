import { ActionForm } from "@/components/ui/ActionForm";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { GoalStatusBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDateTime } from "@/lib/domain/time";
import type { Goal, HelpRequest, Point, User } from "@/types";

/**
 * Moderator panel: student progress plus the goal recorder, grouped per point.
 * Every action here re-checks that the viewer moderates the point.
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
    members: User[];
    goals: Goal[];
    helpRequests: HelpRequest[];
    requesters: Map<string, User>;
  }[];
  timeZone: string;
  createGoalAction: (pointId: string, formData: FormData) => void | Promise<void>;
  updateProgressAction: (goalId: string, formData: FormData) => void | Promise<void>;
  resolveAction: (requestId: string) => void | Promise<void>;
}) {
  if (entries.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted">
          You do not moderate any points yet. Create a point in a chord to get started.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {entries.map(({ point, members, goals, helpRequests, requesters }) => {
        const openRequests = helpRequests.filter((request) => request.status === "open");

        return (
          <section key={point.id} className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{point.title}</h2>
              <Badge tone="brand">{members.length} members</Badge>
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="space-y-4">
                <h3 className="font-semibold tracking-tight">Student progress</h3>
                {members.length === 0 ? (
                  <p className="text-sm text-muted">No members yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {members.map((member) => {
                      const memberGoals = goals.filter((goal) => goal.assignments.some((a) => a.userId === member.id));
                      const latest = memberGoals[0];
                      const assignment = latest?.assignments.find((a) => a.userId === member.id);

                      return (
                        <li key={member.id} className="rounded-xl border border-line p-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={member.name} color={member.avatarColor} size={32} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{member.name}</p>
                              <p className="truncate text-xs text-muted">{latest?.title ?? "No goals yet"}</p>
                            </div>
                            {assignment ? (
                              <span className="text-sm font-semibold">{assignment.progress}%</span>
                            ) : null}
                          </div>
                          {assignment ? (
                            <div className="mt-2 space-y-2">
                              <ProgressBar value={assignment.progress} label={`${member.name} progress`} />
                              {member.id === point.moderatorId || !latest || !assignment ? null : (
                                <form
                                  action={updateProgressAction.bind(null, latest.id)}
                                  className="flex flex-wrap items-center gap-2"
                                >
                                  <input type="hidden" name="userId" value={member.id} />
                                  <select
                                    name="status"
                                    defaultValue={assignment.status}
                                    className="rounded-lg border border-line bg-surface px-2 py-1 text-xs"
                                    aria-label={`Status for ${member.name}`}
                                  >
                                    <option>On track</option>
                                    <option>Needs assistance</option>
                                    <option>Completed</option>
                                  </select>
                                  <input
                                    type="number"
                                    name="progress"
                                    min={0}
                                    max={100}
                                    defaultValue={assignment.progress}
                                    className="w-20 rounded-lg border border-line bg-surface px-2 py-1 text-xs"
                                    aria-label={`Progress percent for ${member.name}`}
                                  />
                                  <button
                                    type="submit"
                                    className="rounded-full border border-line px-3 py-1 text-xs font-medium transition-colors hover:border-brand/40"
                                  >
                                    Update
                                  </button>
                                </form>
                              )}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>

              <div className="space-y-4">
                <Card>
                  <h3 className="mb-1 font-semibold tracking-tight">Support requests</h3>
                  {openRequests.length === 0 ? (
                    <p className="text-sm text-muted">Nothing open right now.</p>
                  ) : (
                    <ul className="space-y-2">
                      {openRequests.map((request) => {
                        const requester = requesters.get(request.userId);
                        return (
                          <li
                            key={request.id}
                            className="flex items-start justify-between gap-3 rounded-xl border border-line p-3"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{requester?.name ?? "Member"}</p>
                              <p className="text-sm text-muted">{request.reason}</p>
                              <p className="mt-0.5 text-xs text-muted">
                                {formatDateTime(request.createdAt, timeZone)}
                              </p>
                            </div>
                            <ActionForm action={resolveAction.bind(null, request.id)} size="sm" variant="secondary">
                              Resolve
                            </ActionForm>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Card>

                <Card>
                  <h3 className="mb-3 font-semibold tracking-tight">Record a goal</h3>
                  <form action={createGoalAction.bind(null, point.id)} className="space-y-3">
                    <input
                      name="title"
                      required
                      placeholder="Goal title"
                      className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
                    />
                    <textarea
                      name="description"
                      placeholder="What exactly should the group accomplish?"
                      className="w-full min-h-16 resize-y rounded-xl border border-line bg-surface px-3 py-2 text-sm"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-muted">Deadline</span>
                        <input
                          type="date"
                          name="deadline"
                          required
                          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-muted">Resources (one per line)</span>
                        <textarea
                          name="resources"
                          placeholder="Handout, link, worksheet…"
                          className="w-full min-h-9 resize-y rounded-xl border border-line bg-surface px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                    <fieldset>
                      <legend className="mb-1 text-xs font-medium text-muted">Assign to</legend>
                      <div className="flex flex-wrap gap-2">
                        {members.map((member) => (
                          <label
                            key={member.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs has-checked:border-brand has-checked:bg-brand/10"
                          >
                            <input
                              type="checkbox"
                              name="assignees"
                              value={member.id}
                              defaultChecked
                              className="size-3 accent-[#4f46e5]"
                            />
                            {member.name}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <button
                      type="submit"
                      className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3f38c9]"
                    >
                      Record goal
                    </button>
                  </form>
                </Card>
              </div>
            </div>

            {goals.length > 0 ? (
              <Card>
                <h3 className="mb-3 font-semibold tracking-tight">Recorded goals</h3>
                <ul className="space-y-2">
                  {goals.map((goal) => (
                    <li key={goal.id} className="flex items-center justify-between gap-3 rounded-xl border border-line p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{goal.title}</p>
                        <p className="text-xs text-muted">Due {formatDateTime(goal.deadline, timeZone)}</p>
                      </div>
                      <GoalStatusBadge status={goal.status} />
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
