import "./globals.css";

export const metadata = {
  title: "Enterprise Operations Dashboard",
  description: "Enterprise Operations Dashboard Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}