import { TimeSeriesDataPoint } from './metric.model';

export interface ApiEndpoint {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  responseTime: TimeSeriesDataPoint[];
  requestCount: number;
  errorRate: number;
  successRate: number;
  p50: number; // 50th percentile response time
  p95: number; // 95th percentile
  p99: number; // 99th percentile
}

export interface ErrorLog {
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  endpoint?: string;
  statusCode?: number;
  count: number;
}
