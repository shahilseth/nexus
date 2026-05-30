"use client";

import { useEffect, useState } from "react";
import { UserPlus, Info, Ellipsis, X } from "lucide-react";
import { useForm } from "react-hook-form";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/Avatar";
import { membersApi, projectsApi } from "@/lib/api";

interface Member {
  id?: string;
  user_id?: string;
  name: string;
  email: string;
  role?: string;
  task_count?: number;
  workload_pct?: number;
  workload_label?: string;
  joined?: string;
  joined_at?: string;
  created_at?: string;
}

interface Project { id: string; name: string; }

interface InviteForm {
  email: string;
  project_id: string;
  role: string;
}

const STATIC_MEMBERS: Member[] = [
  { id: "1", name: "Shahil Seth",  email: "shahil@nexus.app", role: "admin",  task_count: 6,  workload_pct: 66, workload_label: "Balanced",    joined: "Joined Jan 2024" },
  { id: "2", name: "Aria Sen",     email: "aria@nexus.app",   role: "member", task_count: 8,  workload_pct: 88, workload_label: "Busy",         joined: "Joined Jan 2024" },
  { id: "3", name: "Riya Kapoor",  email: "riya@nexus.app",   role: "member", task_count: 9,  workload_pct: 99, workload_label: "At capacity",  joined: "Joined Mar 2024" },
  { id: "4", name: "Marcus Lee",   email: "marcus@nexus.app", role: "member", task_count: 7,  workload_pct: 77, workload_label: "Busy",         joined: "Joined Feb 2024" },
  { id: "5", name: "Devon Park",   email: "devon@nexus.app",  role: "member", task_count: 5,  workload_pct: 55, workload_label: "Balanced",     joined: "Joined Jun 2024" },
  { id: "6", name: "Lena Fischer", email: "lena@nexus.app",   role: "member", task_count: 4,  workload_pct: 44, workload_label: "Balanced",     joined: "Joined Sep 2024" },
  { id: "7", name: "Tomás Ruiz",   email: "tomas@nexus.app",  role: "member", task_count: 6,  workload_pct: 66, workload_label: "Balanced",     joined: "Joined Nov 2024" },
  { id: "8", name: "Mei Chen",     email: "mei@nexus.app",    role: "member", task_count: 3,  workload_pct: 33, workload_label: "Light",        joined: "Joined Jan 2025" },
  { id: "9", name: "Jordan Blake", email: "jordan@nexus.app", role: "member", task_count: 5,  workload_pct: 55, workload_label: "Balanced",     joined: "Joined Mar 2025" },
];

function workloadColor(pct: number) {
  if (pct >= 90) return "var(--risk-fg)";
  if (pct >= 75) return "var(--warn-fg)";
  return undefined;
}
function workloadBarClass(pct: number) {
  if (pct >= 90) return "risk";
  if (pct >= 75) return "warn";
  return "";
}
function formatJoined(dateStr?: string) {
  if (!dateStr) return "Joined 2024";
  const d = new Date(dateStr);
  return "Joined " + d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>(STATIC_MEMBERS);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviting, setInviting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>({
    defaultValues: { role: "member" },
  });

  useEffect(() => {
    membersApi.list()
      .then(r => { if (Array.isArray(r.data) && r.data.length > 0) setMembers(r.data); })
      .catch(() => {});
    projectsApi.list()
      .then(r => { if (Array.isArray(r.data)) setProjects(r.data); })
      .catch(() => {});
  }, []);

  async function onInvite(data: InviteForm) {
    setInviteError("");
    setInviteSuccess("");
    setInviting(true);
    try {
      await membersApi.invite(data.project_id, data.email, data.role);
      setInviteSuccess(`${data.email} has been invited.`);
      reset();
      setTimeout(() => { setShowModal(false); setInviteSuccess(""); }, 1500);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setInviteError(err.response?.data?.error || "Failed to invite member");
    } finally {
      setInviting(false);
    }
  }

  const displayed = members.filter(m => m.name);
  const adminCount = displayed.filter(m => m.role === "admin").length;

  return (
    <AppShell>
      <div className="page">
        <div className="page-head">
          <div className="grow">
            <div className="page-title">Team</div>
            <div className="page-sub">
              {displayed.length} people in Nexus Labs · {adminCount} admin, {displayed.length - adminCount} members
            </div>
          </div>
          <button className="btn btn-primary admin-only" onClick={() => setShowModal(true)}>
            <UserPlus size={16} /> Invite member
          </button>
        </div>

        <div className="member-hint section">
          <Info size={15} /> Only admins can invite or remove teammates.
        </div>

        <div className="team-grid">
          {displayed.map(m => {
            const taskCount = Number(m.task_count ?? 0);
            const pct = Number(m.workload_pct ?? 0);
            const wLabel = m.workload_label ?? "Light";
            const wColor = workloadColor(pct);
            const barClass = workloadBarClass(pct);
            const isAdmin = m.role === "admin";
            const joined = m.joined ?? formatJoined(m.joined_at ?? m.created_at);

            return (
              <div className="member-card" key={m.id || m.name}>
                <div className="mc-top">
                  <Avatar name={m.name} size="lg" />
                  <div className="grow">
                    <div className="mc-name">{m.name}</div>
                    <div className="mc-mail">{m.email}</div>
                  </div>
                  <span className={`badge role${isAdmin ? "" : " member"}`}>
                    {isAdmin ? "Admin" : "Member"}
                  </span>
                </div>
                <div className="mc-stats">
                  <div className="mc-stat">
                    <div className="n">{taskCount}</div>
                    <div className="l">Tasks assigned</div>
                  </div>
                  <div className="mc-stat">
                    <div className="n" style={wColor ? { color: wColor } : {}}>{pct}%</div>
                    <div className="l">Workload</div>
                  </div>
                </div>
                <div className="mc-work">
                  <div className="wrow">
                    <span>Workload</span>
                    <span style={wColor ? { color: wColor } : {}}>{wLabel}</span>
                  </div>
                  <div className="progress workload">
                    <span className={barClass} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="mc-foot">
                  <span className="joined">{joined}</span>
                  <button className="icon-btn menu admin-only" style={{ width: 28, height: 28 }} title="Remove member">
                    <Ellipsis size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showModal && (
        <div className="modal-scrim" onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); reset(); } }}>
          <div className="modal">
            <div className="modal-head">
              <span className="modal-title">Invite member</span>
              <button className="icon-btn" onClick={() => { setShowModal(false); reset(); setInviteError(""); setInviteSuccess(""); }}>
                <X size={18} />
              </button>
            </div>

            {inviteSuccess ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "var(--ok-fg)", fontSize: 15 }}>
                {inviteSuccess}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onInvite)}>
                <div className="form-field">
                  <label>Email address *</label>
                  <input
                    type="email"
                    placeholder="teammate@company.com"
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && <span className="form-error">{errors.email.message}</span>}
                </div>
                <div className="form-field">
                  <label>Project *</label>
                  <select {...register("project_id", { required: "Select a project" })}>
                    <option value="">Select a project…</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.project_id && <span className="form-error">{errors.project_id.message}</span>}
                </div>
                <div className="form-field">
                  <label>Role</label>
                  <select {...register("role")}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {inviteError && <p className="form-error">{inviteError}</p>}

                <div className="modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); reset(); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={inviting}>
                    {inviting ? "Inviting…" : "Send invite"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
