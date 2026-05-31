"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { membersApi } from "@/lib/api";

export interface MemberOption {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface MemberSelectProps {
  displayValue?: string;
  onChange: (member: MemberOption) => void;
  placeholder?: string;
  projectId?: string;
}

export default function MemberSelect({
  displayValue,
  onChange,
  placeholder = "Search by name or email…",
  projectId,
}: MemberSelectProps) {
  const [query, setQuery] = useState(displayValue ?? "");
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [open, setOpen] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(displayValue ?? "");
  }, [displayValue]);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  function fetchMembers() {
    if (fetched) return;
    setLoading(true);
    membersApi.list(projectId)
      .then(r => {
        if (Array.isArray(r.data)) {
          setMembers(r.data.map((m: {
            id?: string; user_id?: string; name: string; email: string; role?: string;
          }) => ({
            id: m.user_id ?? m.id ?? "",
            name: m.name,
            email: m.email,
            role: m.role,
          })));
          setFetched(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function handleFocus() {
    setOpen(true);
    fetchMembers();
  }

  function handleSelect(m: MemberOption) {
    setQuery(m.name);
    setOpen(false);
    onChange(m);
  }

  const q = query.toLowerCase();
  const filtered = members.filter(m =>
    !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  );

  return (
    <div className="member-select-wrap" ref={wrapRef}>
      <input
        className="member-select-input"
        type="text"
        placeholder={placeholder}
        value={query}
        autoComplete="off"
        onChange={e => { setQuery(e.target.value); if (!open) { setOpen(true); fetchMembers(); } }}
        onFocus={handleFocus}
      />
      {open && (
        <div className="member-select-dropdown">
          {loading && <div className="msd-item msd-empty">Loading…</div>}
          {!loading && filtered.length === 0 && (
            <div className="msd-item msd-empty">No matches</div>
          )}
          {!loading && filtered.map(m => (
            <button
              key={m.id || m.email}
              type="button"
              className="msd-item"
              onMouseDown={e => { e.preventDefault(); handleSelect(m); }}
            >
              <Avatar name={m.name} size="sm" />
              <div className="msd-text">
                <div className="msd-name">{m.name}</div>
                <div className="msd-email">{m.email}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
