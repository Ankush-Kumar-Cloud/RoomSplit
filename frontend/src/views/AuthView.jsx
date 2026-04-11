import { useState } from "react";
import { Btn, Input, Toggle } from "./components/ui";

export default function AuthView({ authCtrl, theme, onToggleTheme }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setBusy(true);
    setErr("");
    try {
      if (tab === "login") await authCtrl.login(form.email, form.password);
      else await authCtrl.signup(form.name, form.email, form.password);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 13 }}>{theme === "dark" ? "🌙" : "☀️"}</span>
        <Toggle checked={theme === "dark"} onChange={onToggleTheme} />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                width: 62,
                height: 62,
                background: "var(--accent)",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 28,
                color: "#fff",
                fontFamily: "Sora, sans-serif",
                fontWeight: 700,
                boxShadow:
                  "0 6px 20px color-mix(in srgb, var(--accent) 35%, transparent)",
              }}
            >
              ₹
            </div>
            <h1
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: 30,
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              RoomSplit
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 6 }}>
              Smart expense sharing for roommates
            </p>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div
              style={{
                display: "flex",
                background: "var(--surface2)",
                borderRadius: 10,
                padding: 4,
                marginBottom: 22,
              }}
            >
              {[
                ["login", "Login"],
                ["signup", "Sign Up"],
              ].map(([t, l]) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setErr("");
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    background: tab === t ? "var(--accent)" : "transparent",
                    color: tab === t ? "#fff" : "var(--text2)",
                    transition: "all .2s",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              autoComplete="on"
              style={{ display: "grid", gap: 14 }}
            >
              {tab === "signup" && (
                <Input
                  name="name"
                  autoComplete="name"
                  label="Full Name *"
                  placeholder="e.g. Rahul Kumar"
                  value={form.name}
                  onChange={set("name")}
                />
              )}
              <Input
                name="email"
                autoComplete="email"
                label="Email *"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
              />
              <Input
                name="password"
                autoComplete={
                  tab === "login" ? "current-password" : "new-password"
                }
                label="Password *"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
              />
              {err && (
                <div
                  style={{
                    background: "var(--dangerBg)",
                    border: "1px solid var(--dangerBd)",
                    borderRadius: 8,
                    padding: "9px 12px",
                    fontSize: 13,
                    color: "var(--danger)",
                    marginBottom: 14,
                  }}
                >
                  {err}
                </div>
              )}
              <Btn
                type="submit"
                full
                disabled={busy}
                style={{
                  fontSize: 14,
                  padding: "11px 0",
                  opacity: busy ? 0.6 : 1,
                }}
              >
                {busy
                  ? "Please wait…"
                  : tab === "login"
                    ? "Login →"
                    : "Create Account →"}
              </Btn>
            </form>
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "var(--text3)",
                marginTop: 14,
              }}
            >
              Sign up → create a group → share invite code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
