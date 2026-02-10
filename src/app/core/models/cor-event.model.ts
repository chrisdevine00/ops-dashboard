/**
 * COR Event schema — all events have eventCode and associatedDateTimeOffset.
 * Additional properties are preserved and displayed on mouseover.
 */

export type EventCode =
  | 'assayWorkflowStart'
  | 'assayWorkflowEnd'
  | 'workflowStart'
  | 'workflowEnd'
  | 'mxAPSInventory'
  | 'wasteEmptySolid'
  | 'wasteEmptyLiquid'
  | 'osdValidation'
  | 'heartbeat'
  | 'boot'
  | 'powerCycle'
  | 'errorSample'
  | 'errorTubeTransition'
  | 'alert'
  | 'pxState'
  /**
   * RTM-90: Eric confirmed mxGxState event code will NOT be present in real data.
   * MX/GX states are derived from workflowStart/workflowEnd events with a
   * workflow condition (TBD). Retained in the union for reference data compatibility.
   */
  | 'mxGxState'
  | 'metric';

export interface CorEvent {
  /** Identifier specifying the type of event */
  eventCode: EventCode;
  /** ISO 8601 date-time with offset — when the event occurred */
  associatedDateTimeOffset: string;
  /** Workflow instance identifier for correlating start/end events */
  executionId?: string;
  /** Assay name for assay workflow events */
  assay?: string;
  /** Internal COR device associated with the event (e.g., APS1, Drawer1) */
  device?: string;
  /** Workflow state: started, successful, complete, error, aborted, etc. */
  workflowState?: string;
  /** Workflow definition/type identifier (UUID) */
  workflowId?: string;
  /** Alert code displayed to the user at the instrument */
  alertType?: string;
  /** Starting state for state transition events */
  startStateCode?: string;
  /** Ending/goal state for state transition events */
  endStateCode?: string;
  /** Metric name for metric events */
  metricName?: string;
  /** Metric value for metric events */
  metricValue?: number;
  /** Events may contain additional properties beyond the schema */
  [additionalProperty: string]: unknown;
}
