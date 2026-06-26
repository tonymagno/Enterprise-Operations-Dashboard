"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Bell,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Roles",
    href: "/roles",
    icon: ShieldCheck,
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: Bell,
  },
  {
    title: "Telemetry",
    href: "/telemetry",
    icon: Activity,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? "90px" : "260px",
        minHeight: "100vh",
        background: "#0F172A",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        transition: "all 0.3s ease",
        padding: "20px",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: collapsed ? "center" : "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        {!collapsed && (
          <h2
            style={{
              color: "#FFFFFF",
              fontSize: "26px",
              fontWeight: "bold",
            }}
          >
            Enterprise
          </h2>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "#1E293B",
            border: "none",
            borderRadius: "10px",
            padding: "8px",
            cursor: "pointer",
            color: "#FFFFFF",
          }}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px",
                borderRadius: "12px",
                textDecoration: "none",
                color: active ? "#FFFFFF" : "#94A3B8",
                background: active
                  ? "linear-gradient(135deg,#2563EB,#3B82F6)"
                  : "transparent",
                transition: "all .3s",
              }}
            >
              <Icon size={22} />

              {!collapsed && (
                <span
                  style={{
                    fontWeight: 500,
                  }}
                >
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "20px",
            right: "20px",
            background: "#1E293B",
            padding: "16px",
            borderRadius: "14px",
            color: "#FFFFFF",
          }}
        >
          <div style={{ fontWeight: "bold" }}>
            Tony Admin
          </div>

          <div
            style={{
              color: "#34D399",
              fontSize: "14px",
              marginTop: "6px",
            }}
          >
            Sistema Online
          </div>
        </div>
      )}
    </aside>
  );
}