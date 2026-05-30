"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/Avatar";

const BrandMark = () => (
  <svg className="brand-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--charcoal)" }}>
    <circle cx="5" cy="6.5" r="2" /><circle cx="19" cy="6.5" r="2" />
    <circle cx="12" cy="19" r="2" /><circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none" />
    <path d="M6.6 7.7 10.1 10.7M17.4 7.7 13.9 10.7M12 14.3 12 17" />
  </svg>
);

interface LoginForm { email: string; password: string; }
interface SignupForm { name: string; email: string; password: string; confirm: string; }

export default function LoginPage() {
  const [view, setView] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  const loginForm = useForm<LoginForm>({ defaultValues: { email: "shahil@nexus.app", password: "password" } });
  const signupForm = useForm<SignupForm>();

  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [user, isLoading, router]);

  async function onLogin(data: LoginForm) {
    setError("");
    try {
      const res = await authApi.login(data.email, data.password);
      login(res.data.token, res.data.user);
      router.push("/dashboard");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || "Login failed");
    }
  }

  async function onSignup(data: SignupForm) {
    setError("");
    if (data.password !== data.confirm) { setError("Passwords do not match"); return; }
    try {
      const res = await authApi.signup(data.name, data.email, data.password);
      login(res.data.token, res.data.user);
      router.push("/dashboard");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || "Signup failed");
    }
  }

  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="a-brand">
          <BrandMark />
          <span className="brand-name">Nexus</span>
        </div>
        <div className="auth-hero">
          <h1>Where AI teams<br />get things done</h1>
          <p>Plan, assign, and ship work with your team and your agents — all in one calm place.</p>
          <div className="auth-quote">
            <Avatar name="Riya Kapoor" size="sm" />
            <Avatar name="Marcus Lee" size="sm" style={{ marginLeft: -6 }} />
            <Avatar name="Devon Park" size="sm" style={{ marginLeft: -6 }} />
            <span style={{ marginLeft: 6 }}>Trusted by AI-first teams shipping every day.</span>
          </div>
        </div>
      </aside>

      <main className="auth-main">
        {view === "login" ? (
          <div className="auth-card">
            <h2>Welcome back</h2>
            <p className="sub">Log in to pick up where your team left off.</p>
            <form onSubmit={loginForm.handleSubmit(onLogin)}>
              <div className="field-group">
                <div className="field">
                  <label>Email</label>
                  <div className="inp">
                    <Mail size={17} />
                    <input type="email" placeholder="you@company.com" {...loginForm.register("email", { required: true })} />
                  </div>
                </div>
                <div className="field">
                  <div className="field-row">
                    <label>Password</label>
                    <a className="link-quiet" style={{ fontSize: 13 }} href="#">Forgot password?</a>
                  </div>
                  <div className="inp">
                    <Lock size={17} />
                    <input type={showLoginPass ? "text" : "password"} placeholder="••••••••" {...loginForm.register("password", { required: true })} />
                    <button type="button" onClick={() => setShowLoginPass(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-muted)", padding: 0, display: "grid", placeItems: "center" }}>
                      {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              {error && <p style={{ color: "var(--risk-fg)", fontSize: 13, marginTop: 12 }}>{error}</p>}
              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 22 }}>Log in</button>
            </form>
            <div className="divider-or">or</div>
            <button className="google-btn">
              <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"/></svg>
              Continue with Google
            </button>
            <p className="auth-switch">New to Nexus? <a onClick={() => setView("signup")}>Create an account</a></p>
          </div>
        ) : (
          <div className="auth-card">
            <h2>Create your account</h2>
            <p className="sub">Start orchestrating your team in minutes.</p>
            <form onSubmit={signupForm.handleSubmit(onSignup)}>
              <div className="field-group">
                <div className="field">
                  <label>Full name</label>
                  <div className="inp"><User size={17} /><input type="text" placeholder="Aria Sen" {...signupForm.register("name", { required: true })} /></div>
                </div>
                <div className="field">
                  <label>Email</label>
                  <div className="inp"><Mail size={17} /><input type="email" placeholder="you@company.com" {...signupForm.register("email", { required: true })} /></div>
                </div>
                <div className="field">
                  <label>Password</label>
                  <div className="inp">
                    <Lock size={17} />
                    <input type={showSignupPass ? "text" : "password"} placeholder="Create a password" {...signupForm.register("password", { required: true })} />
                    <button type="button" onClick={() => setShowSignupPass(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-muted)", padding: 0, display: "grid", placeItems: "center" }}>
                      {showSignupPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="field">
                  <label>Confirm password</label>
                  <div className="inp">
                    <Lock size={17} />
                    <input type={showConfirmPass ? "text" : "password"} placeholder="Re-enter your password" {...signupForm.register("confirm", { required: true })} />
                    <button type="button" onClick={() => setShowConfirmPass(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-muted)", padding: 0, display: "grid", placeItems: "center" }}>
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              {error && <p style={{ color: "var(--risk-fg)", fontSize: 13, marginTop: 12 }}>{error}</p>}
              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 22 }}>Create account</button>
            </form>
            <div className="divider-or">or</div>
            <button className="google-btn">
              <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"/></svg>
              Sign up with Google
            </button>
            <p className="auth-switch">Already have an account? <a onClick={() => setView("login")}>Log in</a></p>
          </div>
        )}
      </main>
    </div>
  );
}
