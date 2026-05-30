"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, UserPlus, Calendar, Lock, Link as LinkIcon } from "lucide-react";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/Avatar";
import Badge, { statusTone } from "@/components/Badge";
import TaskPanel, { TaskData } from "@/components/TaskPanel";
import { projectsApi } from "@/lib/api";
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

const COLUMNS = ["Backlog", "Todo", "In Progress", "Review", "Done"];

const STATUS_TONE: Record<string, string> = {
  "Backlog": "", "Todo": "", "In Progress": "warn", "Review": "ai", "Done": "ok",
};


function formatDue(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  // Already formatted like "Jun 18" — return as-is
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
  const { role } = useRole();
  const { user } = useAuth();
  const currentUserName = user?.name || "";

  useEffect(() => {
    setLoading(true);
    projectsApi.get(params.id)
      .then(r => {
        if (Array.isArray(r.data.tasks)) setTasks(r.data.tasks);
        if (r.data.name) setProjectName(r.data.name);
        if (r.data.status) setProjectStatus(r.data.status);
        if (Array.isArray(r.data.members)) setProjectMembers(r.data.members.map((m: { name: string }) => ({ name: m.name })));
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
            <button className="btn btn-ghost admin-only"><UserPlus size={16} /> Assign member</button>
            <button className="btn btn-primary admin-only"><Plus size={16} /> Add task</button>
          </div>
        </div>

        <div className="member-hint section">
          <Lock size={15} /> You can move only the tasks assigned to you. Others are read-only.
        </div>

        {/* Kanban board */}
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
                    <button className="icon-btn kadd admin-only" style={{ width: 26, height: 26 }}>
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
    </AppShell>
  );
}
