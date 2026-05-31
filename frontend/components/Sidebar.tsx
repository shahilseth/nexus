"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderKanban, Users, Search, Settings, CircleHelp,
} from "lucide-react";
import Avatar from "./Avatar";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import type { AppStats } from "./AppShell";

const BrandMark = () => (
  <svg className="brand-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--charcoal)" }}>
    <circle cx="5" cy="6.5" r="2" />
    <circle cx="19" cy="6.5" r="2" />
    <circle cx="12" cy="19" r="2" />
    <circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none" />
    <path d="M6.6 7.7 10.1 10.7M17.4 7.7 13.9 10.7M12 14.3 12 17" />
  </svg>
);

interface SidebarProps {
  onOpenCmdk: () => void;
  stats: AppStats | null;
}

export default function Sidebar({ onOpenCmdk, stats }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { role, setRole } = useRole();

  return (
    <aside className="sidebar">
      <div className="side-head">
        <Link className="brand" href="/dashboard">
          <BrandMark />
          <span className="brand-name">Nexus</span>
        </Link>
      </div>

      <nav className="side-nav">
        <Link className={`nav-item${pathname === "/dashboard" ? " active" : ""}`} href="/dashboard">
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link className={`nav-item${pathname.startsWith("/projects") ? " active" : ""}`} href="/projects">
          <FolderKanban size={18} /> Projects
          {stats && <span className="nav-count">{stats.project_count}</span>}
        </Link>
        <Link className={`nav-item${pathname === "/team" ? " active" : ""}`} href="/team">
          <Users size={18} /> Team
          {stats && <span className="nav-count">{stats.member_count}</span>}
        </Link>

        <div className="nav-section-label">Workspace</div>
        <button className="nav-item" style={{ background: "none", border: "none", width: "100%", textAlign: "left" }} onClick={onOpenCmdk}>
          <Search size={18} /> Search <span className="kbd" style={{ marginLeft: "auto" }}>⌘K</span>
        </button>
        <Link className={`nav-item${pathname === "/settings" ? " active" : ""}`} href="/settings">
          <Settings size={18} /> Settings
        </Link>
        <Link className={`nav-item${pathname === "/help" ? " active" : ""}`} href="/help">
          <CircleHelp size={18} /> Help
        </Link>
      </nav>

      <div className="side-spacer" />

      <div className="side-foot">
        <div className="role-cap">Preview as</div>
        <div className="role-toggle">
          <button className={role === "admin" ? "on" : ""} onClick={() => setRole("admin")}>Admin</button>
          <button className={role === "member" ? "on" : ""} onClick={() => setRole("member")}>Member</button>
        </div>
        {user && (
          <div className="user-row">
            <Avatar name={user.name} size="md" />
            <div className="meta">
              <div className="nm">{user.name}</div>
              <div className="rl">{role === "admin" ? "Admin" : "Member"} · Nexus Labs</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
