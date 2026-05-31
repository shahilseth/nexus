"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Info, X, Ellipsis } from "lucide-react";
import { useForm } from "react-hook-form";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/Avatar";
import Badge, { statusTone } from "@/components/Badge";
import { projectsApi } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  due_date: string;
  owner_name?: string;
  progress?: number;
  last_active?: string;
  members?: { name: string }[];
}

interface CreateForm {
  name: string;
  description: string;
  status: string;
  due_date: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateForm>({
    defaultValues: { status: "On Track" },
  });

  function loadProjects() {
    setLoading(true);
    projectsApi.list()
      .then(r => { if (Array.isArray(r.data)) setProjects(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadProjects(); }, []);

  useEffect(() => {
    if (!openMenuId) return;
    function handle(e: MouseEvent) {
      const target = e.target as Element;
      if (!target.closest(".proj-menu-wrap")) setOpenMenuId(null);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [openMenuId]);

  async function onSubmit(data: CreateForm) {
    setCreateError("");
    setCreating(true);
    try {
      await projectsApi.create(data);
      setShowModal(false);
      reset();
      loadProjects();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setCreateError(err.response?.data?.error || "Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  async function doDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await projectsApi.delete(confirmDelete.id);
      setProjects(prev => prev.filter(p => p.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch {
      // server enforces admin-only; error handled silently
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppShell>
      <div className="page">
        <div className="page-head">
          <div className="grow">
            <div className="page-title">Projects</div>
            <div className="page-sub admin-only">
              {loading ? "Loading…" : `All ${projects.length} projects across your workspace.`}
            </div>
            <div className="page-sub member-only">The projects you&apos;re a member of.</div>
          </div>
          <button className="btn btn-primary admin-only" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create project
          </button>
        </div>

        <div className="member-hint section">
          <Info size={15} /> You&apos;re seeing only the projects you belong to. Ask an admin for access to others.
        </div>

        {loading ? (
          <div style={{ color: "var(--fg-muted)", fontSize: 14, padding: "20px 0" }}>Loading projects…</div>
        ) : (
          <div className="proj-grid">
            {projects.filter(p => p.name).map(p => {
              const pct = Number(p.progress ?? 0);
              const memberList = p.members && p.members.length > 0
                ? p.members
                : p.owner_name ? [{ name: p.owner_name }] : [];
              const isMenuOpen = openMenuId === p.id;

              return (
                <div key={p.id} style={{ position: "relative" }}>
                  <Link className="proj-card" href={`/projects/${p.id}`}>
                    <div className="pc-top">
                      <div className="grow"><div className="pc-name">{p.name}</div></div>
                      <Badge tone={statusTone(p.status)} dot>{p.status}</Badge>
                    </div>
                    <div className="pc-desc">{p.description || "No description."}</div>
                    <div className="pc-prog-row">
                      <div className="progress"><span style={{ width: `${pct}%` }} /></div>
                      <span className="pct">{pct}%</span>
                    </div>
                    <div className="pc-foot">
                      <div className="avatar-stack">
                        {memberList.slice(0, 3).map(m => (
                          <Avatar key={m.name} name={m.name} size="sm" />
                        ))}
                        {memberList.length > 3 && (
                          <span className="more">+{memberList.length - 3}</span>
                        )}
                      </div>
                      <span className="last">
                        {p.last_active ? `Active ${p.last_active}` : "Active recently"}
                      </span>
                    </div>
                  </Link>

                  {/* Three-dots menu — outside the Link to avoid navigation on click */}
                  <div
                    className="proj-menu-wrap admin-only"
                    style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}
                  >
                    <button
                      className="icon-btn"
                      style={{ width: 28, height: 28 }}
                      title="Project options"
                      onClick={e => { e.preventDefault(); setOpenMenuId(isMenuOpen ? null : p.id); }}
                    >
                      <Ellipsis size={15} />
                    </button>
                    {isMenuOpen && (
                      <div className="proj-menu">
                        <button
                          className="proj-menu-item danger"
                          onClick={e => { e.preventDefault(); setOpenMenuId(null); setConfirmDelete(p); }}
                        >
                          Delete project
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create project modal */}
      {showModal && (
        <div className="modal-scrim" onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); reset(); } }}>
          <div className="modal">
            <div className="modal-head">
              <span className="modal-title">Create project</span>
              <button className="icon-btn" onClick={() => { setShowModal(false); reset(); }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-field">
                <label>Project name *</label>
                <input placeholder="e.g. Beacon Onboarding" {...register("name", { required: "Name is required" })} />
                {errors.name && <span className="form-error">{errors.name.message}</span>}
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea placeholder="What is this project about?" {...register("description")} />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select {...register("status")}>
                  <option value="On Track">On Track</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
              <div className="form-field">
                <label>Due date</label>
                <input type="date" {...register("due_date")} />
              </div>
              {createError && <p className="form-error">{createError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); reset(); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? "Creating…" : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="modal-scrim" onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-head">
              <span className="modal-title">Delete project</span>
              <button className="icon-btn" onClick={() => setConfirmDelete(null)}><X size={18} /></button>
            </div>
            <p style={{ fontSize: 15, color: "var(--fg-body)", margin: "0 0 4px" }}>
              Are you sure you want to delete <b>{confirmDelete.name}</b>?
            </p>
            <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>
              This will permanently remove the project and all its tasks. This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ background: "var(--risk-fg)" }}
                disabled={deleting}
                onClick={doDelete}
              >
                {deleting ? "Deleting…" : "Delete project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
