export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
}

export interface MetricSnapshot {
  current: number;
  average: number;
  min: number;
  max: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}
