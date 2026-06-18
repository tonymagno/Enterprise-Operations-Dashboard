import Header from "../../components/Header";
import StatsCard from "../../components/StatsCard";
import Sidebar from "../../components/Sidebar";
import AuthGuard from "../../components/AuthGuard";

async function getDashboardData() {
  const response = await fetch(
    "http://127.0.0.1:8000/dashboard/overview",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Erro ao carregar dashboard"
    );
  }

  return response.json();
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
  <AuthGuard>
    <div
      style={{
        display: "flex",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          minHeight: "100vh",
          padding: "40px",
        }}
      >
        <Header
          title="Dashboard"
          subtitle={`Status do Sistema: ${data.system_status}`}
        />

        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            flexWrap: "wrap",
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
      </main>
    </div>
  </AuthGuard>
);
}