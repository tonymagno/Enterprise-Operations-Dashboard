import type { Metadata } from "next";
import "./globals.css";
import SidebarLayout from "@/components/SidebarLayout";

export const metadata: Metadata = {
  title: "Enterprise Operations Dashboard",
  description: "Painel corporativo de operações",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        suppressHydrationWarning
        style={{ margin: 0, padding: 0, background: "#0F172A" }}
      >
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}