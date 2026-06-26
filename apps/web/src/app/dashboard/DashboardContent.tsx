"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/Header";
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

export default function DashboardContent() {
  const [data, setData] = useState<DashboardData>({
    users: { total: 0 },
    roles: { total: 0 },
    alerts: { total: 0 },
    telemetry: { total: 0 },
    system_status: "loading",
  });

  const [lastUpdate, setLastUpdate] = useState("");
  const [recentActivities] = useState([
    "Novo usuário cadastrado",
    "Um alerta permanece ativo",
    "Novo evento de telemetria recebido",
  ]);

  async function loadDashboard() {
    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.get(
        "http://localhost:8000/dashboard/overview",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setData({
        users: response.data.users || { total: 0 },
        roles: response.data.roles || { total: 0 },
        alerts: response.data.alerts || { total: 0 },
        telemetry: response.data.telemetry || { total: 0 },
        system_status:
          response.data.system_status || "healthy",
      });

      setLastUpdate(
        new Date().toLocaleTimeString("pt-BR")
      );
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    }
  }

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const chartData = [
    { name: "Usuários", total: data.users.total },
    { name: "Roles", total: data.roles.total },
    { name: "Alertas", total: data.alerts.total },
    { name: "Telemetria", total: data.telemetry.total },
  ];

  const pieData = [
    { name: "Usuários", value: data.users.total },
    { name: "Roles", value: data.roles.total },
    { name: "Alertas", value: data.alerts.total },
    { name: "Telemetria", value: data.telemetry.total },
  ];

  return (
<div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background:
          "linear-gradient(135deg,#020617 0%,#0f172a 45%,#111827 100%)",
        color: "#E2E8F0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
        <Header
          title="Dashboard"
          subtitle={`Status do Sistema: ${data.system_status}`}
        />

        <div
          style={{
            background:
              data.system_status === "healthy"
                ? "#065f46"
                : "#7f1d1d",
            padding: "12px 24px",
            borderRadius: "12px",
            fontWeight: "bold",
          }}
        >
          {data.system_status === "healthy"
            ? "🟢 Sistema Saudável"
            : "🔴 Sistema Crítico"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <StatsCard
          title="Usuários"
          value={data.users.total}
        />

        <StatsCard
          title="Roles"
          value={data.roles.total}
        />

        <StatsCard
          title="Alertas"
          value={data.alerts.total}
        />

        <StatsCard
          title="Telemetria"
          value={data.telemetry.total}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "#172554",
            padding: "20px",
            borderRadius: "20px",
          }}
        >
          <h2>Distribuição Atual</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              <Bar dataKey="total">
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            background: "#172554",
            padding: "20px",
            borderRadius: "20px",
          }}
        >
          <h2>Tendência em Tempo Real</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="total"
                stroke="#60A5FA"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            background: "#172554",
            padding: "20px",
            borderRadius: "20px",
          }}
        >
          <h2>Composição Geral</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={100}
                label
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

{/* ATIVIDADE RECENTE */}
<div
  style={{
    marginTop: "40px",
    background: "#172554",
    padding: "30px",
    borderRadius: "20px",
  }}
>
  <h2
    style={{
      marginBottom: "25px",
      color: "#FFFFFF",
    }}
  >
    Atividade Recente
  </h2>

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    }}
  >
    {recentActivities.map((activity, index) => (
      <div
        key={index}
        style={{
          background: "#09152e",
          padding: "18px 22px",
          borderRadius: "12px",
          color: "#FFFFFF",
          border: "1px solid rgba(255,255,255,0.05)",
          fontSize: "16px",
        }}
      >
        {index === 0 && "✅ "}
        {index === 1 && "⚠️ "}
        {index === 2 && "📡 "}
        {activity}
      </div>
    ))}
  </div>

  <div
    style={{
      marginTop: "20px",
      textAlign: "center",
      color: "#34D399",
    }}
  >
    <div>Última atualização: {lastUpdate}</div>
    <div>Atualização automática a cada 30 segundos</div>
  </div>
</div>
    </div>
  );
}