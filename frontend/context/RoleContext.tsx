"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Role = "admin" | "member";

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
}

const RoleContext = createContext<RoleContextValue>({
  role: "admin",
  setRole: () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nexus-role");
      if (saved === "admin" || saved === "member") return saved;
    }
    return "admin";
  });

  function setRole(r: Role) {
    localStorage.setItem("nexus-role", r);
    setRoleState(r);
  }

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
