"use client";

import { useEffect, useState } from "react";
import { X, Bell, CheckSquare, ArrowRightCircle, UserPlus, AlertTriangle } from "lucide-react";
import { notificationsApi } from "@/lib/api";

interface Notification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  if (hrs < 48) return "Yesterday";
  return `${Math.floor(hrs / 24)} days ago`;
}

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "task_assigned":  return <CheckSquare size={16} />;
    case "status_changed": return <ArrowRightCircle size={16} />;
    case "member_added":   return <UserPlus size={16} />;
    case "task_overdue":   return <AlertTriangle size={16} />;
    default:               return <Bell size={16} />;
  }
}

export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    notificationsApi.list()
      .then(r => { if (Array.isArray(r.data)) setNotifications(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`notif-scrim${open ? " open" : ""}`} onClick={onClose} />
      <aside className={`notif-panel${open ? " open" : ""}`} aria-label="Notifications">
        <div className="notif-head">
          <span className="notif-title">Notifications</span>
          <div style={{ flex: 1 }} />
          <button className="icon-btn" title="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="notif-body">
          {loading ? (
            <div className="notif-empty">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty">
              <Bell size={30} style={{ opacity: 0.25 }} />
              <span>You&apos;re all caught up</span>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`notif-item${n.read ? "" : " unread"}`}>
                <div className={`notif-icon ${n.type}`}>
                  <TypeIcon type={n.type} />
                </div>
                <div className="notif-content">
                  <div className="notif-msg">{n.message}</div>
                  <div className="notif-time">{timeAgo(n.created_at)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
