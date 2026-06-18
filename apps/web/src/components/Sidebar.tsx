export default function Sidebar() {
  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "#111827",
        padding: "24px",
        borderRight: "1px solid #374151",
      }}
    >
      <h2
        style={{
          marginBottom: "32px",
          fontSize: "1.2rem",
        }}
      >
        Enterprise
      </h2>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <a href="/dashboard">Dashboard</a>

        <a href="/users">Users</a>

        <a href="/roles">Roles</a>

        <a href="/alerts">Alerts</a>

        <a href="/telemetry">Telemetry</a>
      </nav>
    </aside>
  );
}