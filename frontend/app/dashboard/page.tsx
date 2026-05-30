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
import { projectsApi, activityApi, membersApi } from "@/lib/api";
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
  const [activity, setActivity] = useState<Activity[]>(STATIC_ACTIVITY);
  const [memberCount, setMemberCount] = useState(0);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    projectsApi.list()
      .then(r => { if (Array.isArray(r.data)) setProjects(r.data); })
      .catch(() => {})
      .finally(() => setLoadingProjects(false));
    activityApi.list().then(r => { if (Array.isArray(r.data) && r.data.length > 0) setActivity(r.data); }).catch(() => {});
    membersApi.list().then(r => { if (Array.isArray(r.data) && r.data.length > 0) setMemberCount(r.data.length); }).catch(() => {});
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
            <div className="stat-num">{loadingProjects ? "—" : projects.length}</div>
            <div className="stat-foot"><TrendingUp size={14} /> 2 added this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span className="stat-ico"><CalendarClock size={16} /></span><span className="stat-label">Tasks due today</span></div>
            <div className="stat-num">4</div>
            <div className="stat-foot">Across 3 projects</div>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span className="stat-ico"><AlertTriangle size={16} /></span><span className="stat-label">Overdue tasks</span></div>
            <div className="stat-num">2</div>
            <div className="stat-foot" style={{ color: "var(--risk-fg)" }}><ArrowUp size={14} /> Needs attention</div>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span className="stat-ico"><Users size={16} /></span><span className="stat-label">Team members</span></div>
            <div className="stat-num">{memberCount || "—"}</div>
            <div className="stat-foot">1 at capacity</div>
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

          {/* Right rail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* AI Pulse */}
            <div className="pulse">
              <div className="pulse-head">
                <span className="pulse-title">AI Pulse</span>
                <div className="grow" />
                <span className="ai-tag">
                  <Sparkles size={12} /> AI-generated
                </span>
              </div>
              <div className="pulse-list">
                <div className="pulse-line">
                  <span className="pi risk"><AlertTriangle size={15} /></span>
                  <div><b>2 tasks are overdue.</b> Both sit in Atlas Migration and now block downstream work.</div>
                </div>
                <div className="pulse-line">
                  <span className="pi warn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                  </span>
                  <div><b>Riya is at capacity this week.</b> Consider reassigning her next two tasks.</div>
                </div>
                <div className="pulse-line">
                  <span className="pi ok">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  </span>
                  <div><b>Project Nexus is on track</b> to hit its June 12 target.</div>
                </div>
              </div>
              <div className="pulse-foot">Generated by Nexus AI from your team&apos;s activity · updated 4m ago</div>
            </div>

            {/* Recent activity */}
            <div className="card card-pad">
              <div className="section-head"><span className="section-title">Recent activity</span></div>
              <div className="feed">
                {activity.slice(0, 5).map((item, i) => (
                  <div className="feed-item" key={i}>
                    <Avatar name={item.user_name} size="sm" />
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


const STATIC_ACTIVITY: Activity[] = [
  { id: "1", user_name: "Marcus Lee",  action: 'moved "Migrate billing tables" to Blocked', created_at: new Date(Date.now() - 12*60000).toISOString() },
  { id: "2", user_name: "Riya Kapoor", action: 'completed "Design empty states"',            created_at: new Date(Date.now() - 60*60000).toISOString() },
  { id: "3", user_name: "Aria Sen",    action: 'created project "Pulse Analytics"',           created_at: new Date(Date.now() - 3*3600000).toISOString() },
  { id: "4", user_name: "Devon Park",  action: 'commented on "Wire up auth flow"',            created_at: new Date(Date.now() - 5*3600000).toISOString() },
  { id: "5", user_name: "Nexus AI",    action: 'raised priority of "Fix onboarding crash" to High', created_at: new Date(Date.now() - 24*3600000).toISOString() },
];
