/**
 * Transforms raw CorEvents from modules into chart-ready data structures.
 * Pure logic service — no side effects, no subscriptions.
 */

import { Injectable } from '@angular/core';
import { CorEvent, EventCode } from '../models/cor-event.model';
import { CorModule } from '../models/cor-message.model';
import { AssayInfo } from '../models/cor-reference-data.model';

// --- Processed output types ---

export type AssayWorkflowStatus =
  | 'normal'
  | 'error'
  | 'inflight'
  | 'warningInflight'
  | 'maxInflight';

export interface ProcessedAssayWorkflow {
  executionId: string;
  assay: string;
  assayDisplayName: string;
  device: string;
  startTime: Date;
  endTime: Date | null;
  status: AssayWorkflowStatus;
  batchIdLast4: string;
  workflowState: string;
  /** All original event properties for tooltip display */
  properties: Record<string, unknown>;
}

export interface ProcessedInstrumentWorkflow {
  executionId: string;
  workflowId: string;
  startTime: Date;
  endTime: Date | null;
  workflowState: string;
  properties: Record<string, unknown>;
}

export interface ProcessedStateTransition {
  timestamp: Date;
  startStateCode: string;
  endStateCode: string;
  properties: Record<string, unknown>;
}

/**
 * MX/GX state bars are duration-based (RTM-85 through RTM-94).
 * Derived from workflowStart/workflowEnd pairs with a workflow condition (TBD),
 * NOT from mxGxState point-in-time events (see RTM-90).
 */
export interface ProcessedAnalyzerStateBar {
  startTime: Date;
  endTime: Date | null;
  endStateCode: string;
  properties: Record<string, unknown>;
}

export interface ProcessedActivity {
  timestamp: Date;
  eventCode: EventCode;
  type: 'activity' | 'errorSample' | 'alert';
  alertType?: string;
  device?: string;
  properties: Record<string, unknown>;
}

export interface ProcessedBootEvent {
  timestamp: Date;
  type: 'boot' | 'powerCycle';
  properties: Record<string, unknown>;
}

export interface ProcessedAnalyzerLaneData {
  assayWorkflows: ProcessedAssayWorkflow[];
  /** Duration bars derived from workflowStart/End (not mxGxState events) */
  stateBars: ProcessedAnalyzerStateBar[];
  instrumentWorkflows: ProcessedInstrumentWorkflow[];
  activities: ProcessedActivity[];
  /** Unique device names found, sorted for consistent lane ordering */
  devices: string[];
}

export interface ProcessedPxLaneData {
  stateTransitions: ProcessedStateTransition[];
  instrumentWorkflows: ProcessedInstrumentWorkflow[];
  activities: ProcessedActivity[];
  bootEvents: ProcessedBootEvent[];
  /** All unique PX states found, for Y-axis labels */
  stateNames: string[];
}

@Injectable({ providedIn: 'root' })
export class EventProcessorService {
  /**
   * Process events for an MX or GX module into chart-ready data.
   * @param assays Reference data for assay display name lookup.
   *   Falls back to the raw assay code when no match is found.
   */
  processAnalyzerEvents(
    module: CorModule,
    referenceTime: Date,
    assays: AssayInfo[]
  ): ProcessedAnalyzerLaneData {
    const events = module.events;
    const assayLookup = new Map(assays.map(a => [a.assayCode, a.displayName]));

    return {
      assayWorkflows: this.processAssayWorkflows(events, referenceTime, assayLookup),
      stateBars: this.deriveAnalyzerStateBars(events),
      instrumentWorkflows: this.processInstrumentWorkflows(events),
      activities: this.processActivities(events),
      devices: this.extractDevices(events),
    };
  }

  /**
   * Process events for the PX module into chart-ready data.
   */
  processPxEvents(module: CorModule): ProcessedPxLaneData {
    const events = module.events;
    const transitions = this.processStateTransitions(events, 'pxState');

    // Collect all unique state names from transitions
    const stateSet = new Set<string>();
    for (const t of transitions) {
      if (t.startStateCode) stateSet.add(t.startStateCode);
      if (t.endStateCode) stateSet.add(t.endStateCode);
    }

    return {
      stateTransitions: transitions,
      instrumentWorkflows: this.processInstrumentWorkflows(events),
      activities: this.processActivities(events),
      bootEvents: this.processBootEvents(events),
      stateNames: Array.from(stateSet),
    };
  }

  /**
   * Pair assayWorkflowStart/End events by executionId and classify status.
   */
  private processAssayWorkflows(
    events: CorEvent[],
    referenceTime: Date,
    assayLookup: Map<string, string>
  ): ProcessedAssayWorkflow[] {
    const starts = new Map<string, CorEvent>();
    const ends = new Map<string, CorEvent>();

    for (const e of events) {
      if (e.eventCode === 'assayWorkflowStart' && e.executionId) {
        starts.set(e.executionId, e);
      }
      if (e.eventCode === 'assayWorkflowEnd' && e.executionId) {
        ends.set(e.executionId, e);
      }
    }

    const workflows: ProcessedAssayWorkflow[] = [];

    for (const [execId, startEvent] of starts) {
      const endEvent = ends.get(execId);
      const startTime = new Date(startEvent.associatedDateTimeOffset);
      const endTime = endEvent ? new Date(endEvent.associatedDateTimeOffset) : null;

      const status = this.classifyWorkflowStatus(startEvent, endEvent, startTime, endTime, referenceTime);

      // Build combined properties from both events for tooltip
      const properties: Record<string, unknown> = { ...startEvent };
      if (endEvent) {
        Object.assign(properties, endEvent);
      }

      workflows.push({
        executionId: execId,
        assay: (startEvent.assay as string) || 'Unknown',
        assayDisplayName:
          assayLookup.get((startEvent.assay as string) || '') ||
          (startEvent.assay as string) ||
          'Unknown',
        device: (startEvent.device as string) || 'Unknown',
        startTime,
        endTime,
        status,
        batchIdLast4: execId.slice(-4),
        workflowState: endEvent
          ? ((endEvent.workflowState as string) || 'complete')
          : 'inflight',
        properties,
      });
    }

    return workflows.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  /**
   * Classify an assay workflow's display status per RFP rules:
   * - normal: completed successfully
   * - error: workflowState = error or aborted
   * - inflight: <4hr with no end event (Warm Gray)
   * - warningInflight: 4-12hr with no end event (Warning color)
   * - maxInflight: >12hr with no end event (Error color, bar ends at 12hr)
   */
  private classifyWorkflowStatus(
    startEvent: CorEvent,
    endEvent: CorEvent | undefined,
    startTime: Date,
    endTime: Date | null,
    referenceTime: Date
  ): AssayWorkflowStatus {
    if (endEvent) {
      const state = (endEvent.workflowState as string) || '';
      if (state === 'error' || state === 'aborted') {
        return 'error';
      }
      return 'normal';
    }

    // No end event — inflight
    const elapsedHours = (referenceTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    if (elapsedHours >= 12) return 'maxInflight';
    if (elapsedHours >= 4) return 'warningInflight';
    return 'inflight';
  }

  /**
   * Extract PX point-in-time state transitions (RTM-117).
   */
  private processStateTransitions(
    events: CorEvent[],
    eventCode: 'pxState'
  ): ProcessedStateTransition[] {
    return events
      .filter(e => e.eventCode === eventCode)
      .map(e => ({
        timestamp: new Date(e.associatedDateTimeOffset),
        startStateCode: (e.startStateCode as string) || '',
        endStateCode: (e.endStateCode as string) || '',
        properties: { ...e },
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Derive MX/GX state duration bars from workflowStart/workflowEnd pairs.
   *
   * Per RTM-90, mxGxState events will not exist in real data. MX/GX states
   * are derived from instrument workflow events with a workflow condition (TBD).
   *
   * TODO: Implement the actual workflow condition filter once BD provides
   * the criteria for which workflowStart/End pairs represent state transitions.
   */
  private deriveAnalyzerStateBars(_events: CorEvent[]): ProcessedAnalyzerStateBar[] {
    // Stub: real derivation logic depends on workflow condition (TBD from BD)
    return [];
  }

  /**
   * Pair workflowStart/End events by executionId for instrument workflows.
   */
  private processInstrumentWorkflows(events: CorEvent[]): ProcessedInstrumentWorkflow[] {
    const starts = new Map<string, CorEvent>();
    const ends = new Map<string, CorEvent>();

    for (const e of events) {
      if (e.eventCode === 'workflowStart' && e.executionId) {
        starts.set(e.executionId, e);
      }
      if ((e.eventCode === 'workflowEnd' || e.eventCode === 'mxAPSInventory') && e.executionId) {
        ends.set(e.executionId, e);
      }
    }

    const workflows: ProcessedInstrumentWorkflow[] = [];

    for (const [execId, startEvent] of starts) {
      const endEvent = ends.get(execId);
      workflows.push({
        executionId: execId,
        workflowId: (startEvent.workflowId as string) || '',
        startTime: new Date(startEvent.associatedDateTimeOffset),
        endTime: endEvent ? new Date(endEvent.associatedDateTimeOffset) : null,
        workflowState: endEvent
          ? ((endEvent.workflowState as string) || 'complete')
          : 'started',
        properties: { ...startEvent, ...(endEvent || {}) },
      });
    }

    return workflows.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  /**
   * Extract activity, error sample, and alert events.
   */
  private processActivities(events: CorEvent[]): ProcessedActivity[] {
    const activityCodes: EventCode[] = [
      'wasteEmptySolid',
      'wasteEmptyLiquid',
      'osdValidation',
      'heartbeat',
    ];
    const errorCodes: EventCode[] = ['errorSample', 'errorTubeTransition'];

    const activities: ProcessedActivity[] = [];

    for (const e of events) {
      if (activityCodes.includes(e.eventCode)) {
        activities.push({
          timestamp: new Date(e.associatedDateTimeOffset),
          eventCode: e.eventCode,
          type: 'activity',
          device: e.device as string | undefined,
          properties: { ...e },
        });
      } else if (errorCodes.includes(e.eventCode)) {
        activities.push({
          timestamp: new Date(e.associatedDateTimeOffset),
          eventCode: e.eventCode,
          type: 'errorSample',
          device: e.device as string | undefined,
          properties: { ...e },
        });
      } else if (e.eventCode === 'alert') {
        activities.push({
          timestamp: new Date(e.associatedDateTimeOffset),
          eventCode: e.eventCode,
          type: 'alert',
          alertType: e.alertType as string | undefined,
          device: e.device as string | undefined,
          properties: { ...e },
        });
      }
    }

    return activities.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Extract boot and power cycle events.
   */
  private processBootEvents(events: CorEvent[]): ProcessedBootEvent[] {
    return events
      .filter(e => e.eventCode === 'boot' || e.eventCode === 'powerCycle')
      .map(e => ({
        timestamp: new Date(e.associatedDateTimeOffset),
        type: e.eventCode as 'boot' | 'powerCycle',
        properties: { ...e },
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Extract unique device names from assay workflow events, sorted.
   */
  private extractDevices(events: CorEvent[]): string[] {
    const devices = new Set<string>();
    for (const e of events) {
      if (
        (e.eventCode === 'assayWorkflowStart' || e.eventCode === 'assayWorkflowEnd') &&
        e.device
      ) {
        devices.add(e.device as string);
      }
    }
    return Array.from(devices).sort();
  }
}
