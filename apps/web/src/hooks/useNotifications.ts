"use client";

import { useState, useEffect, useCallback } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  read: boolean;
}

const POLL_INTERVAL = 30000; // 30 segundos

const SEVERITY_ORDER: Record<string, number> = {
  critical: 4, high: 3, medium: 2, low: 1,
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastAlertIds,  setLastAlertIds]  = useState<Set<number>>(new Set());

  const fetchAlerts = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch("http://127.0.0.1:8000/alerts/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;

      const alerts: { id: number; title: string; severity: string; status: string }[] =
        await response.json();

      const activeAlerts = alerts.filter((a) => a.status === "active");

      // Detectar alertas novos desde o último poll
      const newAlerts = activeAlerts.filter((a) => !lastAlertIds.has(a.id));

      if (newAlerts.length > 0) {
        const newNotifications: Notification[] = newAlerts.map((a) => ({
          id:        `alert-${a.id}-${Date.now()}`,
          title:     "Alerta Ativo",
          message:   a.title,
          severity:  (a.severity as Notification["severity"]) ?? "medium",
          timestamp: new Date(),
          read:      false,
        }));

        setNotifications((prev) => {
          // Mantém no máximo 20 notificações
          const combined = [...newNotifications, ...prev].slice(0, 20);
          return combined;
        });
      }

      setLastAlertIds(new Set(activeAlerts.map((a) => a.id)));
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  }, [lastAlertIds]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markAsRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const clearAll = () => setNotifications([]);

  const sorted = [...notifications].sort(
    (a, b) =>
      (SEVERITY_ORDER[b.severity] ?? 0) - (SEVERITY_ORDER[a.severity] ?? 0) ||
      b.timestamp.getTime() - a.timestamp.getTime()
  );

  return { notifications: sorted, unreadCount, markAllAsRead, markAsRead, clearAll };
}