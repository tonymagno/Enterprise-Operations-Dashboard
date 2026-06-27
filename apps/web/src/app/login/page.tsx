"use client";

import { useState } from "react";
import { login } from "../../lib/auth";
import { LayoutDashboard, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const [emailFocus,    setEmailFocus]    = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const data = await login(email, password);

      localStorage.setItem("access_token",  data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      window.location.href = "/dashboard";
    } catch {
      setError("Email ou senha inválidos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function inputStyle(focused: boolean): React.CSSProperties {
    return {
      width: "100%",
      padding: "12px 14px 12px 42px",
      borderRadius: "10px",
      border: `1px solid ${focused ? "#3B82F6" : "rgba(255,255,255,0.10)"}`,
      backgroundColor: "#0F172A",
      color: "#E2E8F0",
      fontSize: "15px",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.2s ease",
    };
  }

  return (
    <>
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #0F172A inset !important;
          -webkit-text-fill-color: #E2E8F0 !important;
          caret-color: #E2E8F0;
          border: 1px solid rgba(255,255,255,0.10) !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#0F172A",
          padding: "20px",
        }}
      >
        {/* Card */}
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "#1E293B",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}
        >
          {/* Topo com gradiente */}
          <div
            style={{
              background: "linear-gradient(135deg, #1D4ED8, #2563EB)",
              padding: "32px 40px 28px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.15)",
                borderRadius: "16px",
                width: "56px",
                height: "56px",
                marginBottom: "16px",
              }}
            >
              <LayoutDashboard size={28} color="#FFFFFF" />
            </div>

            <h1
              style={{
                color: "#FFFFFF",
                fontSize: "1.5rem",
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-0.3px",
              }}
            >
              Enterprise Dashboard
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: "13px",
                marginTop: "6px",
                marginBottom: 0,
              }}
            >
              Acesso restrito — credenciais corporativas
            </p>
          </div>

          {/* Formulário */}
          <div style={{ padding: "32px 40px 36px" }}>
            <form onSubmit={handleSubmit}>

              {/* Erro inline */}
              {error && (
                <div
                  style={{
                    background: "rgba(248,113,113,0.10)",
                    border: "1px solid rgba(248,113,113,0.30)",
                    color: "#F87171",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#94A3B8",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "8px",
                  }}
                >
                  Email
                </label>

                <div style={{ position: "relative" }}>
                  <Mail
                    size={16}
                    color={emailFocus ? "#3B82F6" : "#475569"}
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      transition: "color 0.2s",
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
                    placeholder="admin@empresa.com"
                    required
                    style={inputStyle(emailFocus)}
                  />
                </div>
              </div>

              {/* Senha */}
              <div style={{ marginBottom: "28px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#94A3B8",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "8px",
                  }}
                >
                  Senha
                </label>

                <div style={{ position: "relative" }}>
                  <Lock
                    size={16}
                    color={passwordFocus ? "#3B82F6" : "#475569"}
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      transition: "color 0.2s",
                    }}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
                    placeholder="••••••••"
                    required
                    style={inputStyle(passwordFocus)}
                  />
                </div>
              </div>

              {/* Botão */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  border: "none",
                  background: loading
                    ? "#1D4ED8"
                    : "linear-gradient(135deg, #1D4ED8, #3B82F6)",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.8 : 1,
                  transition: "opacity 0.2s",
                  letterSpacing: "0.2px",
                }}
              >
                {loading ? "Autenticando..." : "Entrar"}
              </button>
            </form>

            {/* Rodapé do card */}
            <p
              style={{
                textAlign: "center",
                color: "#475569",
                fontSize: "12px",
                marginTop: "24px",
                marginBottom: 0,
              }}
            >
              Enterprise Operations Dashboard © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </main>
    </>
  );
}