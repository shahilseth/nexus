"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, UserPlus, Calendar, Lock, Link as LinkIcon, X } from "lucide-react";
import { useForm } from "react-hook-form";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/Avatar";
import Badge, { statusTone } from "@/components/Badge";
import TaskPanel, { TaskData } from "@/components/TaskPanel";
import MemberSelect, { MemberOption } from "@/components/MemberSelect";
import { projectsApi, tasksApi } from "@/lib/api";
import { useRole } from "@/context/RoleContext";
import { useAuth } from "@/context/AuthContext";

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

interface AddTaskForm {
  title: string;
  description: string;
  priority: string;
  due_date: string;
  status: string;
}

const COLUMNS = ["Backlog", "Todo", "In Progress", "Review", "Done"];

function formatDue(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  if (!/^\d{4}/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ProjectMember { name: string; }

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectStatus, setProjectStatus] = useState("On Track");
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const [showAddTask, setShowAddTask] = useState(false);
  const [addTaskStatus, setAddTaskStatus] = useState("Backlog");
  const [assignee, setAssignee] = useState<MemberOption | null>(null);
  const [addTaskError, setAddTaskError] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  const { role } = useRole();
  const { user } = useAuth();
  const currentUserName = user?.name || "";

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddTaskForm>({
    defaultValues: { priority: "medium", status: "Backlog" },
  });

  useEffect(() => {
    setLoading(true);
    projectsApi.get(params.id)
      .then(r => {
        if (Array.isArray(r.data.tasks)) setTasks(r.data.tasks);
        if (r.data.name) setProjectName(r.data.name);
        if (r.data.status) setProjectStatus(r.data.status);
        if (Array.isArray(r.data.members))
          setProjectMembers(r.data.members.map((m: { name: string }) => ({ name: m.name })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

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

  function openAddTask(col = "Backlog") {
    setAddTaskStatus(col);
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
      const newTask: Task = {
        ...res.data,
        assignee_name: assignee?.name,
      };
      setTasks(prev => [newTask, ...prev]);
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

  return (
    <AppShell>
      <div className="page">
        <div className="page-head">
          <div className="grow">
            <div style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 8 }}>
              <Link className="link-quiet" href="/projects">Projects</Link> &nbsp;/&nbsp; {projectName}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="page-title">{projectName}</div>
              <Badge tone={statusTone(projectStatus)} dot>{projectStatus}</Badge>
            </div>
            <div className="page-sub">{loading ? "Loading…" : `${tasks.length} tasks`}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="avatar-stack" style={{ marginRight: 4 }}>
              {projectMembers.slice(0, 4).map(m => (
                <Avatar key={m.name} name={m.name} size="sm" />
              ))}
              {projectMembers.length > 4 && (
                <span className="more">+{projectMembers.length - 4}</span>
              )}
            </div>
            <button
              className="btn btn-primary admin-only"
              onClick={() => openAddTask("Backlog")}
            >
              <Plus size={16} /> Add task
            </button>
          </div>
        </div>

        <div className="member-hint section">
          <Lock size={15} /> You can move only the tasks assigned to you. Others are read-only.
        </div>

        {loading && (
          <div style={{ color: "var(--fg-muted)", fontSize: 14, padding: "20px 0" }}>Loading tasks…</div>
        )}
        <div className="board-wrap" style={{ display: loading ? "none" : "block" }}>
          <div className="board">
            {COLUMNS.map(col => {
              const colTasks = tasks.filter(t => t.status === col);
              return (
                <div className="kcol" key={col}>
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
                  <div className="kcol-body">
                    {colTasks.map(task => {
                      const isMine = task.assignee_name === currentUserName;
                      return (
                        <div
                          key={task.id}
                          className={`kcard${task.blocked_by ? " blocked" : ""}${isMine ? " mine" : ""}`}
                          onClick={() => openTask(task)}
                        >
                          <div className={`kt${task.status === "Done" ? " done" : ""}`}>{task.title}</div>
                          <div className="kmeta">
                            <span className={`prio ${task.priority}`}>
                              <span className="bar" />{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
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
                          <span className="kcard-lock"><Lock size={12} />Read-only</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <TaskPanel task={selectedTask} open={panelOpen} onClose={() => setPanelOpen(false)} />

      {/* Add Task modal */}
      {showAddTask && (
        <div className="modal-scrim" onClick={e => { if (e.target === e.currentTarget) { setShowAddTask(false); reset(); setAssignee(null); } }}>
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
                <button type="button" className="btn btn-ghost" onClick={() => { setShowAddTask(false); reset(); setAssignee(null); }}>
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
