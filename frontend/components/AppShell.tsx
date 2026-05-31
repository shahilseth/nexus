"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "./CommandPalette";
import BottomNav from "./BottomNav";
import MobileDrawer from "./MobileDrawer";
import NotificationPanel from "./NotificationPanel";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { statsApi, notificationsApi } from "@/lib/api";

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
  const [notifOpen, setNotifOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<AppStats | null>(null);
  const { user, isLoading } = useAuth();
  const { role } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    statsApi.get().then(r => setStats(r.data)).catch(() => {});
    notificationsApi.list()
      .then(r => {
        if (Array.isArray(r.data)) {
          setUnreadCount(r.data.filter((n: { read: boolean }) => !n.read).length);
        }
      })
      .catch(() => {});
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

  function openNotif() {
    setNotifOpen(true);
    if (unreadCount > 0) {
      notificationsApi.markRead().then(() => setUnreadCount(0)).catch(() => {});
    }
  }

  if (isLoading) return null;
  if (!user) return null;

  return (
    <div className={`app role-${role}`}>
      <Sidebar onOpenCmdk={() => setCmdkOpen(true)} stats={stats} />
      <div className="main">
        <Topbar
          onOpenCmdk={() => setCmdkOpen(true)}
          onOpenNotif={openNotif}
          unreadCount={unreadCount}
          onOpenDrawer={() => setDrawerOpen(true)}
        />
        {children}
      </div>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <CommandPalette open={cmdkOpen} onClose={() => setCmdkOpen(false)} />
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <BottomNav />
    </div>
  );
}
