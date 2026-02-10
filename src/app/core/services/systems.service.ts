import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { System, SystemsByRegion, Region } from '../models/system.model';
import { ModuleSlot } from '../models/cor-system.model';

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
      lastAlertTime: new Date('2026-02-04T15:20:00'),
      // GX-PX-MX
      moduleConfiguration: [
        { moduleName: 'GX', moduleSide: 'Left', moduleSerialNumber: 'GX-L-1201' },
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX-0847' },
        { moduleName: 'MX', moduleSide: 'Right', moduleSerialNumber: 'MX-R-1202' },
      ]
    },
    {
      serialNumber: 'SN20240901',
      customerName: 'Central Medical Center',
      region: 'North America',
      lastEventTime: new Date('2026-02-05T09:15:00'),
      lastAlertTime: null,
      // GX-PX-GX
      moduleConfiguration: [
        { moduleName: 'GX', moduleSide: 'Left', moduleSerialNumber: 'GX-L-3001' },
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX-0901' },
        { moduleName: 'GX', moduleSide: 'Right', moduleSerialNumber: 'GX-R-3002' },
      ]
    },
    {
      serialNumber: 'SN20240756',
      customerName: 'University Hospital',
      region: 'North America',
      lastEventTime: new Date('2026-02-05T11:45:00'),
      lastAlertTime: new Date('2026-02-05T08:30:00'),
      // GX-PX-MX
      moduleConfiguration: [
        { moduleName: 'GX', moduleSide: 'Left', moduleSerialNumber: 'GX-L-1203' },
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX-0756' },
        { moduleName: 'MX', moduleSide: 'Right', moduleSerialNumber: 'MX-R-3003' },
      ]
    },
    {
      serialNumber: 'SN20240623',
      customerName: 'Regional Diagnostics',
      region: 'North America',
      lastEventTime: new Date('2026-02-05T07:00:00'),
      lastAlertTime: new Date('2026-02-03T22:15:00'),
      // MX-PX-GX
      moduleConfiguration: [
        { moduleName: 'MX', moduleSide: 'Left', moduleSerialNumber: 'MX-L-3004' },
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX-0623' },
        { moduleName: 'GX', moduleSide: 'Right', moduleSerialNumber: 'GX-R-1204' },
      ]
    },
    // EMEA
    {
      serialNumber: 'SN20240502',
      customerName: 'Berlin Diagnostics',
      region: 'EMEA',
      lastEventTime: new Date('2026-02-05T08:00:00'),
      lastAlertTime: new Date('2026-02-05T07:45:00'),
      // empty-PX-MX
      moduleConfiguration: [
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX-0502' },
        { moduleName: 'MX', moduleSide: 'Right', moduleSerialNumber: 'MX-R-3005' },
      ]
    },
    {
      serialNumber: 'SN20240418',
      customerName: 'London Clinical Labs',
      region: 'EMEA',
      lastEventTime: new Date('2026-02-05T12:30:00'),
      lastAlertTime: null,
      // MX-PX-empty
      moduleConfiguration: [
        { moduleName: 'MX', moduleSide: 'Left', moduleSerialNumber: 'MX-L-3006' },
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX-0418' },
      ]
    },
    {
      serialNumber: 'SN20240389',
      customerName: 'Paris Medical Institute',
      region: 'EMEA',
      lastEventTime: new Date('2026-02-05T06:15:00'),
      lastAlertTime: new Date('2026-02-04T18:00:00'),
      // empty-PX-GX
      moduleConfiguration: [
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX-0389' },
        { moduleName: 'GX', moduleSide: 'Right', moduleSerialNumber: 'GX-R-1205' },
      ]
    },
    // APAC
    {
      serialNumber: 'SN20240234',
      customerName: 'Tokyo General Hospital',
      region: 'APAC',
      lastEventTime: new Date('2026-02-05T03:00:00'),
      lastAlertTime: new Date('2026-02-05T01:30:00'),
      // GX-PX-empty
      moduleConfiguration: [
        { moduleName: 'GX', moduleSide: 'Left', moduleSerialNumber: 'GX-L-1206' },
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX-0234' },
      ]
    },
    {
      serialNumber: 'SN20240198',
      customerName: 'Singapore Health Center',
      region: 'APAC',
      lastEventTime: new Date('2026-02-05T04:45:00'),
      lastAlertTime: null,
      // GX-PX-GX
      moduleConfiguration: [
        { moduleName: 'GX', moduleSide: 'Left', moduleSerialNumber: 'GX-L-1207' },
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX-0198' },
        { moduleName: 'GX', moduleSide: 'Right', moduleSerialNumber: 'GX-R-1208' },
      ]
    },
    {
      serialNumber: 'SN20240156',
      customerName: 'Sydney Pathology',
      region: 'APAC',
      lastEventTime: new Date('2026-02-05T02:30:00'),
      lastAlertTime: new Date('2026-02-04T23:00:00'),
      // MX-PX-MX
      moduleConfiguration: [
        { moduleName: 'MX', moduleSide: 'Left', moduleSerialNumber: 'MX-L-3007' },
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX-0156' },
        { moduleName: 'MX', moduleSide: 'Right', moduleSerialNumber: 'MX-R-3008' },
      ]
    },
    // LATAM
    {
      serialNumber: 'SN20240089',
      customerName: 'Sao Paulo Diagnostics',
      region: 'LATAM',
      lastEventTime: new Date('2026-02-05T09:00:00'),
      lastAlertTime: new Date('2026-02-05T05:45:00'),
      // MX-PX-GX
      moduleConfiguration: [
        { moduleName: 'MX', moduleSide: 'Left', moduleSerialNumber: 'MX-L-3009' },
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX-0089' },
        { moduleName: 'GX', moduleSide: 'Right', moduleSerialNumber: 'GX-R-1209' },
      ]
    },
    {
      serialNumber: 'SN20240045',
      customerName: 'Mexico City Labs',
      region: 'LATAM',
      lastEventTime: new Date('2026-02-05T08:30:00'),
      lastAlertTime: null,
      // GX-PX-MX
      moduleConfiguration: [
        { moduleName: 'GX', moduleSide: 'Left', moduleSerialNumber: 'GX-L-1210' },
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX-0045' },
        { moduleName: 'MX', moduleSide: 'Right', moduleSerialNumber: 'MX-R-3010' },
      ]
    }
  ];

  private readonly REGION_ORDER: Region[] = ['North America', 'EMEA', 'APAC', 'LATAM'];

  private systems$ = new BehaviorSubject<System[]>(this.MOCK_SYSTEMS);

  getSystems(): Observable<System[]> {
    return this.systems$.asObservable();
  }

  getSystemsFlat(): Observable<System[]> {
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

  searchSystems(query: string): Observable<System[]> {
    return this.systems$.pipe(
      map(systems => {
        if (!query || query.trim() === '') {
          return systems;
        }
        const q = query.toLowerCase();
        return systems.filter(s =>
          s.serialNumber.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q)
        );
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
