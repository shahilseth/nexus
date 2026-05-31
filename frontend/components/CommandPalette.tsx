"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Box, User, Zap } from "lucide-react";
import Avatar from "./Avatar";
import { projectsApi, membersApi } from "@/lib/api";

interface CmdkItem { t: string; s: string; go: string; av?: boolean; }

const ACTIONS: CmdkItem[] = [
  { t: "Go to dashboard", s: "", go: "/dashboard" },
  { t: "View projects",   s: "", go: "/projects" },
  { t: "View team",       s: "", go: "/team" },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const [projectItems, setProjectItems] = useState<CmdkItem[]>([]);
  const [memberItems, setMemberItems] = useState<CmdkItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSel(0);
    setTimeout(() => inputRef.current?.focus(), 30);

    projectsApi.list()
      .then(r => {
        if (Array.isArray(r.data)) {
          setProjectItems(r.data.slice(0, 8).map((p: { id: string; name: string; status?: string; progress?: number }) => ({
            t: p.name,
            s: [p.status, p.progress !== undefined ? `${p.progress}%` : ""].filter(Boolean).join(" · "),
            go: `/projects/${p.id}`,
          })));
        }
      })
      .catch(() => {});

    membersApi.list()
      .then(r => {
        if (Array.isArray(r.data)) {
          setMemberItems(r.data.slice(0, 6).map((m: { name: string; role?: string; workload_label?: string }) => ({
            t: m.name,
            s: [m.role === "admin" ? "Admin" : "Member", m.workload_label].filter(Boolean).join(" · "),
            go: "/team",
            av: true,
          })));
        }
      })
      .catch(() => {});
  }, [open]);

  const q = query.toLowerCase();

  const filteredProjects = projectItems.filter(i => !q || i.t.toLowerCase().includes(q) || i.s.toLowerCase().includes(q));
  const filteredMembers  = memberItems.filter(i  => !q || i.t.toLowerCase().includes(q) || i.s.toLowerCase().includes(q));
  const filteredActions  = ACTIONS.filter(i      => !q || i.t.toLowerCase().includes(q));

  type GroupKey = "project" | "person" | "action";
  const groups: { group: string; icon: GroupKey; items: CmdkItem[] }[] = ([
    { group: "Projects", icon: "project" as GroupKey, items: filteredProjects },
    { group: "People",   icon: "person"  as GroupKey, items: filteredMembers  },
    { group: "Actions",  icon: "action"  as GroupKey, items: filteredActions  },
  ] as const).filter(g => g.items.length > 0);

  const allRowsRef = useRef<CmdkItem[]>([]);
  allRowsRef.current = groups.flatMap(g => g.items);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") { onClose(); return; }
      const rows = allRowsRef.current;
      if (!rows.length) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => (s + 1) % rows.length); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSel(s => (s - 1 + rows.length) % rows.length); }
      if (e.key === "Enter") {
        const row = rows[sel];
        if (row) { router.push(row.go); onClose(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, sel, onClose]);

  function navigate(go: string) { router.push(go); onClose(); }

  function iconFor(key: GroupKey) {
    if (key === "project") return <Box size={16} />;
    if (key === "person")  return <User size={16} />;
    return <Zap size={16} />;
  }

  if (!open) return null;

  let rowIdx = 0;

  return (
    <div className="cmdk-scrim open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cmdk" role="dialog" aria-label="Command palette">
        <div className="cmdk-input">
          <Search />
          <input
            ref={inputRef}
            placeholder="Search projects, people, actions..."
            autoComplete="off"
            value={query}
            onChange={e => { setQuery(e.target.value); setSel(0); }}
          />
          <span className="kbd">Esc</span>
        </div>
        <div className="cmdk-results">
          {groups.length === 0 && (
            <div className="cmdk-group-label">No results</div>
          )}
          {groups.map(grp => (
            <div key={grp.group}>
              <div className="cmdk-group-label">{grp.group}</div>
              {grp.items.map(item => {
                const idx = rowIdx++;
                return (
                  <div
                    key={`${grp.group}-${item.t}`}
                    className={`cmdk-row${idx === sel ? " sel" : ""}`}
                    onClick={() => navigate(item.go)}
                    onMouseEnter={() => setSel(idx)}
                  >
                    {item.av
                      ? <Avatar name={item.t} size="sm" />
                      : <span className="ci">{iconFor(grp.icon)}</span>
                    }
                    <div className="ctext">
                      <div className="ctitle">{item.t}</div>
                      {item.s && <div className="csub">{item.s}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="cmdk-foot">
          <span className="fk"><span className="kbd">↑</span><span className="kbd">↓</span> navigate</span>
          <span className="fk"><span className="kbd">↵</span> open</span>
          <span className="fk"><span className="kbd">esc</span> dismiss</span>
        </div>
      </div>
    </div>
  );
}
