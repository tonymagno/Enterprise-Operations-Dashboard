"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

// Rotas que NÃO devem mostrar a Sidebar
const NO_SIDEBAR_ROUTES = ["/", "/login"];

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const showSidebar = !NO_SIDEBAR_ROUTES.includes(pathname);

  // Páginas de auth: renderiza sem Sidebar
  if (!showSidebar) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0F172A",
          color: "#ffffff",
        }}
      >
        {children}
      </div>
    );
  }

  // Páginas protegidas: Sidebar + conteúdo em flex
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: "100vh",
          background: "#0F172A",
          color: "#ffffff",
          overflowX: "hidden",
        }}
      >
        {children}
      </main>
    </div>
  );
}