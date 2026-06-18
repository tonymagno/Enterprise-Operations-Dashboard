type HeaderProps = {
  title: string;
  subtitle?: string;
};

export default function Header({
  title,
  subtitle,
}: HeaderProps) {
  return (
    <header
      style={{
        textAlign: "center",
        marginBottom: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          style={{
            opacity: 0.8,
            fontSize: "1rem",
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}