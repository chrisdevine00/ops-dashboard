import { MetricSnapshot } from './metric.model';

export enum ServerStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  OFFLINE = 'offline'
}

export interface ServerMetrics {
  serverId: string;
  serverName: string;
  region: string;
  status: ServerStatus;
  cpu: MetricSnapshot;
  memory: MetricSnapshot;
  disk: MetricSnapshot;
  network: {
    inbound: MetricSnapshot;
    outbound: MetricSnapshot;
  };
  uptime: number; // in seconds
  lastUpdated: Date;
}
