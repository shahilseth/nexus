"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Users, Settings, CircleHelp } from "lucide-react";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const BrandMark = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: "var(--charcoal)", width: 24, height: 24, flexShrink: 0 }}
  >
    <circle cx="5" cy="6.5" r="2" />
    <circle cx="19" cy="6.5" r="2" />
    <circle cx="12" cy="19" r="2" />
    <circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none" />
    <path d="M6.6 7.7 10.1 10.7M17.4 7.7 13.9 10.7M12 14.3 12 17" />
  </svg>
);

const NAV_ITEMS = [
  { href: "/dashboard", Icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/projects",  Icon: FolderKanban,    label: "Projects",  exact: false },
  { href: "/team",      Icon: Users,           label: "Team",      exact: true },
  { href: "/settings",  Icon: Settings,        label: "Settings",  exact: true },
  { href: "/help",      Icon: CircleHelp,      label: "Help",      exact: true },
];

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      <div
        className={`mobile-drawer-scrim${open ? " open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        className={`mobile-drawer${open ? " open" : ""}`}
        aria-label="Navigation menu"
      >
        <Link className="mobile-drawer-brand" href="/dashboard" onClick={onClose}>
          <BrandMark />
          <span className="brand-name" style={{ fontSize: 19 }}>Nexus</span>
        </Link>

        <div className="side-nav" style={{ padding: "6px 0" }}>
          {NAV_ITEMS.map(({ href, Icon, label, exact }) => (
            <Link
              key={href}
              className={`nav-item${isActive(href, exact) ? " active" : ""}`}
              href={href}
              onClick={onClose}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
