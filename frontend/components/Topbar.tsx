"use client";

import { Search, Plus, Bell } from "lucide-react";

interface TopbarProps {
  onOpenCmdk: () => void;
}

export default function Topbar({ onOpenCmdk }: TopbarProps) {
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
        <button className="icon-btn" title="Notifications">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
