"use client";

/* Nine deterministic tone slots — background set by CSS (.av-0 … .av-8)
   so both light-mode and dark-mode can apply the right palette. */
function slotFor(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h * 31) + name.charCodeAt(i)) >>> 0;
  return h % 9;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  style?: React.CSSProperties;
}

export default function Avatar({ name, size = "md", className = "", style }: AvatarProps) {
  const sizeClass = size === "md" ? "" : size;
  const slot = slotFor(name);
  return (
    <span
      className={`avatar av-${slot} ${sizeClass} ${className}`.trim()}
      style={style}
    >
      {initials(name)}
    </span>
  );
}
