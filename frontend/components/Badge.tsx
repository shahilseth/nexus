"use client";

type BadgeTone = "ok" | "warn" | "risk" | "ai" | "role" | "role-member" | "";

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ tone = "", dot = false, children, className = "" }: BadgeProps) {
  const cls = tone === "role-member"
    ? "badge role member"
    : tone ? `badge ${tone}` : "badge";
  return (
    <span className={`${cls} ${className}`.trim()}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

export function statusTone(status: string): BadgeTone {
  if (status === "On Track") return "ok";
  if (status === "At Risk") return "warn";
  if (status === "Blocked") return "risk";
  if (status === "In Progress") return "warn";
  if (status === "Review") return "ai";
  if (status === "Done") return "ok";
  return "";
}
