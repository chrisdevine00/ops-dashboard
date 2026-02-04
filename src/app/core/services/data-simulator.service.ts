import { Injectable } from '@angular/core';
import { ServerMetrics, ServerStatus } from '../models/server.model';
import { ApiEndpoint, ErrorLog } from '../models/api.model';
import { TimeSeriesDataPoint, MetricSnapshot } from '../models/metric.model';

@Injectable({
  providedIn: 'root'
})
export class DataSimulatorService {
  private readonly SERVERS = [
    { id: 'srv-001', name: 'Web Server 01', region: 'us-east-1' },
    { id: 'srv-002', name: 'Web Server 02', region: 'us-west-2' },
    { id: 'srv-003', name: 'API Server 01', region: 'eu-west-1' },
    { id: 'srv-004', name: 'Database Server', region: 'us-east-1' },
    { id: 'srv-005', name: 'Cache Server', region: 'ap-south-1' },
  ];

  private readonly API_ENDPOINTS = [
    { endpoint: '/api/users', method: 'GET' as const },
    { endpoint: '/api/products', method: 'GET' as const },
    { endpoint: '/api/orders', method: 'POST' as const },
    { endpoint: '/api/auth/login', method: 'POST' as const },
    { endpoint: '/api/analytics', method: 'GET' as const },
  ];

  private random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(this.random(min, max));
  }

  generateServerMetrics(): ServerMetrics[] {
    return this.SERVERS.map(server => ({
      serverId: server.id,
      serverName: server.name,
      region: server.region,
      status: this.getRandomStatus(),
      cpu: this.generateMetricSnapshot(0, 100, '%'),
      memory: this.generateMetricSnapshot(0, 100, '%'),
      disk: this.generateMetricSnapshot(0, 100, '%'),
      network: {
        inbound: this.generateMetricSnapshot(0, 1000, 'Mbps'),
        outbound: this.generateMetricSnapshot(0, 1000, 'Mbps')
      },
      uptime: this.randomInt(0, 8640000), // Up to 100 days in seconds
      lastUpdated: new Date()
    }));
  }

  private generateMetricSnapshot(min: number, max: number, unit: string): MetricSnapshot {
    const current = this.random(min, max);
    const average = this.random(min, max);

    return {
      current: Math.round(current * 10) / 10,
      average: Math.round(average * 10) / 10,
      min: Math.round(this.random(min, current) * 10) / 10,
      max: Math.round(this.random(current, max) * 10) / 10,
      unit,
      trend: this.getRandomTrend(),
      changePercent: this.random(-20, 20)
    };
  }

  generateTimeSeriesData(points: number = 60, baseValue: number = 50): TimeSeriesDataPoint[] {
    const data: TimeSeriesDataPoint[] = [];
    let currentValue = baseValue;
    const now = new Date();

    for (let i = points; i >= 0; i--) {
      // Add some random walk variation
      currentValue += this.random(-5, 5);
      currentValue = Math.max(0, Math.min(100, currentValue)); // Clamp between 0-100

      const timestamp = new Date(now.getTime() - i * 60000); // Minutes ago
      data.push({
        timestamp,
        value: Math.round(currentValue * 10) / 10
      });
    }

    return data;
  }

  generateApiMetrics(): ApiEndpoint[] {
    return this.API_ENDPOINTS.map(endpoint => {
      const requestCount = this.randomInt(1000, 10000);
      const errorCount = this.randomInt(0, requestCount * 0.05);

      return {
        ...endpoint,
        responseTime: this.generateTimeSeriesData(60, this.random(50, 200)),
        requestCount,
        errorRate: (errorCount / requestCount) * 100,
        successRate: ((requestCount - errorCount) / requestCount) * 100,
        p50: this.random(50, 150),
        p95: this.random(150, 300),
        p99: this.random(300, 500)
      };
    });
  }

  generateErrorLogs(count: number = 20): ErrorLog[] {
    const severities: Array<'low' | 'medium' | 'high' | 'critical'> =
      ['low', 'medium', 'high', 'critical'];
    const errorMessages = [
      'Database connection timeout',
      'Authentication failed',
      'Rate limit exceeded',
      'Invalid request payload',
      'Service unavailable',
      'Internal server error',
      'Network connectivity issue',
      'Cache miss - performance degradation'
    ];

    const logs: ErrorLog[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
      logs.push({
        timestamp: new Date(now.getTime() - this.randomInt(0, 120) * 60000),
        severity: severities[this.randomInt(0, severities.length)],
        message: errorMessages[this.randomInt(0, errorMessages.length)],
        endpoint: this.API_ENDPOINTS[
          this.randomInt(0, this.API_ENDPOINTS.length)
        ].endpoint,
        statusCode: [400, 401, 403, 404, 500, 502, 503][
          this.randomInt(0, 7)
        ],
        count: this.randomInt(1, 50)
      });
    }

    return logs.sort((a, b) =>
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  private getRandomStatus(): ServerStatus {
    const rand = Math.random();
    if (rand > 0.95) return ServerStatus.CRITICAL;
    if (rand > 0.85) return ServerStatus.WARNING;
    if (rand > 0.98) return ServerStatus.OFFLINE;
    return ServerStatus.HEALTHY;
  }

  private getRandomTrend(): 'up' | 'down' | 'stable' {
    const rand = Math.random();
    if (rand > 0.6) return 'up';
    if (rand > 0.3) return 'down';
    return 'stable';
  }
}
