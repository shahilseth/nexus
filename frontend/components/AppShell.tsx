"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "./CommandPalette";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { statsApi } from "@/lib/api";

interface AppShellProps {
  children: ReactNode;
}

export interface AppStats {
  project_count: number;
  member_count: number;
  tasks_due_today: number;
  overdue_tasks: number;
  members_at_capacity: number;
  projects_added_this_week: number;
}

export default function AppShell({ children }: AppShellProps) {
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [stats, setStats] = useState<AppStats | null>(null);
  const { user, isLoading } = useAuth();
  const { role, setRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "member") {
      setRole(user.role);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user) {
      statsApi.get().then(r => setStats(r.data)).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdkOpen(o => !o);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (isLoading) return null;
  if (!user) return null;

  return (
    <div className={`app role-${role}`}>
      <Sidebar onOpenCmdk={() => setCmdkOpen(true)} stats={stats} />
      <div className="main">
        <Topbar onOpenCmdk={() => setCmdkOpen(true)} />
        {children}
      </div>
      <CommandPalette open={cmdkOpen} onClose={() => setCmdkOpen(false)} />
    </div>
  );
}
