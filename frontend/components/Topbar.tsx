"use client";

import { Search, Plus, Bell } from "lucide-react";

interface TopbarProps {
  onOpenCmdk: () => void;
  onOpenNotif: () => void;
  unreadCount: number;
}

export default function Topbar({ onOpenCmdk, onOpenNotif, unreadCount }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="search-trigger" onClick={onOpenCmdk} style={{ cursor: "pointer" }}>
        <Search size={17} /> Search projects, tasks, people...
        <span className="kbd">⌘K</span>
      </div>
      <div className="top-spacer" />
      <div className="top-actions">
        <button className="icon-btn" onClick={onOpenCmdk} title="Quick create">
          <Plus size={18} />
        </button>
        <div className="notif-bell-wrap">
          <button className="icon-btn" title="Notifications" onClick={onOpenNotif}>
            <Bell size={18} />
          </button>
          {unreadCount > 0 && <span className="notif-dot" />}
        </div>
      </div>
    </header>
  );
}
