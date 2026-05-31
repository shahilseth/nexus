"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, Lock, Link as LinkIcon, X, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/Avatar";
import Badge, { statusTone } from "@/components/Badge";
import TaskPanel, { TaskData } from "@/components/TaskPanel";
import MemberSelect, { MemberOption } from "@/components/MemberSelect";
import { projectsApi, tasksApi, membersApi, activityApi } from "@/lib/api";
import { useRole } from "@/context/RoleContext";
import { useAuth } from "@/context/AuthContext";

/* ─── Interfaces ─── */

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: "high" | "medium" | "low";
  due_date?: string;
  assignee_id?: string;
  assignee_name?: string;
  ai_suggested?: boolean;
  blocked_by?: string;
  blocks?: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  task_count?: number;
  joined_at?: string;
}

interface ActivityItem {
  id: string;
  user_name: string;
  action: string;
  created_at: string;
}

interface AddTaskForm {
  title: string;
  description: string;
  priority: string;
  due_date: string;
  status: string;
}

/* ─── Constants ─── */

const COLUMNS = ["Backlog", "Todo", "In Progress", "Review", "Done"];

/* ─── Helpers ─── */

function formatDue(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  if (!/^\d{4}/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  if (hrs < 48) return "Yesterday";
  return `${Math.floor(hrs / 24)} days ago`;
}

/* ─── Skeletons ─── */

function MemberRowSkeleton() {
  return (
    <div className="pm-row" style={{ opacity: 0.55 }}>
      <span className="skeleton" style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0 }} />
      <div className="pm-info">
        <span className="skeleton" style={{ width: "38%", height: 14, marginBottom: 6 }} />
        <span className="skeleton" style={{ width: "55%", height: 12 }} />
      </div>
      <span className="skeleton" style={{ width: 58, height: 22, borderRadius: 999 }} />
      <span style={{ width: 28, flexShrink: 0 }} />
    </div>
  );
}

/* ─── Page ─── */

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  /* tasks & project */
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectStatus, setProjectStatus] = useState("On Track");
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  /* drag-and-drop */
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  /* add-task modal */
  const [showAddTask, setShowAddTask] = useState(false);
  const [assignee, setAssignee] = useState<MemberOption | null>(null);
  const [addTaskError, setAddTaskError] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  /* team members */
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const addMemberWrapRef = useRef<HTMLDivElement>(null);

  /* activity */
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const { role } = useRole();
  const { user } = useAuth();
  const currentUserName = user?.name || "";
  const isAdmin = role === "admin";

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddTaskForm>({
    defaultValues: { priority: "medium", status: "Backlog" },
  });

  /* ── Fetch project ── */
  useEffect(() => {
    setLoading(true);
    projectsApi.get(params.id)
      .then(r => {
        if (Array.isArray(r.data.tasks)) setTasks(r.data.tasks);
        if (r.data.name) setProjectName(r.data.name);
        if (r.data.status) setProjectStatus(r.data.status);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  /* ── Fetch members ── */
  function loadMembers() {
    setMembersLoading(true);
    membersApi.list(params.id)
      .then(r => {
        if (Array.isArray(r.data)) {
          setTeamMembers(r.data.map((m: {
            id: string; user_id: string; name: string; email: string;
            role: string; task_count?: number; joined_at?: string;
          }) => ({
            id: m.id,
            user_id: m.user_id,
            name: m.name,
            email: m.email,
            role: m.role,
            task_count: m.task_count,
            joined_at: m.joined_at,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setMembersLoading(false));
  }

  useEffect(() => { loadMembers(); }, [params.id]);

  /* ── Fetch activity ── */
  useEffect(() => {
    setActivityLoading(true);
    activityApi.list(params.id)
      .then(r => { if (Array.isArray(r.data)) setActivity(r.data); })
      .catch(() => {})
      .finally(() => setActivityLoading(false));
  }, [params.id]);

  /* Close add-member on outside click */
  useEffect(() => {
    if (!showAddMember) return;
    function handle(e: MouseEvent) {
      if (addMemberWrapRef.current && !addMemberWrapRef.current.contains(e.target as Node)) {
        setShowAddMember(false);
        setAddMemberError("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showAddMember]);

  /* ── Move task (DnD + select) ── */
  async function moveTask(task: Task, newStatus: string) {
    if (task.status === newStatus) return;
    const prevStatus = task.status;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    try {
      await tasksApi.update(task.id, { status: newStatus });
      // Refresh activity after move
      activityApi.list(params.id)
        .then(r => { if (Array.isArray(r.data)) setActivity(r.data); })
        .catch(() => {});
    } catch {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: prevStatus } : t));
    }
  }

  /* ── DnD handlers ── */
  function handleDragStart(e: React.DragEvent, task: Task) {
    setDraggingId(task.id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverCol(null);
  }

  async function handleDrop(e: React.DragEvent, col: string) {
    e.preventDefault();
    setDragOverCol(null);
    if (!draggingId) return;
    const task = tasks.find(t => t.id === draggingId);
    if (task) await moveTask(task, col);
    setDraggingId(null);
  }

  /* ── Add / remove members ── */
  async function handleAddMember(member: MemberOption) {
    setAddingMember(true);
    setAddMemberError("");
    try {
      await membersApi.invite(params.id, member.email, "member");
      setTeamMembers(prev => [...prev, {
        id: "", user_id: member.id, name: member.name, email: member.email, role: "member",
      }]);
      setShowAddMember(false);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setAddMemberError(err.response?.data?.error || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    setRemovingMember(userId);
    try {
      await membersApi.remove(userId, params.id);
      setTeamMembers(prev => prev.filter(m => m.user_id !== userId));
    } catch {
      // server enforces admin-only
    } finally {
      setRemovingMember(null);
    }
  }

  /* ── Task panel ── */
  function openTask(task: Task) {
    setSelectedTask({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: formatDue(task.due_date),
      assignee_name: task.assignee_name,
      ai_suggested: task.ai_suggested,
      blocks: task.blocks,
      blocked_by: task.blocked_by,
    });
    setPanelOpen(true);
  }

  /* ── Add task modal ── */
  function openAddTask(col = "Backlog") {
    setAssignee(null);
    setAddTaskError("");
    reset({ priority: "medium", status: col, title: "", description: "", due_date: "" });
    setShowAddTask(true);
  }

  async function onAddTask(data: AddTaskForm) {
    setAddTaskError("");
    setAddingTask(true);
    try {
      const res = await tasksApi.create({
        project_id: params.id,
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
        status: data.status,
        due_date: data.due_date || undefined,
        assignee_id: assignee?.id || undefined,
      });
      setTasks(prev => [{ ...res.data, assignee_name: assignee?.name }, ...prev]);
      // If assignee is new to project, they'll appear after next member refresh
      if (assignee) loadMembers();
      setShowAddTask(false);
      reset();
      setAssignee(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setAddTaskError(err.response?.data?.error || "Failed to create task");
    } finally {
      setAddingTask(false);
    }
  }

  /* ─── Render ─── */
  return (
    <AppShell>
      <div className="page">

        {/* ── Header ── */}
        <div className="page-head">
          <div className="grow">
            <div style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 8 }}>
              <Link className="link-quiet" href="/projects">Projects</Link> &nbsp;/&nbsp; {projectName}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="page-title">{projectName}</div>
              <Badge tone={statusTone(projectStatus)} dot>{projectStatus}</Badge>
            </div>
            <div className="page-sub">
              {loading ? "Loading…" : `${tasks.length} tasks · ${teamMembers.length} members`}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="avatar-stack" style={{ marginRight: 4 }}>
              {teamMembers.slice(0, 4).map(m => (
                <Avatar key={m.user_id} name={m.name} size="sm" />
              ))}
              {teamMembers.length > 4 && (
                <span className="more">+{teamMembers.length - 4}</span>
              )}
            </div>
            <button className="btn btn-primary admin-only" onClick={() => openAddTask("Backlog")}>
              <Plus size={16} /> Add task
            </button>
          </div>
        </div>

        <div className="member-hint section">
          <Lock size={15} /> You can view tasks and move only the ones assigned to you.
        </div>

        {/* ── Kanban board ── */}
        {loading && (
          <div style={{ color: "var(--fg-muted)", fontSize: 14, padding: "20px 0" }}>Loading tasks…</div>
        )}
        <div className="board-wrap" style={{ display: loading ? "none" : "block" }}>
          <div className="board">
            {COLUMNS.map(col => {
              const colTasks = tasks.filter(t => t.status === col);
              const isOver = dragOverCol === col;
              return (
                <div
                  className="kcol"
                  key={col}
                  onDragEnter={e => { e.preventDefault(); setDragOverCol(col); }}
                  onDragOver={e => e.preventDefault()}
                  onDragLeave={e => {
                    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
                      setDragOverCol(null);
                    }
                  }}
                  onDrop={e => handleDrop(e, col)}
                >
                  <div className="kcol-head">
                    <span className="kname">{col}</span>
                    <span className="kcount">{colTasks.length}</span>
                    <button
                      className="icon-btn kadd admin-only"
                      style={{ width: 26, height: 26 }}
                      onClick={() => openAddTask(col)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className={`kcol-body${isOver ? " drag-over" : ""}`}>
                    {colTasks.map(task => {
                      const isMine = task.assignee_name === currentUserName;
                      const canMove = isAdmin || isMine;
                      const isDragging = draggingId === task.id;
                      return (
                        <div
                          key={task.id}
                          className={`kcard${task.blocked_by ? " blocked" : ""}${isMine ? " mine" : ""}${isDragging ? " dragging" : ""}`}
                          draggable={canMove}
                          onDragStart={e => canMove ? handleDragStart(e, task) : e.preventDefault()}
                          onDragEnd={handleDragEnd}
                          onClick={() => openTask(task)}
                        >
                          <div className={`kt${task.status === "Done" ? " done" : ""}`}>{task.title}</div>
                          <div className="kmeta">
                            <span className={`prio ${task.priority}`}>
                              <span className="bar" />
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                            <div className="grow" />
                            {isMine
                              ? <span className="kmine-tab">You</span>
                              : formatDue(task.due_date) && (
                                <span className="kdue">
                                  <Calendar size={13} />{formatDue(task.due_date)}
                                </span>
                              )
                            }
                            {task.assignee_name && <Avatar name={task.assignee_name} size="xs" />}
                          </div>
                          {task.blocked_by && (
                            <span className="kdep"><LinkIcon size={13} />Blocked by 1</span>
                          )}
                          {!canMove && (
                            <span className="kcard-lock"><Lock size={12} />Read-only</span>
                          )}
                          {/* Status selector — stop propagation so the card click doesn't fire */}
                          {canMove && (
                            <div className="kmove-wrap" onClick={e => e.stopPropagation()}>
                              <select
                                className="kmove-select"
                                value={task.status}
                                onChange={e => moveTask(task, e.target.value)}
                              >
                                {COLUMNS.map(c => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Below-kanban: Activity + Team Members side by side ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, marginTop: 24 }}>

          {/* Activity feed */}
          <div className="card card-pad">
            <div className="section-head">
              <span className="section-title">Activity</span>
            </div>
            {activityLoading ? (
              <div style={{ color: "var(--fg-muted)", fontSize: 14, padding: "8px 0" }}>Loading…</div>
            ) : activity.length === 0 ? (
              <div style={{ color: "var(--fg-muted)", fontSize: 14, padding: "8px 0" }}>No activity yet.</div>
            ) : (
              <div className="feed">
                {activity.slice(0, 8).map(item => (
                  <div className="feed-item" key={item.id}>
                    <Avatar name={item.user_name} size="sm" />
                    <div className="feed-body">
                      <div className="feed-text"><b>{item.user_name}</b> {item.action}</div>
                      <div className="feed-time">{timeAgo(item.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team Members */}
          <div className="card card-pad">
            <div className="section-head">
              <span className="section-title">Team Members</span>
              <div className="grow" />
              {isAdmin && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setShowAddMember(v => !v); setAddMemberError(""); }}
                  disabled={addingMember}
                >
                  <UserPlus size={15} /> Add member
                </button>
              )}
            </div>

            {showAddMember && (
              <div ref={addMemberWrapRef} style={{ marginBottom: 12 }}>
                <MemberSelect
                  placeholder="Search workspace members…"
                  onChange={handleAddMember}
                />
                {addMemberError && (
                  <p className="form-error" style={{ marginTop: 6 }}>{addMemberError}</p>
                )}
              </div>
            )}

            {membersLoading && (
              <>
                <MemberRowSkeleton />
                <MemberRowSkeleton />
                <MemberRowSkeleton />
              </>
            )}

            {!membersLoading && teamMembers.length === 0 && (
              <div className="pm-empty">
                No members yet.{isAdmin ? " Use Add member to invite someone." : ""}
              </div>
            )}

            {!membersLoading && teamMembers.map(m => {
              const isRemoving = removingMember === m.user_id;
              return (
                <div
                  className="pm-row"
                  key={m.user_id || m.email}
                  style={{ opacity: isRemoving ? 0.45 : 1, transition: "opacity .2s" }}
                >
                  <Avatar name={m.name} size="sm" />
                  <div className="pm-info">
                    <div className="pm-name">{m.name}</div>
                    <div className="pm-email">{m.email}</div>
                  </div>
                  <span className={`badge role${m.role === "admin" ? "" : " member"}`}>
                    {m.role === "admin" ? "Admin" : "Member"}
                  </span>
                  {isAdmin && (
                    <button
                      className="icon-btn"
                      style={{ width: 28, height: 28, flexShrink: 0 }}
                      title="Remove from project"
                      disabled={isRemoving}
                      onClick={() => handleRemoveMember(m.user_id)}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <TaskPanel
        task={selectedTask}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        projectId={params.id}
      />

      {/* ── Add Task modal ── */}
      {showAddTask && (
        <div
          className="modal-scrim"
          onClick={e => { if (e.target === e.currentTarget) { setShowAddTask(false); reset(); setAssignee(null); } }}
        >
          <div className="modal">
            <div className="modal-head">
              <span className="modal-title">Add task</span>
              <button className="icon-btn" onClick={() => { setShowAddTask(false); reset(); setAssignee(null); }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onAddTask)}>
              <div className="form-field">
                <label>Title *</label>
                <input
                  placeholder="What needs to be done?"
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && <span className="form-error">{errors.title.message}</span>}
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea placeholder="Optional details…" {...register("description")} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-field">
                  <label>Status</label>
                  <select {...register("status")}>
                    {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Priority</label>
                  <select {...register("priority")}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label>Due date</label>
                <input type="date" {...register("due_date")} />
              </div>
              <div className="form-field">
                <label>Assignee</label>
                <MemberSelect
                  displayValue={assignee?.name ?? ""}
                  placeholder="Search project members…"
                  projectId={params.id}
                  onChange={m => setAssignee(m)}
                />
                {assignee && (
                  <span style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 4 }}>
                    {assignee.email}
                  </span>
                )}
              </div>
              {addTaskError && <p className="form-error">{addTaskError}</p>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { setShowAddTask(false); reset(); setAssignee(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={addingTask}>
                  {addingTask ? "Adding…" : "Add task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
