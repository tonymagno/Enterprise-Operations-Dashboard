"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Users, ShieldCheck, Bell,
  Activity, ChevronLeft, ChevronRight,
  LogOut, User, UserCircle, X, CheckCheck,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Users",     href: "/users",     icon: Users },
  { title: "Roles",     href: "/roles",     icon: ShieldCheck },
  { title: "Alerts",    href: "/alerts",    icon: Bell },
  { title: "Telemetry", href: "/telemetry", icon: Activity },
  { title: "Perfil",    href: "/profile",   icon: UserCircle },
];

const SEVERITY_STYLES: Record<string, { dot: string; bg: string; border: string }> = {
  critical: { dot: "bg-red-500",    bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.20)"  },
  high:     { dot: "bg-orange-400", bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.20)" },
  medium:   { dot: "bg-yellow-400", bg: "rgba(250,204,21,0.08)",  border: "rgba(250,204,21,0.20)" },
  low:      { dot: "bg-slate-400",  bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.20)"},
};

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)  return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  return `${Math.floor(diff / 3600)}h atrás`;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    const json   = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch { return null; }
}

function getUserNameFromToken(): string {
  if (typeof window === "undefined") return "Admin";
  const token = localStorage.getItem("access_token");
  if (!token) return "Admin";
  const payload = decodeJwtPayload(token);
  if (!payload) return "Admin";
  return (
    (payload.name as string)     ||
    (payload.username as string) ||
    (payload.sub as string)      ||
    "Admin"
  );
}

interface NavItemProps {
  title: string;
  href: string;
  icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
  badge?: number;
}

function NavItem({ title, href, icon: Icon, active, collapsed, badge }: NavItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "14px",
          borderRadius: "12px",
          textDecoration: "none",
          color: active ? "#FFFFFF" : "#94A3B8",
          background: active
            ? "linear-gradient(135deg, #2563EB, #3B82F6)"
            : hovered && !active ? "rgba(255,255,255,0.06)" : "transparent",
          transition: "all 0.25s ease",
          justifyContent: collapsed ? "center" : "flex-start",
          position: "relative",
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Icon size={22} />
          {/* Badge de notificação no ícone */}
          {badge !== undefined && badge > 0 && (
            <span style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              background: "#EF4444",
              color: "#fff",
              borderRadius: "50%",
              width: "16px",
              height: "16px",
              fontSize: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              border: "2px solid #0F172A",
            }}>
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </div>

        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
            <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{title}</span>
            {badge !== undefined && badge > 0 && (
              <span style={{
                background: "#EF4444",
                color: "#fff",
                borderRadius: "20px",
                padding: "2px 7px",
                fontSize: "11px",
                fontWeight: 700,
              }}>
                {badge}
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Tooltip no modo colapsado */}
      {collapsed && hovered && (
        <div style={{
          position: "absolute",
          left: "calc(100% + 14px)",
          top: "50%",
          transform: "translateY(-50%)",
          background: "#1E293B",
          color: "#FFFFFF",
          padding: "6px 12px",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: 500,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 9999,
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          {title}
          {badge !== undefined && badge > 0 && (
            <span style={{ marginLeft: "6px", background: "#EF4444", borderRadius: "10px", padding: "1px 6px", fontSize: "10px" }}>
              {badge}
            </span>
          )}
          <div style={{
            position: "absolute", left: "-6px", top: "50%",
            transform: "translateY(-50%)", width: 0, height: 0,
            borderTop: "6px solid transparent", borderBottom: "6px solid transparent",
            borderRight: "6px solid #1E293B",
          }} />
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [collapsed,     setCollapsed]     = useState(false);
  const [userName,      setUserName]      = useState("Admin");
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markAllAsRead, markAsRead, clearAll } = useNotifications();

  useEffect(() => { setUserName(getUserNameFromToken()); }, []);

  // Fechar painel ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  }

  return (
    <aside style={{
      width: collapsed ? "90px" : "260px",
      position: "sticky",
      top: 0,
      height: "100vh",
      flexShrink: 0,
      background: "#0F172A",
      borderRight: "1px solid rgba(255,255,255,0.08)",
      transition: "width 0.3s ease",
      padding: "20px 12px",
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
      overflowX: "hidden",
      zIndex: 100,
    }}>

      {/* ── Cabeçalho ── */}
      <div style={{
        display: "flex",
        justifyContent: collapsed ? "center" : "space-between",
        alignItems: "center",
        marginBottom: "24px",
        paddingLeft: collapsed ? 0 : "4px",
      }}>
        {!collapsed && (
          <h2 style={{ color: "#FFFFFF", fontSize: "22px", fontWeight: "bold", margin: 0 }}>
            Enterprise
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          style={{
            background: "#1E293B", border: "none", borderRadius: "10px",
            padding: "8px", cursor: "pointer", color: "#FFFFFF",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ── Sino de notificações ── */}
      <div ref={panelRef} style={{ position: "relative", marginBottom: "16px" }}>
        <button
          onClick={() => { setShowNotifPanel((v) => !v); if (!showNotifPanel) markAllAsRead(); }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            gap: "10px",
            padding: "12px 14px",
            borderRadius: "12px",
            background: showNotifPanel ? "rgba(255,255,255,0.06)" : "transparent",
            border: "none",
            cursor: "pointer",
            color: "#94A3B8",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = showNotifPanel ? "rgba(255,255,255,0.06)" : "transparent")}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Bell size={22} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: "-6px", right: "-6px",
                background: "#EF4444", color: "#fff",
                borderRadius: "50%", width: "16px", height: "16px",
                fontSize: "10px", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #0F172A",
              }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>

          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
              <span style={{ fontWeight: 500, fontSize: "14px" }}>Notificações</span>
              {unreadCount > 0 && (
                <span style={{
                  background: "#EF4444", color: "#fff",
                  borderRadius: "20px", padding: "2px 7px",
                  fontSize: "11px", fontWeight: 700,
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
          )}
        </button>

        {/* Painel de notificações */}
        {showNotifPanel && (
          <div style={{
            position: "absolute",
            left: collapsed ? "calc(100% + 12px)" : "0",
            top: collapsed ? "0" : "calc(100% + 8px)",
            width: "320px",
            background: "#1E293B",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            zIndex: 9999,
            overflow: "hidden",
          }}>
            {/* Header do painel */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <span style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "14px" }}>
                Notificações
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      title="Marcar todas como lidas"
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B", display: "flex" }}
                    >
                      <CheckCheck size={16} />
                    </button>
                    <button
                      onClick={clearAll}
                      title="Limpar todas"
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B", display: "flex" }}
                    >
                      <X size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Lista */}
            <div style={{ maxHeight: "360px", overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{
                  padding: "40px 20px", textAlign: "center",
                  color: "#475569", fontSize: "13px",
                }}>
                  <Bell size={28} color="#334155" style={{ margin: "0 auto 10px" }} />
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map((n) => {
                  const style = SEVERITY_STYLES[n.severity] ?? SEVERITY_STYLES.medium;
                  return (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      style={{
                        padding: "14px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: n.read ? "transparent" : "rgba(255,255,255,0.02)",
                        cursor: "pointer",
                        transition: "background 0.2s",
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? "transparent" : "rgba(255,255,255,0.02)")}
                    >
                      {/* Dot de severidade */}
                      <div style={{
                        marginTop: "4px", width: "8px", height: "8px",
                        borderRadius: "50%", flexShrink: 0,
                        background: style.dot.replace("bg-", ""),
                        backgroundColor: n.severity === "critical" ? "#EF4444"
                          : n.severity === "high" ? "#FB923C"
                          : n.severity === "medium" ? "#FACC15"
                          : "#94A3B8",
                      }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          alignItems: "flex-start", gap: "8px",
                        }}>
                          <span style={{
                            color: n.read ? "#94A3B8" : "#FFFFFF",
                            fontSize: "13px", fontWeight: n.read ? 400 : 600,
                            lineHeight: 1.4,
                          }}>
                            {n.message}
                          </span>
                          {!n.read && (
                            <span style={{
                              width: "6px", height: "6px", borderRadius: "50%",
                              background: "#3B82F6", flexShrink: 0, marginTop: "4px",
                            }} />
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <span style={{
                            fontSize: "11px", fontWeight: 500,
                            padding: "2px 8px", borderRadius: "20px",
                            background: style.bg,
                            border: `1px solid ${style.border}`,
                            color: n.severity === "critical" ? "#FCA5A5"
                              : n.severity === "high" ? "#FDBA74"
                              : n.severity === "medium" ? "#FDE047"
                              : "#94A3B8",
                          }}>
                            {n.severity === "critical" ? "Crítico"
                              : n.severity === "high" ? "Alto"
                              : n.severity === "medium" ? "Médio" : "Baixo"}
                          </span>
                          <span style={{ color: "#475569", fontSize: "11px" }}>
                            {timeAgo(n.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{
                padding: "12px 18px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
              }}>
                <Link
                  href="/alerts"
                  onClick={() => setShowNotifPanel(false)}
                  style={{ color: "#3B82F6", fontSize: "13px", textDecoration: "none", fontWeight: 500 }}
                >
                  Ver todos os alertas →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Navegação ── */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        {menuItems.map((item) => (
          <NavItem
            key={item.href}
            title={item.title}
            href={item.href}
            icon={item.icon}
            active={pathname === item.href}
            collapsed={collapsed}
            badge={item.href === "/alerts" ? unreadCount : undefined}
          />
        ))}
      </nav>

      {/* ── Rodapé: usuário + logout ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", marginTop: "16px" }}>
        {!collapsed ? (
          <div style={{ background: "#1E293B", padding: "14px", borderRadius: "14px", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                borderRadius: "50%", width: "36px", height: "36px",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <User size={18} color="#fff" />
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontWeight: "bold", color: "#FFFFFF", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {userName}
                </div>
                <div style={{ color: "#34D399", fontSize: "12px", marginTop: "2px" }}>
                  Sistema Online
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
            <div style={{
              background: "linear-gradient(135deg, #2563EB, #3B82F6)",
              borderRadius: "50%", width: "36px", height: "36px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <User size={18} color="#fff" />
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title="Sair"
          style={{
            width: "100%", display: "flex",
            alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
            gap: "10px", padding: "12px 14px", borderRadius: "12px",
            background: "transparent", border: "none", cursor: "pointer",
            color: "#F87171", fontSize: "14px", fontWeight: 500, transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,113,113,0.10)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut size={20} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}