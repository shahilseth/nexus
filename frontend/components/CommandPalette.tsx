"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Box, SquareCheckBig, User, Zap } from "lucide-react";
import Avatar from "./Avatar";

const CMDK_DATA = [
  {
    group: "Projects", icon: <Box size={16} />, items: [
      { t: "Nexus",          s: "On Track · 68%",  go: "/projects" },
      { t: "Atlas Migration",s: "At Risk · 41%",   go: "/projects" },
      { t: "Pulse Analytics",s: "On Track · 80%",  go: "/projects" },
    ],
  },
  {
    group: "Tasks", icon: <SquareCheckBig size={16} />, items: [
      { t: "Wire up auth flow",       s: "Nexus · In Progress", go: "/projects" },
      { t: "Migrate billing tables",  s: "Atlas · Blocked",     go: "/projects" },
      { t: "Design empty states",     s: "Nexus · Review",      go: "/projects" },
    ],
  },
  {
    group: "People", icon: <User size={16} />, items: [
      { t: "Riya Kapoor", s: "Member · at capacity", go: "/team", av: true },
      { t: "Marcus Lee",  s: "Member",                go: "/team", av: true },
      { t: "Aria Sen",    s: "Admin · you",           go: "/team", av: true },
    ],
  },
  {
    group: "Actions", icon: <Zap size={16} />, items: [
      { t: "Go to dashboard", s: "", go: "/dashboard" },
      { t: "View projects",   s: "", go: "/projects" },
      { t: "View team",       s: "", go: "/team" },
    ],
  },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") { onClose(); return; }
      const rows = allRows();
      if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => (s + 1) % rows.length); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSel(s => (s - 1 + rows.length) % rows.length); }
      if (e.key === "Enter") { const row = rows[sel]; if (row) { router.push(row.go); onClose(); } }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, sel, query]);

  const q = query.toLowerCase();
  const filtered = CMDK_DATA.map(g => ({
    ...g,
    items: g.items.filter(i => i.t.toLowerCase().includes(q) || i.s.toLowerCase().includes(q)),
  })).filter(g => g.items.length > 0);

  function allRows() {
    return filtered.flatMap(g => g.items);
  }

  let rowIdx = 0;

  function navigate(go: string) { router.push(go); onClose(); }

  if (!open) return null;

  return (
    <>
      <div className={`cmdk-scrim${open ? " open" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="cmdk" role="dialog" aria-label="Command palette">
          <div className="cmdk-input">
            <Search />
            <input
              ref={inputRef}
              placeholder="Search projects, tasks, people, actions..."
              autoComplete="off"
              value={query}
              onChange={e => { setQuery(e.target.value); setSel(0); }}
            />
            <span className="kbd">Esc</span>
          </div>
          <div className="cmdk-results">
            {filtered.length === 0 && (
              <div className="cmdk-group-label">No results</div>
            )}
            {filtered.map(grp => (
              <div key={grp.group}>
                <div className="cmdk-group-label">{grp.group}</div>
                {grp.items.map(item => {
                  const idx = rowIdx++;
                  return (
                    <div
                      key={item.t}
                      className={`cmdk-row${idx === sel ? " sel" : ""}`}
                      onClick={() => navigate(item.go)}
                      onMouseEnter={() => setSel(idx)}
                    >
                      {(item as { av?: boolean }).av
                        ? <Avatar name={item.t} size="sm" />
                        : <span className="ci">{grp.icon}</span>
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
    </>
  );
}
