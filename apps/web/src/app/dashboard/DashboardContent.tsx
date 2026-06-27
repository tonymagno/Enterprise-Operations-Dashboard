"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import StatsCard from "../../components/StatsCard";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface MetricData {
  total: number;
  active?: number;
}

interface DashboardData {
  users: MetricData;
  roles: MetricData;
  alerts: MetricData;
  telemetry: MetricData;
  system_status: string;
}

const COLORS = ["#60A5FA", "#34D399", "#FBBF24", "#F87171"];

const GRID_COLOR   = "rgba(255,255,255,0.06)";
const AXIS_COLOR   = "#64748B";
const TOOLTIP_STYLE = {
  backgroundColor: "#1E293B",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#E2E8F0",
};

const activities = [
  { icon: "✅", label: "Novo usuário cadastrado",          color: "#34D399" },
  { icon: "⚠️", label: "Um alerta permanece ativo",        color: "#FBBF24" },
  { icon: "📡", label: "Novo evento de telemetria recebido", color: "#60A5FA" },
];

export default function DashboardContent() {
  const [data, setData] = useState<DashboardData>({
    users:         { total: 0 },
    roles:         { total: 0 },
    alerts:        { total: 0 },
    telemetry:     { total: 0 },
    system_status: "loading",
  });

  const [lastUpdate, setLastUpdate] = useState("");

  async function loadDashboard() {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://localhost:8000/dashboard/overview",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData({
        users:         response.data.users     || { total: 0 },
        roles:         response.data.roles     || { total: 0 },
        alerts:        response.data.alerts    || { total: 0 },
        telemetry:     response.data.telemetry || { total: 0 },
        system_status: response.data.system_status || "healthy",
      });
      setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    }
  }

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const chartData = [
    { name: "Usuários",  total: data.users.total },
    { name: "Roles",     total: data.roles.total },
    { name: "Alertas",   total: data.alerts.total },
    { name: "Telemetria",total: data.telemetry.total },
  ];

  const pieData = [
    { name: "Usuários",  value: data.users.total },
    { name: "Roles",     value: data.roles.total },
    { name: "Alertas",   value: data.alerts.total },
    { name: "Telemetria",value: data.telemetry.total },
  ];

  const isHealthy = data.system_status === "healthy";

  return (
    <div style={{ padding: "40px", color: "#E2E8F0", minHeight: "100vh" }}>

      {/* ── Cabeçalho ───────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "36px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2.2rem",
              fontWeight: 700,
              color: "#FFFFFF",
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            Dashboard
          </h1>
          <p style={{ color: "#64748B", marginTop: "6px", fontSize: "14px" }}>
            Status do Sistema:{" "}
            <span style={{ color: isHealthy ? "#34D399" : "#F87171", fontWeight: 600 }}>
              {data.system_status}
            </span>
          </p>
        </div>

        <div
          style={{
            background: isHealthy
              ? "rgba(52,211,153,0.12)"
              : "rgba(248,113,113,0.12)",
            border: `1px solid ${isHealthy ? "#34D399" : "#F87171"}`,
            padding: "10px 22px",
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "14px",
            color: isHealthy ? "#34D399" : "#F87171",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "10px" }}>●</span>
          {isHealthy ? "Sistema Saudável" : "Sistema Crítico"}
        </div>
      </div>

      {/* ── Cards de métricas ───────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "28px",
        }}
      >
        <StatsCard title="Usuários"  value={data.users.total} />
        <StatsCard title="Roles"     value={data.roles.total} />
        <StatsCard title="Alertas"   value={data.alerts.total} />
        <StatsCard title="Telemetria"value={data.telemetry.total} />
      </div>

      {/* ── Gráficos ────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Barras */}
        <div style={chartCard}>
          <h2 style={chartTitle}>Distribuição Atual</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="name" tick={{ fill: AXIS_COLOR, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: AXIS_COLOR, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Linha */}
        <div style={chartCard}>
          <h2 style={chartTitle}>Tendência em Tempo Real</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="name" tick={{ fill: AXIS_COLOR, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: AXIS_COLOR, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: AXIS_COLOR, fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#60A5FA"
                strokeWidth={2.5}
                dot={{ fill: "#60A5FA", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pizza */}
        <div style={chartCard}>
          <h2 style={chartTitle}>Composição Geral</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={100}
                innerRadius={40}
                paddingAngle={3}
                label={({ name, value }) => `${value}`}
                labelLine={false}
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: AXIS_COLOR, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Atividade Recente ────────────────────────────────────── */}
      <div
        style={{
          marginTop: "28px",
          background: "#1E293B",
          padding: "28px",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            color: "#FFFFFF",
            fontSize: "1.1rem",
            fontWeight: 600,
            margin: "0 0 20px 0",
          }}
        >
          Atividade Recente
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {activities.map((activity, index) => (
            <div
              key={index}
              style={{
                background: "#0F172A",
                padding: "16px 20px",
                borderRadius: "10px",
                color: "#E2E8F0",
                border: "1px solid rgba(255,255,255,0.05)",
                borderLeft: `3px solid ${activity.color}`,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "18px" }}>{activity.icon}</span>
              <span>{activity.label}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#475569",
            fontSize: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span style={{ color: "#34D399" }}>Última atualização: {lastUpdate}</span>
          <span>Atualização automática a cada 30 segundos</span>
        </div>
      </div>
    </div>
  );
}

// ── Estilos reutilizáveis ──────────────────────────────────────
const chartCard: React.CSSProperties = {
  background: "#1E293B",
  padding: "24px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.06)",
  borderTop: "3px solid #2563EB",
};

const chartTitle: React.CSSProperties = {
  color: "#FFFFFF",
  fontSize: "1rem",
  fontWeight: 600,
  marginBottom: "20px",
  margin: "0 0 20px 0",
};