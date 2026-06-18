type StatsCardProps = {
  title: string;
  value: number | string;
};

export default function StatsCard({
  title,
  value,
}: StatsCardProps) {
  return (
    <div
      style={{
        background: "#1e293b",
        padding: "24px",
        borderRadius: "12px",
        minWidth: "220px",
        textAlign: "center",
        border: "1px solid #334155",
      }}
    >
      <h3
        style={{
          fontSize: "1rem",
          opacity: 0.8,
          marginBottom: "12px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}