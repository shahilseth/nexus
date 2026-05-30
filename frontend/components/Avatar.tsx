"use client";

const AV_TONES = [
  "#dfd7c4", "#cfd3c6", "#d6ccc2", "#c8ccd2",
  "#daccc8", "#d0cabb", "#cdd2cb", "#d3cdd0", "#d8d0c2",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

function toneFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h * 31) + name.charCodeAt(i)) >>> 0;
  return AV_TONES[h % AV_TONES.length];
}

interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  style?: React.CSSProperties;
}

export default function Avatar({ name, size = "md", className = "", style }: AvatarProps) {
  const sizeClass = size === "md" ? "" : size;
  return (
    <span
      className={`avatar ${sizeClass} ${className}`.trim()}
      style={{ background: toneFor(name), ...style }}
    >
      {initials(name)}
    </span>
  );
}
