"use client";

import { Ellipsis, X, Calendar, Link as LinkIcon } from "lucide-react";
import Avatar from "./Avatar";
import Badge, { statusTone } from "./Badge";

export interface TaskData {
  id?: string;
  title: string;
  description?: string;
  status: string;
  priority: "high" | "medium" | "low";
  due_date?: string;
  assignee_name?: string;
  ai_suggested?: boolean;
  blocks?: string;
  blocked_by?: string;
}

interface TaskPanelProps {
  task: TaskData | null;
  open: boolean;
  onClose: () => void;
}

const PRIO_LABEL: Record<string, string> = { high: "High", medium: "Medium", low: "Low" };

export default function TaskPanel({ task, open, onClose }: TaskPanelProps) {
  if (!task) return null;

  return (
    <>
      <div className={`scrim${open ? " open" : ""}`} onClick={onClose} />
      <aside className={`task-panel${open ? " open" : ""}`} aria-label="Task detail">
        <div className="tp-head">
          <Badge tone={statusTone(task.status)} dot>{task.status}</Badge>
          <div className="grow" />
          <button className="icon-btn" title="More"><Ellipsis size={18} /></button>
          <button className="icon-btn" title="Close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="tp-body">
          <div className="tp-title">{task.title}</div>
          <div className="tp-desc">
            {task.description || "Scope, owners, and acceptance criteria for this task. Linked to the Nexus June milestone."}
          </div>

          <div className="tp-fields">
            <div className="tp-field">
              <div className="fl">Assignee</div>
              <div className="fv">
                {task.assignee_name
                  ? <><Avatar name={task.assignee_name} size="xs" />{task.assignee_name}</>
                  : <span className="muted">Unassigned</span>
                }
              </div>
            </div>
            <div className="tp-field">
              <div className="fl">Due date</div>
              <div className="fv">
                <Calendar size={15} style={{ color: "var(--fg-muted)" }} />
                <span>{task.due_date || "—"}</span>
              </div>
            </div>
            <div className="tp-field">
              <div className="fl">Priority</div>
              <div className="fv">
                <span className={`prio ${task.priority}`}>
                  <span className="bar" />
                  {PRIO_LABEL[task.priority]}
                </span>
                {task.ai_suggested && (
                  <span className="ai-tag" style={{ display: "inline-flex" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    AI-suggested
                  </span>
                )}
              </div>
            </div>
            <div className="tp-field">
              <div className="fl">Status</div>
              <div className="fv">{task.status}</div>
            </div>
          </div>

          <div className="tp-deps">
            <div className="section-title" style={{ fontSize: 14, marginBottom: 6 }}>Dependencies</div>
            <div className="tp-dep-row">
              <span className="lbl">Blocks</span>
              {task.blocks
                ? <span className="tp-dep-chip">{task.blocks}</span>
                : <span className="muted" style={{ fontSize: 13.5 }}>Nothing</span>
              }
            </div>
            <div className="tp-dep-row">
              <span className="lbl">Blocked by</span>
              {task.blocked_by
                ? <span className="tp-dep-chip"><LinkIcon size={13} />{task.blocked_by}</span>
                : <span className="muted" style={{ fontSize: 13.5 }}>Nothing — clear to proceed</span>
              }
            </div>
          </div>

          <div className="tp-deps">
            <div className="section-title" style={{ fontSize: 14, marginBottom: 6 }}>Activity</div>
            <div className="timeline">
              <div className="tl-item">
                <div className="tl-rail"><span className="tl-dot" /><span className="tl-line" /></div>
                <div>
                  <div className="tl-text"><b>{task.assignee_name || "Someone"}</b> moved this to {task.status}</div>
                  <div className="tl-time">2 hours ago</div>
                </div>
              </div>
              {task.ai_suggested && (
                <div className="tl-item">
                  <div className="tl-rail"><span className="tl-dot" /><span className="tl-line" /></div>
                  <div>
                    <div className="tl-text"><b>Nexus AI</b> suggested priority {PRIO_LABEL[task.priority]}</div>
                    <div className="tl-time">Yesterday</div>
                  </div>
                </div>
              )}
              <div className="tl-item">
                <div className="tl-rail"><span className="tl-dot" /></div>
                <div>
                  <div className="tl-text"><b>Aria Sen</b> created this task</div>
                  <div className="tl-time">3 days ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
