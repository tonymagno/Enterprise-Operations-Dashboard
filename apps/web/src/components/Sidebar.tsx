"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Bell,
  Activity,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  UserCircle,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Users",     href: "/users",     icon: Users },
  { title: "Roles",     href: "/roles",     icon: ShieldCheck },
  { title: "Alerts",    href: "/alerts",    icon: Bell },
  { title: "Telemetry", href: "/telemetry", icon: Activity },
  { title: "Perfil",    href: "/profile",   icon: UserCircle },
];

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
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
}

function NavItem({ title, href, icon: Icon, active, collapsed }: NavItemProps) {
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
            : hovered && !active
            ? "rgba(255,255,255,0.06)"
            : "transparent",
          transition: "all 0.25s ease",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Icon size={22} style={{ flexShrink: 0 }} />
        {!collapsed && (
          <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>
            {title}
          </span>
        )}
      </Link>

      {collapsed && hovered && (
        <div
          style={{
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
          }}
        >
          {title}
          <div
            style={{
              position: "absolute",
              left: "-6px",
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderRight: "6px solid #1E293B",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName]   = useState("Admin");

  useEffect(() => {
    setUserName(getUserNameFromToken());
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  }

  return (
    <aside
      style={{
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
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          display: "flex",
          justifyContent: collapsed ? "center" : "space-between",
          alignItems: "center",
          marginBottom: "40px",
          paddingLeft: collapsed ? 0 : "4px",
        }}
      >
        {!collapsed && (
          <h2 style={{ color: "#FFFFFF", fontSize: "22px", fontWeight: "bold", margin: 0 }}>
            Enterprise
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          style={{
            background: "#1E293B",
            border: "none",
            borderRadius: "10px",
            padding: "8px",
            cursor: "pointer",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navegação */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          flex: 1,
        }}
      >
        {menuItems.map((item) => (
          <NavItem
            key={item.href}
            title={item.title}
            href={item.href}
            icon={item.icon}
            active={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Rodapé: usuário + logout */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: "16px",
          marginTop: "16px",
        }}
      >
        {!collapsed ? (
          <div
            style={{
              background: "#1E293B",
              padding: "14px",
              borderRadius: "14px",
              marginBottom: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <User size={18} color="#fff" />
              </div>
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
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
            <div
              style={{
                background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={18} color="#fff" />
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title="Sair"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "10px",
            padding: "12px 14px",
            borderRadius: "12px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#F87171",
            fontSize: "14px",
            fontWeight: 500,
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(248,113,113,0.10)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <LogOut size={20} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}