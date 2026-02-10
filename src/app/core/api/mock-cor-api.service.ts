/**
 * Mock implementation of CorApiService for development.
 * Provides simulated COR system and event data.
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CorApiService } from './cor-api.service';
import {
  SystemsListResponse,
  SystemEventsRequest,
  SystemEventsResponse,
  ReferenceDataResponse,
  AuthUserInfo,
} from './api-contracts';
import { CorSystem, Region } from '../models/cor-system.model';
import { ModuleName, ModuleSide, CorModule } from '../models/cor-message.model';
import { CorEvent, EventCode } from '../models/cor-event.model';

@Injectable()
export class MockCorApiService extends CorApiService {
  private readonly MOCK_SYSTEMS: CorSystem[] = [
    // North America
    {
      serialNumber: 'SN20240847',
      customerName: 'Main Laboratory',
      region: 'North America',
      siteTimezone: 'America/New_York',
      softwareVersion: '2.1.0.1234',
      atlasKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      lastEventTime: '2026-02-05T10:30:00-05:00',
      lastAlertTime: '2026-02-04T15:20:00-05:00',
      moduleConfiguration: [
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX20240847' },
        { moduleName: 'GX', moduleSide: 'Left', moduleSerialNumber: 'GX20241201' },
        { moduleName: 'MX', moduleSide: 'Right', moduleSerialNumber: 'MX20241202' },
      ],
    },
    {
      serialNumber: 'SN20240901',
      customerName: 'Central Medical Center',
      region: 'North America',
      siteTimezone: 'America/Chicago',
      softwareVersion: '2.1.0.1234',
      atlasKey: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      lastEventTime: '2026-02-05T09:15:00-06:00',
      lastAlertTime: null,
      moduleConfiguration: [
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX20240901' },
        { moduleName: 'MX', moduleSide: 'Left', moduleSerialNumber: 'MX20241301' },
        { moduleName: 'MX', moduleSide: 'Right', moduleSerialNumber: 'MX20241302' },
      ],
    },
    {
      serialNumber: 'SN20240756',
      customerName: 'University Hospital',
      region: 'North America',
      siteTimezone: 'America/Los_Angeles',
      softwareVersion: '2.0.3.987',
      atlasKey: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      lastEventTime: '2026-02-05T11:45:00-08:00',
      lastAlertTime: '2026-02-05T08:30:00-08:00',
      moduleConfiguration: [
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX20240756' },
        { moduleName: 'MX', moduleSide: 'Right', moduleSerialNumber: 'MX20241401' },
      ],
    },
    {
      serialNumber: 'SN20240623',
      customerName: 'Regional Diagnostics',
      region: 'North America',
      siteTimezone: 'America/Denver',
      softwareVersion: '2.1.0.1234',
      atlasKey: 'd4e5f6a7-b8c9-0123-defa-234567890123',
      lastEventTime: '2026-02-05T07:00:00-07:00',
      lastAlertTime: '2026-02-03T22:15:00-07:00',
      moduleConfiguration: [
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX20240623' },
        { moduleName: 'GX', moduleSide: 'Left', moduleSerialNumber: 'GX20241501' },
        { moduleName: 'GX', moduleSide: 'Right', moduleSerialNumber: 'GX20241502' },
      ],
    },
    // EMEA
    {
      serialNumber: 'SN20240502',
      customerName: 'Berlin Diagnostics',
      region: 'EMEA',
      siteTimezone: 'Europe/Berlin',
      softwareVersion: '2.1.0.1234',
      atlasKey: 'e5f6a7b8-c9d0-1234-efab-345678901234',
      lastEventTime: '2026-02-05T08:00:00+01:00',
      lastAlertTime: '2026-02-05T07:45:00+01:00',
      moduleConfiguration: [
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX20240502' },
        { moduleName: 'MX', moduleSide: 'Left', moduleSerialNumber: 'MX20241601' },
        { moduleName: 'GX', moduleSide: 'Right', moduleSerialNumber: 'GX20241602' },
      ],
    },
    {
      serialNumber: 'SN20240418',
      customerName: 'London Clinical Labs',
      region: 'EMEA',
      siteTimezone: 'Europe/London',
      softwareVersion: '2.0.3.987',
      atlasKey: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
      lastEventTime: '2026-02-05T12:30:00+00:00',
      lastAlertTime: null,
      moduleConfiguration: [
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX20240418' },
        { moduleName: 'GX', moduleSide: 'Right', moduleSerialNumber: 'GX20241701' },
      ],
    },
    {
      serialNumber: 'SN20240389',
      customerName: 'Paris Medical Institute',
      region: 'EMEA',
      siteTimezone: 'Europe/Paris',
      softwareVersion: '2.1.0.1234',
      atlasKey: 'a7b8c9d0-e1f2-3456-abcd-567890123456',
      lastEventTime: '2026-02-05T06:15:00+01:00',
      lastAlertTime: '2026-02-04T18:00:00+01:00',
      moduleConfiguration: [
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX20240389' },
        { moduleName: 'MX', moduleSide: 'Left', moduleSerialNumber: 'MX20241801' },
        { moduleName: 'MX', moduleSide: 'Right', moduleSerialNumber: 'MX20241802' },
      ],
    },
    // APAC
    {
      serialNumber: 'SN20240234',
      customerName: 'Tokyo General Hospital',
      region: 'APAC',
      siteTimezone: 'Asia/Tokyo',
      softwareVersion: '2.0.3.987',
      atlasKey: 'b8c9d0e1-f2a3-4567-bcde-678901234567',
      lastEventTime: '2026-02-05T03:00:00+09:00',
      lastAlertTime: '2026-02-05T01:30:00+09:00',
      moduleConfiguration: [
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX20240234' },
        { moduleName: 'GX', moduleSide: 'Left', moduleSerialNumber: 'GX20241901' },
        { moduleName: 'MX', moduleSide: 'Right', moduleSerialNumber: 'MX20241902' },
      ],
    },
    {
      serialNumber: 'SN20240198',
      customerName: 'Singapore Health Center',
      region: 'APAC',
      siteTimezone: 'Asia/Singapore',
      softwareVersion: '2.1.0.1234',
      atlasKey: 'c9d0e1f2-a3b4-5678-cdef-789012345678',
      lastEventTime: '2026-02-05T04:45:00+08:00',
      lastAlertTime: null,
      moduleConfiguration: [
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX20240198' },
        { moduleName: 'MX', moduleSide: 'Left', moduleSerialNumber: 'MX20242001' },
      ],
    },
    {
      serialNumber: 'SN20240156',
      customerName: 'Sydney Pathology',
      region: 'APAC',
      siteTimezone: 'Australia/Sydney',
      softwareVersion: '2.0.3.987',
      atlasKey: 'd0e1f2a3-b4c5-6789-defa-890123456789',
      lastEventTime: '2026-02-05T02:30:00+11:00',
      lastAlertTime: '2026-02-04T23:00:00+11:00',
      moduleConfiguration: [
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX20240156' },
        { moduleName: 'GX', moduleSide: 'Left', moduleSerialNumber: 'GX20242101' },
        { moduleName: 'GX', moduleSide: 'Right', moduleSerialNumber: 'GX20242102' },
      ],
    },
    // LATAM
    {
      serialNumber: 'SN20240089',
      customerName: 'Sao Paulo Diagnostics',
      region: 'LATAM',
      siteTimezone: 'America/Sao_Paulo',
      softwareVersion: '2.1.0.1234',
      atlasKey: 'e1f2a3b4-c5d6-7890-efab-901234567890',
      lastEventTime: '2026-02-05T09:00:00-03:00',
      lastAlertTime: '2026-02-05T05:45:00-03:00',
      moduleConfiguration: [
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX20240089' },
        { moduleName: 'MX', moduleSide: 'Left', moduleSerialNumber: 'MX20242201' },
        { moduleName: 'GX', moduleSide: 'Right', moduleSerialNumber: 'GX20242202' },
      ],
    },
    {
      serialNumber: 'SN20240045',
      customerName: 'Mexico City Labs',
      region: 'LATAM',
      siteTimezone: 'America/Mexico_City',
      softwareVersion: '2.0.3.987',
      atlasKey: 'f2a3b4c5-d6e7-8901-fabc-012345678901',
      lastEventTime: '2026-02-05T08:30:00-06:00',
      lastAlertTime: null,
      moduleConfiguration: [
        { moduleName: 'PX', moduleSide: 'NA', moduleSerialNumber: 'PX20240045' },
        { moduleName: 'GX', moduleSide: 'Left', moduleSerialNumber: 'GX20242301' },
      ],
    },
  ];

  private readonly MOCK_REFERENCE_DATA: ReferenceDataResponse = {
    assays: [
      { assayCode: 'HPV', displayName: 'HPV Analysis', shortName: 'HPV' },
      { assayCode: 'CT_GC', displayName: 'CT/GC Detection', shortName: 'CT/GC' },
      { assayCode: 'TV', displayName: 'Trichomonas Vaginalis', shortName: 'TV' },
      { assayCode: 'GBS', displayName: 'Group B Streptococcus', shortName: 'GBS' },
      { assayCode: 'FLU', displayName: 'Influenza A/B', shortName: 'FluA/B' },
      { assayCode: 'RSV', displayName: 'Respiratory Syncytial Virus', shortName: 'RSV' },
    ],
    eventTypes: [
      { eventCode: 'assayWorkflowStart', displayName: 'Assay Workflow Start', category: 'workflow' },
      { eventCode: 'assayWorkflowEnd', displayName: 'Assay Workflow End', category: 'workflow' },
      { eventCode: 'workflowStart', displayName: 'Instrument Workflow Start', category: 'workflow' },
      { eventCode: 'workflowEnd', displayName: 'Instrument Workflow End', category: 'workflow' },
      { eventCode: 'mxAPSInventory', displayName: 'MX APS Inventory', category: 'workflow' },
      { eventCode: 'wasteEmptySolid', displayName: 'Empty Solid Waste', category: 'activity' },
      { eventCode: 'wasteEmptyLiquid', displayName: 'Empty Liquid Waste', category: 'activity' },
      { eventCode: 'osdValidation', displayName: 'OSD Validation', category: 'activity' },
      { eventCode: 'heartbeat', displayName: 'Heartbeat', category: 'system' },
      { eventCode: 'boot', displayName: 'System Boot', category: 'system' },
      { eventCode: 'powerCycle', displayName: 'Power Cycle', category: 'system' },
      { eventCode: 'errorSample', displayName: 'Error Sample', category: 'activity' },
      { eventCode: 'errorTubeTransition', displayName: 'Error Tube Transition', category: 'activity' },
      { eventCode: 'alert', displayName: 'Alert', category: 'activity' },
      { eventCode: 'pxState', displayName: 'PX State Transition', category: 'state' },
      { eventCode: 'mxGxState', displayName: 'MX/GX State Transition', category: 'state' },
      { eventCode: 'metric', displayName: 'Metric', category: 'metric' },
    ],
    customers: this.MOCK_SYSTEMS.map(s => ({
      atlasKey: s.atlasKey,
      customerName: s.customerName,
      region: s.region,
      siteTimezone: s.siteTimezone,
    })),
  };

  getSystems(): Observable<SystemsListResponse> {
    return of({ systems: this.MOCK_SYSTEMS });
  }

  getSystemEvents(request: SystemEventsRequest): Observable<SystemEventsResponse> {
    const system = this.MOCK_SYSTEMS.find(s => s.serialNumber === request.serialNumber);
    if (!system) {
      return of({
        serialNumber: request.serialNumber,
        siteTimezone: 'UTC',
        softwareVersion: '',
        modules: [],
      });
    }

    // Generate mock events for the requested date range
    const modules = this.generateMockModuleEvents(system, request.startDate, request.endDate);
    return of({
      serialNumber: request.serialNumber,
      siteTimezone: system.siteTimezone,
      softwareVersion: system.softwareVersion,
      modules,
    });
  }

  getReferenceData(): Observable<ReferenceDataResponse> {
    return of(this.MOCK_REFERENCE_DATA);
  }

  getCurrentUser(): Observable<AuthUserInfo> {
    return of({
      displayName: 'Demo User',
      email: 'demo.user@bd.com',
      roles: ['COR.Dashboard.Viewer'],
    });
  }

  /**
   * Generate mock events for all modules of a system within a date range.
   * This will be replaced by real Event Hub data in production.
   */
  private generateMockModuleEvents(
    system: CorSystem,
    startDate: string,
    endDate: string
  ): CorModule[] {
    const baseDate = new Date(startDate);
    baseDate.setHours(7, 0, 0, 0);

    return system.moduleConfiguration.map(slot => {
      const events: CorEvent[] = [];

      if (slot.moduleName === 'PX' || slot.moduleName === 'System') {
        this.generatePxEvents(events, baseDate);
      } else {
        this.generateAnalyzerEvents(events, baseDate, slot.moduleName);
      }

      return {
        moduleName: slot.moduleName,
        moduleSide: slot.moduleSide,
        moduleSerialNumber: slot.moduleSerialNumber,
        events,
      };
    });
  }

  private generatePxEvents(events: CorEvent[], baseDate: Date): void {
    // Boot event
    events.push({
      eventCode: 'boot',
      associatedDateTimeOffset: new Date(baseDate.getTime() + 15 * 60000).toISOString(),
      device: 'PX',
    });

    // Power cycle event (earlier)
    events.push({
      eventCode: 'powerCycle',
      associatedDateTimeOffset: new Date(baseDate.getTime()).toISOString(),
      device: 'PX',
    });

    // PX state transitions
    const pxStates = ['PoweredOff', 'PoweredOnStarting', 'OfflineIdle', 'OfflineStarting', 'OnlinePauseIdle', 'Online'];
    let stateTime = baseDate.getTime() + 15 * 60000;
    for (let i = 0; i < pxStates.length - 1; i++) {
      events.push({
        eventCode: 'pxState',
        associatedDateTimeOffset: new Date(stateTime).toISOString(),
        startStateCode: pxStates[i],
        endStateCode: pxStates[i + 1],
      });
      stateTime += 30000 + Math.random() * 30000;
    }

    // Activities (waste, osd)
    const activityCodes: EventCode[] = ['wasteEmptySolid', 'wasteEmptyLiquid', 'osdValidation'];
    for (let i = 0; i < 5; i++) {
      const code = activityCodes[Math.floor(Math.random() * activityCodes.length)];
      events.push({
        eventCode: code,
        associatedDateTimeOffset: new Date(
          baseDate.getTime() + (60 + Math.random() * 900) * 60000
        ).toISOString(),
        device: 'PX',
      });
    }

    // Heartbeat events every 10 minutes
    for (let min = 0; min < 24 * 60; min += 10) {
      events.push({
        eventCode: 'heartbeat',
        associatedDateTimeOffset: new Date(baseDate.getTime() + min * 60000).toISOString(),
      });
    }

    // Alerts
    events.push({
      eventCode: 'alert',
      associatedDateTimeOffset: new Date(baseDate.getTime() + 120 * 60000).toISOString(),
      alertType: 'PX_TEMP_HIGH',
    });
    events.push({
      eventCode: 'alert',
      associatedDateTimeOffset: new Date(baseDate.getTime() + 480 * 60000).toISOString(),
      alertType: 'PX_DOOR_OPEN',
    });

    // Error samples
    for (let i = 0; i < 3; i++) {
      events.push({
        eventCode: 'errorSample',
        associatedDateTimeOffset: new Date(
          baseDate.getTime() + (180 + Math.random() * 600) * 60000
        ).toISOString(),
        device: 'PX',
      });
    }

    // Instrument workflows
    const instrumentWorkflows = [
      { startMin: 120, endMin: 150, workflowId: 'RefillPipettes' },
      { startMin: 360, endMin: 405, workflowId: 'AddMedia' },
      { startMin: 720, endMin: 750, workflowId: 'CalibrationCheck' },
    ];
    for (const iw of instrumentWorkflows) {
      const execId = crypto.randomUUID();
      events.push({
        eventCode: 'workflowStart',
        associatedDateTimeOffset: new Date(baseDate.getTime() + iw.startMin * 60000).toISOString(),
        executionId: execId,
        workflowId: iw.workflowId,
        workflowState: 'started',
      });
      events.push({
        eventCode: 'workflowEnd',
        associatedDateTimeOffset: new Date(baseDate.getTime() + iw.endMin * 60000).toISOString(),
        executionId: execId,
        workflowId: iw.workflowId,
        workflowState: 'complete',
      });
    }
  }

  private generateAnalyzerEvents(events: CorEvent[], baseDate: Date, moduleName: ModuleName): void {
    const assays = moduleName === 'GX'
      ? ['HPV', 'CT_GC', 'TV']
      : ['GBS', 'FLU', 'RSV', 'CT_GC'];
    const devices = moduleName === 'MX'
      ? ['APS1', 'APS2', 'APS3']
      : ['Drawer1', 'Drawer2'];

    // Generate 15-20 assay workflows
    const workflowCount = 15 + Math.floor(Math.random() * 6);
    for (let i = 0; i < workflowCount; i++) {
      const execId = crypto.randomUUID();
      const assay = assays[Math.floor(Math.random() * assays.length)];
      const device = devices[Math.floor(Math.random() * devices.length)];
      const startMin = 45 + Math.random() * 735;
      const startTime = baseDate.getTime() + startMin * 60000;

      events.push({
        eventCode: 'assayWorkflowStart',
        associatedDateTimeOffset: new Date(startTime).toISOString(),
        executionId: execId,
        assay,
        device,
        workflowState: 'started',
      });

      // 85% normal, 10% warning-length, 5% alert-length
      const rand = Math.random();
      let durationMin: number;
      let state: string;

      if (rand > 0.95) {
        // 5% chance: no end event (inflight) — leave open
        continue;
      } else if (rand > 0.90) {
        durationMin = 240 + Math.random() * 480;
        state = 'complete';
      } else if (rand > 0.85) {
        durationMin = 30 + Math.random() * 210;
        state = 'error';
      } else {
        durationMin = 30 + Math.random() * 210;
        state = 'complete';
      }

      events.push({
        eventCode: 'assayWorkflowEnd',
        associatedDateTimeOffset: new Date(startTime + durationMin * 60000).toISOString(),
        executionId: execId,
        assay,
        device,
        workflowState: state,
      });
    }

    // MX/GX state transitions (mock only — RTM-90: mxGxState won't exist in real data)
    const analyzerStates = ['Idle', 'Processing', 'Paused', 'Processing', 'Idle'];
    let stateTime = baseDate.getTime() + 40 * 60000;
    for (let i = 0; i < analyzerStates.length - 1; i++) {
      events.push({
        eventCode: 'mxGxState',
        associatedDateTimeOffset: new Date(stateTime).toISOString(),
        startStateCode: analyzerStates[i],
        endStateCode: analyzerStates[i + 1],
      });
      stateTime += (60 + Math.random() * 180) * 60000;
    }

    // Alerts
    const alertCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < alertCount; i++) {
      events.push({
        eventCode: 'alert',
        associatedDateTimeOffset: new Date(
          baseDate.getTime() + (90 + Math.random() * 780) * 60000
        ).toISOString(),
        alertType: `ALERT_${Math.floor(1000 + Math.random() * 9000)}`,
      });
    }

    // Error samples
    for (let i = 0; i < 2; i++) {
      events.push({
        eventCode: 'errorSample',
        associatedDateTimeOffset: new Date(
          baseDate.getTime() + (120 + Math.random() * 600) * 60000
        ).toISOString(),
        device: devices[Math.floor(Math.random() * devices.length)],
      });
    }

    // Instrument workflows
    const execId = crypto.randomUUID();
    events.push({
      eventCode: 'workflowStart',
      associatedDateTimeOffset: new Date(baseDate.getTime() + 300 * 60000).toISOString(),
      executionId: execId,
      workflowId: 'Maintenance',
      workflowState: 'started',
    });
    events.push({
      eventCode: 'workflowEnd',
      associatedDateTimeOffset: new Date(baseDate.getTime() + 330 * 60000).toISOString(),
      executionId: execId,
      workflowId: 'Maintenance',
      workflowState: 'complete',
    });
  }
}
