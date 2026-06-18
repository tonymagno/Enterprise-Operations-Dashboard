export interface DashboardOverview {
  users: {
    total: number;
    active: number;
  };

  roles: {
    total: number;
  };

  alerts: {
    total: number;
    critical: number;
  };

  telemetry: {
    total: number;
    critical: number;
  };

  system_status: string;
}