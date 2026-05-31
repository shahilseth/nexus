"use client";

import Link from "next/link";
import { Search, Plus, Bell, Menu } from "lucide-react";

const BrandMark = () => (
  <svg
    className="brand-mark"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: "var(--charcoal)", width: 24, height: 24 }}
  >
    <circle cx="5" cy="6.5" r="2" />
    <circle cx="19" cy="6.5" r="2" />
    <circle cx="12" cy="19" r="2" />
    <circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none" />
    <path d="M6.6 7.7 10.1 10.7M17.4 7.7 13.9 10.7M12 14.3 12 17" />
  </svg>
);

interface TopbarProps {
  onOpenCmdk: () => void;
  onOpenNotif: () => void;
  unreadCount: number;
  onOpenDrawer: () => void;
}

export default function Topbar({ onOpenCmdk, onOpenNotif, unreadCount, onOpenDrawer }: TopbarProps) {
  return (
    <header className="topbar">
      {/* Hamburger — mobile only */}
      <button className="icon-btn mobile-hamburger" onClick={onOpenDrawer} aria-label="Open menu">
        <Menu size={22} />
      </button>

      {/* Brand — mobile only, absolutely centred */}
      <Link className="mobile-topbar-brand" href="/dashboard">
        <BrandMark />
        <span className="brand-name" style={{ fontSize: 18 }}>Nexus</span>
      </Link>

      {/* Search — desktop only */}
      <div className="search-trigger topbar-search" onClick={onOpenCmdk} style={{ cursor: "pointer" }}>
        <Search size={17} /> Search projects, tasks, people...
        <span className="kbd">⌘K</span>
      </div>

      <div className="top-spacer" />

      <div className="top-actions">
        {/* Plus — desktop only */}
        <button className="icon-btn topbar-plus" onClick={onOpenCmdk} title="Quick create">
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
