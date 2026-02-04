import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServerMetrics, ServerStatus } from '../models/server.model';
import { ApiEndpoint, ErrorLog } from '../models/api.model';
import { DashboardFilters } from '../models/filter.model';
import { DataSimulatorService } from './data-simulator.service';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private serverMetrics$ = new BehaviorSubject<ServerMetrics[]>([]);
  private apiPerformance$ = new BehaviorSubject<ApiEndpoint[]>([]);
  private errorLogs$ = new BehaviorSubject<ErrorLog[]>([]);

  private currentFilters: DashboardFilters | null = null;

  constructor(private dataSimulator: DataSimulatorService) {
    this.refreshData();
  }

  getServerMetrics(): Observable<ServerMetrics[]> {
    return this.serverMetrics$.asObservable().pipe(
      map(metrics => this.applyServerFilters(metrics))
    );
  }

  getApiPerformance(): Observable<ApiEndpoint[]> {
    return this.apiPerformance$.asObservable();
  }

  getErrorLogs(): Observable<ErrorLog[]> {
    return this.errorLogs$.asObservable().pipe(
      map(logs => this.applyErrorFilters(logs))
    );
  }

  refreshData(): void {
    // Simulate fetching new data
    this.serverMetrics$.next(this.dataSimulator.generateServerMetrics());
    this.apiPerformance$.next(this.dataSimulator.generateApiMetrics());
    this.errorLogs$.next(this.dataSimulator.generateErrorLogs());
  }

  applyFilters(filters: DashboardFilters): void {
    this.currentFilters = filters;
    // Trigger refresh with new filters
    this.refreshData();
  }

  private applyServerFilters(metrics: ServerMetrics[]): ServerMetrics[] {
    if (!this.currentFilters) return metrics;

    let filtered = metrics;

    if (this.currentFilters.serverIds.length > 0) {
      filtered = filtered.filter(m =>
        this.currentFilters!.serverIds.includes(m.serverId)
      );
    }

    if (this.currentFilters.regions.length > 0) {
      filtered = filtered.filter(m =>
        this.currentFilters!.regions.includes(m.region)
      );
    }

    if (this.currentFilters.showOnlyCritical) {
      filtered = filtered.filter(m =>
        m.status === ServerStatus.CRITICAL ||
        m.status === ServerStatus.WARNING
      );
    }

    return filtered;
  }

  private applyErrorFilters(logs: ErrorLog[]): ErrorLog[] {
    if (!this.currentFilters) return logs;

    return logs.filter(log => {
      const inDateRange = log.timestamp >= this.currentFilters!.dateRange.start &&
                         log.timestamp <= this.currentFilters!.dateRange.end;

      const meetsCriticalFilter = this.currentFilters!.showOnlyCritical
        ? log.severity === 'critical' || log.severity === 'high'
        : true;

      return inDateRange && meetsCriticalFilter;
    });
  }
}
