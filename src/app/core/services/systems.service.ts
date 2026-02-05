import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { System, SystemsByRegion, Region } from '../models/system.model';

@Injectable({
  providedIn: 'root'
})
export class SystemsService {
  private readonly MOCK_SYSTEMS: System[] = [
    // North America
    {
      serialNumber: 'SN20240847',
      customerName: 'Main Laboratory',
      region: 'North America',
      lastEventTime: new Date('2026-02-05T10:30:00'),
      lastAlertTime: new Date('2026-02-04T15:20:00')
    },
    {
      serialNumber: 'SN20240901',
      customerName: 'Central Medical Center',
      region: 'North America',
      lastEventTime: new Date('2026-02-05T09:15:00'),
      lastAlertTime: null
    },
    {
      serialNumber: 'SN20240756',
      customerName: 'University Hospital',
      region: 'North America',
      lastEventTime: new Date('2026-02-05T11:45:00'),
      lastAlertTime: new Date('2026-02-05T08:30:00')
    },
    {
      serialNumber: 'SN20240623',
      customerName: 'Regional Diagnostics',
      region: 'North America',
      lastEventTime: new Date('2026-02-05T07:00:00'),
      lastAlertTime: new Date('2026-02-03T22:15:00')
    },
    // EMEA
    {
      serialNumber: 'SN20240502',
      customerName: 'Berlin Diagnostics',
      region: 'EMEA',
      lastEventTime: new Date('2026-02-05T08:00:00'),
      lastAlertTime: new Date('2026-02-05T07:45:00')
    },
    {
      serialNumber: 'SN20240418',
      customerName: 'London Clinical Labs',
      region: 'EMEA',
      lastEventTime: new Date('2026-02-05T12:30:00'),
      lastAlertTime: null
    },
    {
      serialNumber: 'SN20240389',
      customerName: 'Paris Medical Institute',
      region: 'EMEA',
      lastEventTime: new Date('2026-02-05T06:15:00'),
      lastAlertTime: new Date('2026-02-04T18:00:00')
    },
    // APAC
    {
      serialNumber: 'SN20240234',
      customerName: 'Tokyo General Hospital',
      region: 'APAC',
      lastEventTime: new Date('2026-02-05T03:00:00'),
      lastAlertTime: new Date('2026-02-05T01:30:00')
    },
    {
      serialNumber: 'SN20240198',
      customerName: 'Singapore Health Center',
      region: 'APAC',
      lastEventTime: new Date('2026-02-05T04:45:00'),
      lastAlertTime: null
    },
    {
      serialNumber: 'SN20240156',
      customerName: 'Sydney Pathology',
      region: 'APAC',
      lastEventTime: new Date('2026-02-05T02:30:00'),
      lastAlertTime: new Date('2026-02-04T23:00:00')
    },
    // LATAM
    {
      serialNumber: 'SN20240089',
      customerName: 'Sao Paulo Diagnostics',
      region: 'LATAM',
      lastEventTime: new Date('2026-02-05T09:00:00'),
      lastAlertTime: new Date('2026-02-05T05:45:00')
    },
    {
      serialNumber: 'SN20240045',
      customerName: 'Mexico City Labs',
      region: 'LATAM',
      lastEventTime: new Date('2026-02-05T08:30:00'),
      lastAlertTime: null
    }
  ];

  private readonly REGION_ORDER: Region[] = ['North America', 'EMEA', 'APAC', 'LATAM'];

  private systems$ = new BehaviorSubject<System[]>(this.MOCK_SYSTEMS);

  getSystems(): Observable<System[]> {
    return this.systems$.asObservable();
  }

  getSystemsByRegion(): Observable<SystemsByRegion[]> {
    return this.systems$.pipe(
      map(systems => this.groupByRegion(systems))
    );
  }

  getSystemBySerialNumber(serialNumber: string): Observable<System | undefined> {
    return this.systems$.pipe(
      map(systems => systems.find(s => s.serialNumber === serialNumber))
    );
  }

  searchSystems(query: string): Observable<SystemsByRegion[]> {
    return this.systems$.pipe(
      map(systems => {
        if (!query || query.trim() === '') {
          return this.groupByRegion(systems);
        }
        const filtered = systems.filter(s =>
          s.serialNumber.toLowerCase().includes(query.toLowerCase())
        );
        return this.groupByRegion(filtered);
      })
    );
  }

  private groupByRegion(systems: System[]): SystemsByRegion[] {
    const grouped = new Map<Region, System[]>();

    // Initialize all regions (even if empty after filtering)
    this.REGION_ORDER.forEach(region => grouped.set(region, []));

    // Group systems by region
    systems.forEach(system => {
      const regionSystems = grouped.get(system.region) || [];
      regionSystems.push(system);
      grouped.set(system.region, regionSystems);
    });

    // Convert to array, maintaining region order, excluding empty regions
    return this.REGION_ORDER
      .map(region => ({
        region,
        systems: grouped.get(region) || []
      }))
      .filter(group => group.systems.length > 0);
  }

  refreshSystems(): void {
    // In a real app, this would fetch from an API
    // For now, just re-emit the mock data with updated timestamps
    const updatedSystems = this.MOCK_SYSTEMS.map(system => ({
      ...system,
      lastEventTime: system.lastEventTime ? new Date() : null
    }));
    this.systems$.next(updatedSystems);
  }
}
