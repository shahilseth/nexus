"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, LogOut, KeyRound, User, Bell, Palette } from "lucide-react";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();

  /* ── Profile ── */
  const [name, setName] = useState(user?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => { setName(user?.name ?? ""); }, [user?.name]);

  async function saveProfile() {
    if (!name.trim()) return;
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await authApi.updateProfile({ name: name.trim() });
      updateUser({ name: name.trim() });
      setProfileMsg({ text: "Profile updated.", ok: true });
    } catch {
      setProfileMsg({ text: "Failed to save. Try again.", ok: false });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileMsg(null), 3000);
    }
  }

  /* ── Appearance ── */
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("nexus-theme");
    if (saved === "dark") setTheme("dark");
  }, []);

  function applyTheme(t: "light" | "dark") {
    setTheme(t);
    localStorage.setItem("nexus-theme", t);
    document.documentElement.setAttribute("data-theme", t === "dark" ? "dark" : "");
  }

  /* ── Notification prefs ── */
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("nexus-pref-email") === "false") setEmailNotifs(false);
    if (localStorage.getItem("nexus-pref-inapp") === "false") setInAppNotifs(false);
  }, []);

  function toggleEmailNotifs(v: boolean) {
    setEmailNotifs(v);
    localStorage.setItem("nexus-pref-email", String(v));
  }
  function toggleInAppNotifs(v: boolean) {
    setInAppNotifs(v);
    localStorage.setItem("nexus-pref-inapp", String(v));
  }

  /* ── Password ── */
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [changingPwd, setChangingPwd] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdMsg({ text: "All fields are required.", ok: false }); return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ text: "New passwords do not match.", ok: false }); return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ text: "New password must be at least 6 characters.", ok: false }); return;
    }
    setChangingPwd(true);
    setPwdMsg(null);
    try {
      await authApi.changePassword(currentPwd, newPwd);
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setPwdMsg({ text: "Password updated.", ok: true });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setPwdMsg({ text: err.response?.data?.error || "Failed to update password.", ok: false });
    } finally {
      setChangingPwd(false);
      setTimeout(() => setPwdMsg(null), 4000);
    }
  }

  return (
    <AppShell>
      <div className="page settings-page">
        <div className="page-head" style={{ marginBottom: 28 }}>
          <div className="grow">
            <div className="page-title">Settings</div>
            <div className="page-sub">Manage your profile, appearance, and account security.</div>
          </div>
        </div>

        {/* ── Profile ── */}
        <div className="settings-section">
          <div className="settings-section-title">
            <User size={16} /> Profile
          </div>
          <div className="settings-avatar-row">
            <Avatar name={name || user?.name || "?"} size="xl" />
            <div>
              <div style={{ fontSize: 14, color: "var(--fg)", fontWeight: 500 }}>
                {name || user?.name}
              </div>
              <div style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 2 }}>
                Avatar is generated from your display name
              </div>
            </div>
          </div>
          <div className="form-field">
            <label>Display name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="form-field">
            <label>Email address</label>
            <input
              value={user?.email ?? ""}
              readOnly
              style={{ opacity: 0.55, cursor: "default" }}
            />
          </div>
          <div className="settings-save">
            <button className="btn btn-primary" onClick={saveProfile} disabled={savingProfile || !name.trim()}>
              {savingProfile ? "Saving…" : "Save changes"}
            </button>
            {profileMsg && (
              <span className={`settings-save-msg ${profileMsg.ok ? "ok" : "err"}`}>
                {profileMsg.text}
              </span>
            )}
          </div>
        </div>

        {/* ── Appearance ── */}
        <div className="settings-section">
          <div className="settings-section-title">
            <Palette size={16} /> Appearance
          </div>
          <p style={{ fontSize: 14, color: "var(--fg-muted)", margin: "0 0 16px" }}>
            Choose the color scheme for the app. Your preference is saved locally.
          </p>
          <div className="theme-btns">
            <button
              className={`theme-btn${theme === "light" ? " active" : ""}`}
              onClick={() => applyTheme("light")}
            >
              <Sun size={16} /> Light
            </button>
            <button
              className={`theme-btn${theme === "dark" ? " active" : ""}`}
              onClick={() => applyTheme("dark")}
            >
              <Moon size={16} /> Dark
            </button>
          </div>
        </div>

        {/* ── Notifications ── */}
        <div className="settings-section">
          <div className="settings-section-title">
            <Bell size={16} /> Notifications
          </div>
          <div className="settings-toggle-row">
            <div className="settings-toggle-label">
              <div className="label">Email notifications</div>
              <div className="hint">Receive task and activity updates by email</div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={e => toggleEmailNotifs(e.target.checked)}
              />
              <span className="toggle-track" />
            </label>
          </div>
          <div className="settings-toggle-row">
            <div className="settings-toggle-label">
              <div className="label">In-app notifications</div>
              <div className="hint">Show notifications in the bell icon panel</div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={inAppNotifs}
                onChange={e => toggleInAppNotifs(e.target.checked)}
              />
              <span className="toggle-track" />
            </label>
          </div>
        </div>

        {/* ── Account ── */}
        <div className="settings-section">
          <div className="settings-section-title">
            <KeyRound size={16} /> Change password
          </div>
          <form onSubmit={changePassword}>
            <div className="form-field">
              <label>Current password</label>
              <input
                type="password"
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="form-field">
              <label>New password</label>
              <input
                type="password"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="form-field">
              <label>Confirm new password</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            {pwdMsg && (
              <p className={`settings-save-msg ${pwdMsg.ok ? "ok" : "err"}`} style={{ marginBottom: 12 }}>
                {pwdMsg.text}
              </p>
            )}
            <div className="settings-save">
              <button type="submit" className="btn btn-primary" disabled={changingPwd}>
                {changingPwd ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Danger Zone ── */}
        <div className="settings-section danger-zone">
          <div className="settings-section-title" style={{ color: "var(--risk-fg)" }}>
            <LogOut size={16} /> Danger Zone
          </div>
          <p className="danger-desc">
            Logging out will clear your session and return you to the login screen.
          </p>
          <button className="btn-danger" onClick={logout}>
            <LogOut size={16} /> Log out
          </button>
        </div>
      </div>
    </AppShell>
  );
}
