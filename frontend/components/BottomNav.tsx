"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Users } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <Link
        className={`bottom-nav-item${pathname === "/dashboard" ? " active" : ""}`}
        href="/dashboard"
      >
        <LayoutDashboard size={22} />
        <span>Dashboard</span>
      </Link>
      <Link
        className={`bottom-nav-item${pathname.startsWith("/projects") ? " active" : ""}`}
        href="/projects"
      >
        <FolderKanban size={22} />
        <span>Projects</span>
      </Link>
      <Link
        className={`bottom-nav-item${pathname === "/team" ? " active" : ""}`}
        href="/team"
      >
        <Users size={22} />
        <span>Team</span>
      </Link>
    </nav>
  );
}
