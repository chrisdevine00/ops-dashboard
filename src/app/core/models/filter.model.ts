export interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  timeWindow: '5m' | '15m' | '1h' | '6h' | '24h' | '7d';
  serverIds: string[];
  regions: string[];
  showOnlyCritical: boolean;
  refreshInterval: number; // in seconds
}
