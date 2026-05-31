"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderKanban, CalendarClock, AlertTriangle, Users,
  TrendingUp, ArrowUp, Plus, Sparkles,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/Avatar";
import Badge, { statusTone } from "@/components/Badge";
import { projectsApi, activityApi, statsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Project {
  id: string;
  name: string;
  status: string;
  owner_name: string;
  due_date: string;
  progress?: number;
}

interface Activity {
  id: string;
  user_name: string;
  action: string;
  created_at: string;
}

interface Stats {
  project_count: number;
  tasks_due_today: number;
  overdue_tasks: number;
  member_count: number;
  members_at_capacity: number;
  projects_added_this_week: number;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  return "Yesterday";
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    statsApi.get().then(r => setStats(r.data)).catch(() => {});
    projectsApi.list()
      .then(r => { if (Array.isArray(r.data)) setProjects(r.data); })
      .catch(() => {})
      .finally(() => setLoadingProjects(false));
    activityApi.list()
      .then(r => { if (Array.isArray(r.data) && r.data.length > 0) setActivity(r.data); })
      .catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <AppShell>
      <div className="page">
        <div className="page-head">
          <div className="grow">
            <div className="page-title">Welcome back, {user?.name?.split(" ")[0] ?? "there"}</div>
            <div className="page-sub">Here&apos;s how your team is tracking today, {today}.</div>
          </div>
          <Link href="/projects" className="btn btn-primary admin-only">
            <Plus size={16} /> New project
          </Link>
        </div>

        {/* Stats */}
        <div className="stat-grid section">
          <div className="stat-card">
            <div className="stat-top"><span className="stat-ico"><FolderKanban size={16} /></span><span className="stat-label">Active projects</span></div>
            <div className="stat-num">{stats ? stats.project_count : "—"}</div>
            <div className="stat-foot">
              <TrendingUp size={14} />
              {stats ? `${stats.projects_added_this_week} added this week` : "—"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span className="stat-ico"><CalendarClock size={16} /></span><span className="stat-label">Tasks due today</span></div>
            <div className="stat-num">{stats ? stats.tasks_due_today : "—"}</div>
            <div className="stat-foot">
              {stats
                ? stats.tasks_due_today > 0 ? `Across ${stats.project_count} projects` : "Nothing due today"
                : "—"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span className="stat-ico"><AlertTriangle size={16} /></span><span className="stat-label">Overdue tasks</span></div>
            <div className="stat-num">{stats ? stats.overdue_tasks : "—"}</div>
            <div className="stat-foot" style={stats && stats.overdue_tasks > 0 ? { color: "var(--risk-fg)" } : {}}>
              {stats
                ? stats.overdue_tasks > 0 ? <><ArrowUp size={14} /> Needs attention</> : "All tasks on time"
                : "—"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span className="stat-ico"><Users size={16} /></span><span className="stat-label">Team members</span></div>
            <div className="stat-num">{stats ? stats.member_count : "—"}</div>
            <div className="stat-foot">
              {stats
                ? stats.members_at_capacity > 0 ? `${stats.members_at_capacity} at capacity` : "All available"
                : "—"}
            </div>
          </div>
        </div>

        {/* Two columns */}
        <div className="dash-cols" style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 20 }}>

          {/* Recent projects */}
          <div className="card card-pad">
            <div className="section-head">
              <span className="section-title">Recent projects</span>
              <div className="grow" />
              <Link className="link-quiet" href="/projects">View all</Link>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Project</th><th>Owner</th><th>Status</th><th>Due date</th>
                    <th style={{ width: 140 }}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProjects ? (
                    <tr><td colSpan={5} style={{ color: "var(--fg-muted)", fontSize: 14, padding: "18px 16px" }}>Loading…</td></tr>
                  ) : projects.length === 0 ? (
                    <tr><td colSpan={5} style={{ color: "var(--fg-muted)", fontSize: 14, padding: "18px 16px" }}>No projects yet.</td></tr>
                  ) : projects.map(p => (
                    <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => window.location.href = `/projects/${p.id}`}>
                      <td className="cell-strong">{p.name}</td>
                      <td>
                        <div className="cell-with-avatar">
                          <Avatar name={p.owner_name || "?"} size="xs" />
                          {p.owner_name}
                        </div>
                      </td>
                      <td><Badge tone={statusTone(p.status)} dot>{p.status}</Badge></td>
                      <td className="muted">{p.due_date ? p.due_date.slice(0, 10) : "—"}</td>
                      <td>
                        <div className="cell-with-avatar">
                          <div className="progress" style={{ flex: 1 }}>
                            <span style={{ width: `${Number(p.progress ?? 0)}%` }} />
                          </div>
                          <span className="muted" style={{ fontSize: 12 }}>{Number(p.progress ?? 0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right rail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* AI Pulse */}
            <div className="pulse">
              <div className="pulse-head">
                <span className="pulse-title">AI Pulse</span>
                <div className="grow" />
                <span className="ai-tag"><Sparkles size={12} /> AI-generated</span>
              </div>
              <div className="pulse-list">
                <div className="pulse-line">
                  <span className="pi risk"><AlertTriangle size={15} /></span>
                  <div>
                    <b>{stats ? stats.overdue_tasks : "—"} task{stats?.overdue_tasks !== 1 ? "s" : ""} {stats?.overdue_tasks === 1 ? "is" : "are"} overdue.</b> Review blocked work before the next deadline.
                  </div>
                </div>
                <div className="pulse-line">
                  <span className="pi warn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                  </span>
                  <div>
                    <b>{stats ? stats.members_at_capacity : "—"} team member{stats?.members_at_capacity !== 1 ? "s" : ""} at capacity.</b> Consider rebalancing task assignments.
                  </div>
                </div>
                <div className="pulse-line">
                  <span className="pi ok">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  </span>
                  <div>
                    <b>{stats ? stats.tasks_due_today : "—"} task{stats?.tasks_due_today !== 1 ? "s" : ""} due today.</b> Stay on top of today&apos;s deadlines.
                  </div>
                </div>
              </div>
              <div className="pulse-foot">Generated by Nexus AI from your team&apos;s activity · updated just now</div>
            </div>

            {/* Recent activity */}
            <div className="card card-pad">
              <div className="section-head"><span className="section-title">Recent activity</span></div>
              <div className="feed">
                {activity.length === 0 ? (
                  <div style={{ color: "var(--fg-muted)", fontSize: 14, padding: "12px 0" }}>No recent activity.</div>
                ) : activity.slice(0, 5).map((item, i) => (
                  <div className="feed-item" key={i}>
                    <Avatar name={item.user_name || "?"} size="sm" />
                    <div className="feed-body">
                      <div className="feed-text"><b>{item.user_name}</b> {item.action}</div>
                      <div className="feed-time">{timeAgo(item.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}

