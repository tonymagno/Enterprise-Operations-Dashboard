"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { User, Mail, Shield, Hash, Edit3, Check, X } from "lucide-react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const [profile, setProfile]     = useState<UserProfile | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [editing, setEditing]     = useState(false);
  const [editName, setEditName]   = useState("");
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Não autenticado");

      const response = await fetch("http://127.0.0.1:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Erro ${response.status}`);

      const data = await response.json();
      setProfile(data);
      setEditName(data.name);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  async function saveName() {
    if (!profile) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://127.0.0.1:8000/users/${profile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName, email: profile.email }),
      });

      if (!response.ok) throw new Error(`Erro ${response.status}`);

      const updated = await response.json();
      setProfile(updated);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar nome.");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditName(profile?.name ?? "");
    setEditing(false);
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  return (
    <AuthGuard>
      <div style={{ padding: "40px", color: "#E2E8F0", minHeight: "100vh" }}>

        {/* Cabeçalho */}
        <div style={{ marginBottom: "36px" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
            Perfil
          </h1>
          <p style={{ color: "#64748B", marginTop: "6px", fontSize: "14px" }}>
            Informações da sua conta
          </p>
        </div>

        {loading && (
          <div style={{ color: "#64748B", fontSize: "16px" }}>Carregando perfil...</div>
        )}

        {error && (
          <div style={{
            background: "rgba(248,113,113,0.10)",
            border: "1px solid rgba(248,113,113,0.30)",
            color: "#F87171",
            padding: "14px 18px",
            borderRadius: "10px",
            fontSize: "14px",
            marginBottom: "20px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {saved && (
          <div style={{
            background: "rgba(52,211,153,0.10)",
            border: "1px solid rgba(52,211,153,0.30)",
            color: "#34D399",
            padding: "14px 18px",
            borderRadius: "10px",
            fontSize: "14px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <Check size={16} /> Nome atualizado com sucesso.
          </div>
        )}

        {profile && (
          <div style={{ display: "grid", gap: "20px", maxWidth: "680px" }}>

            {/* Card principal */}
            <div style={{
              background: "#1E293B",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}>
              {/* Banner */}
              <div style={{
                background: "linear-gradient(135deg, #1D4ED8, #2563EB)",
                height: "100px",
              }} />

              {/* Avatar + info */}
              <div style={{ padding: "0 32px 32px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "20px",
                  marginTop: "-40px",
                  marginBottom: "24px",
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
                    border: "4px solid #1E293B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}>
                    {getInitials(profile.name)}
                  </div>

                  <div style={{ paddingBottom: "4px" }}>
                    <h2 style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.3rem", margin: 0 }}>
                      {profile.name}
                    </h2>
                    <p style={{ color: "#34D399", fontSize: "13px", margin: "4px 0 0" }}>
                      Sistema Online
                    </p>
                  </div>
                </div>

                {/* Campos */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                  {/* ID */}
                  <div style={fieldRow}>
                    <div style={fieldIcon}>
                      <Hash size={16} color="#64748B" />
                    </div>
                    <div>
                      <div style={fieldLabel}>ID do Usuário</div>
                      <div style={fieldValue}>#{profile.id}</div>
                    </div>
                  </div>

                  {/* Nome */}
                  <div style={fieldRow}>
                    <div style={fieldIcon}>
                      <User size={16} color="#64748B" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={fieldLabel}>Nome</div>
                      {editing ? (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{
                              background: "#0F172A",
                              border: "1px solid #3B82F6",
                              borderRadius: "8px",
                              padding: "8px 12px",
                              color: "#E2E8F0",
                              fontSize: "14px",
                              outline: "none",
                              flex: 1,
                            }}
                          />
                          <button onClick={saveName} disabled={saving} style={btnSave}>
                            <Check size={16} />
                          </button>
                          <button onClick={cancelEdit} style={btnCancel}>
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={fieldValue}>{profile.name}</div>
                          <button onClick={() => setEditing(true)} style={btnEdit} title="Editar nome">
                            <Edit3 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div style={fieldRow}>
                    <div style={fieldIcon}>
                      <Mail size={16} color="#64748B" />
                    </div>
                    <div>
                      <div style={fieldLabel}>Email</div>
                      <div style={fieldValue}>{profile.email}</div>
                    </div>
                  </div>

                  {/* Role */}
                  <div style={fieldRow}>
                    <div style={fieldIcon}>
                      <Shield size={16} color="#64748B" />
                    </div>
                    <div>
                      <div style={fieldLabel}>Perfil de Acesso</div>
                      <div style={{ marginTop: "4px" }}>
                        <span style={{
                          background: "rgba(37,99,235,0.15)",
                          border: "1px solid rgba(37,99,235,0.35)",
                          color: "#60A5FA",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: 500,
                        }}>
                          Administrador
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </AuthGuard>
  );
}

// ── Estilos reutilizáveis ──────────────────────────────────────
const fieldRow: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "14px",
  padding: "14px 0",
  borderTop: "1px solid rgba(255,255,255,0.05)",
};

const fieldIcon: React.CSSProperties = {
  width: "32px",
  height: "32px",
  background: "#0F172A",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  marginTop: "2px",
};

const fieldLabel: React.CSSProperties = {
  color: "#64748B",
  fontSize: "12px",
  fontWeight: 500,
  marginBottom: "4px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const fieldValue: React.CSSProperties = {
  color: "#E2E8F0",
  fontSize: "15px",
  fontWeight: 500,
};

const btnEdit: React.CSSProperties = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "#64748B",
  padding: "4px",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
};

const btnSave: React.CSSProperties = {
  background: "rgba(52,211,153,0.15)",
  border: "1px solid rgba(52,211,153,0.3)",
  borderRadius: "8px",
  padding: "8px",
  cursor: "pointer",
  color: "#34D399",
  display: "flex",
  alignItems: "center",
};

const btnCancel: React.CSSProperties = {
  background: "rgba(248,113,113,0.15)",
  border: "1px solid rgba(248,113,113,0.3)",
  borderRadius: "8px",
  padding: "8px",
  cursor: "pointer",
  color: "#F87171",
  display: "flex",
  alignItems: "center",
};