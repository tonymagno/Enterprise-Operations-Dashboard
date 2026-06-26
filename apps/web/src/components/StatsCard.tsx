"use client";

import {
  Users,
  ShieldCheck,
  Bell,
  Activity,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
}

export default function StatsCard({
  title,
  value,
}: StatsCardProps) {
  function getIcon() {
    switch (title.toLowerCase()) {
      case "usuários":
      case "users":
        return <Users size={30} />;

      case "roles":
        return <ShieldCheck size={30} />;

      case "alertas":
      case "alerts":
        return <Bell size={30} />;

      case "telemetria":
      case "telemetry":
        return <Activity size={30} />;

      default:
        return <Activity size={30} />;
    }
  }

  function getTrend() {
    const num = Number(value);

    if (num > 0) {
      return (
        <div className="flex items-center gap-1 text-green-400 text-sm mt-2">
          <TrendingUp size={16} />
          <span>+12%</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-red-400 text-sm mt-2">
        <TrendingDown size={16} />
        <span>-2%</span>
      </div>
    );
  }

  return (
    <div
      className="
        bg-slate-800/70
        border border-slate-700
        rounded-2xl
        p-8
        shadow-xl
        backdrop-blur-md
        hover:scale-105
        transition-all
        duration-300
      "
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-300 text-lg font-medium">
            {title}
          </p>

          <h2 className="text-5xl font-bold text-white mt-3">
            {value}
          </h2>

          {getTrend()}
        </div>

        <div className="text-cyan-400">
          {getIcon()}
        </div>
      </div>
    </div>
  );
}