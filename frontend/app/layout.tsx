import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { RoleProvider } from "@/context/RoleContext";

export const metadata: Metadata = {
  title: "Nexus — Team task orchestration",
  description: "Plan, assign, and ship work with your team and your agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Inline script runs synchronously before paint — prevents dark-mode flash */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('nexus-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark')})()` }} />
      </head>
      <body>
        <AuthProvider>
          <RoleProvider>
            {children}
          </RoleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
