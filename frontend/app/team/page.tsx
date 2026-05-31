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

function MemberSkeleton() {
  return (
    <div className="member-card" style={{ opacity: 0.55 }}>
      <div className="mc-top">
        <span className="skeleton" style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0 }} />
        <div className="grow" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="skeleton" style={{ width: "58%", height: 16 }} />
          <span className="skeleton" style={{ width: "78%", height: 13 }} />
        </div>
        <span className="skeleton" style={{ width: 62, height: 24, borderRadius: 999 }} />
      </div>
      <div className="mc-stats" style={{ marginTop: 18 }}>
        <div className="mc-stat">
          <span className="skeleton" style={{ width: 32, height: 20, marginBottom: 6 }} />
          <span className="skeleton" style={{ width: 80, height: 13 }} />
        </div>
        <div className="mc-stat">
          <span className="skeleton" style={{ width: 40, height: 20, marginBottom: 6 }} />
          <span className="skeleton" style={{ width: 60, height: 13 }} />
        </div>
      </div>
      <div className="mc-work" style={{ marginTop: 18 }}>
        <div className="wrow" style={{ marginBottom: 7 }}>
          <span className="skeleton" style={{ width: 58, height: 13 }} />
          <span className="skeleton" style={{ width: 48, height: 13 }} />
        </div>
        <span className="skeleton" style={{ width: "100%", height: 6, borderRadius: 999 }} />
      </div>
      <div className="mc-foot" style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
        <span className="skeleton" style={{ width: 100, height: 13 }} />
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviting, setInviting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>({
    defaultValues: { role: "member" },
  });

  useEffect(() => {
    setLoading(true);
    membersApi.list()
      .then(r => { if (Array.isArray(r.data)) setMembers(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
    projectsApi.list()
      .then(r => { if (Array.isArray(r.data)) setProjects(r.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!openMenuId) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Element;
      if (!target.closest(".member-menu-wrap")) setOpenMenuId(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);

  async function removeMember(userId: string) {
    setRemoving(userId);
    setOpenMenuId(null);
    try {
      await membersApi.remove(userId);
      setMembers(prev => prev.filter(m => (m.id ?? m.user_id) !== userId));
    } catch {
      // server enforces admin-only; silently ignore UI errors
    } finally {
      setRemoving(null);
    }
  }

  async function onInvite(data: InviteForm) {
    setInviteError("");
    setInviteSuccess("");
    setInviting(true);
    try {
      await membersApi.invite(data.project_id, data.email, data.role);
      setInviteSuccess(`${data.email} has been invited.`);
      reset();
      membersApi.list()
        .then(r => { if (Array.isArray(r.data)) setMembers(r.data); })
        .catch(() => {});
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
              {loading
                ? "Loading…"
                : `${displayed.length} people in Nexus Labs · ${adminCount} admin, ${displayed.length - adminCount} members`}
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
          {loading ? (
            <>
              <MemberSkeleton />
              <MemberSkeleton />
              <MemberSkeleton />
            </>
          ) : displayed.map(m => {
            const userId = m.id ?? m.user_id ?? m.email;
            const taskCount = Number(m.task_count ?? 0);
            const pct = Number(m.workload_pct ?? 0);
            const wLabel = m.workload_label ?? "Light";
            const wColor = workloadColor(pct);
            const barClass = workloadBarClass(pct);
            const isAdmin = m.role === "admin";
            const joined = m.joined ?? formatJoined(m.joined_at ?? m.created_at);
            const isMenuOpen = openMenuId === userId;
            const isRemoving = removing === userId;

            return (
              <div className="member-card" key={m.id || m.name} style={{ opacity: isRemoving ? 0.5 : 1, transition: "opacity .2s" }}>
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
                  <div className="member-menu-wrap admin-only">
                    <button
                      className="icon-btn"
                      style={{ width: 28, height: 28 }}
                      title="Member options"
                      disabled={isRemoving}
                      onClick={() => setOpenMenuId(isMenuOpen ? null : (userId ?? null))}
                    >
                      <Ellipsis size={16} />
                    </button>
                    {isMenuOpen && (
                      <div className="member-menu">
                        <button
                          className="member-menu-item danger"
                          onClick={() => userId && removeMember(userId)}
                        >
                          Remove member
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
