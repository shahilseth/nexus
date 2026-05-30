"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "./CommandPalette";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const { role } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

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
      <Sidebar onOpenCmdk={() => setCmdkOpen(true)} />
      <div className="main">
        <Topbar onOpenCmdk={() => setCmdkOpen(true)} />
        {children}
      </div>
      <CommandPalette open={cmdkOpen} onClose={() => setCmdkOpen(false)} />
    </div>
  );
}
