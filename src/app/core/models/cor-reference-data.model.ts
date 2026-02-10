/**
 * Reference data provided and maintained by BD.
 * Automatic maintenance of reference data is out of scope for MVP.
 */

import { Region } from './cor-system.model';

export interface AssayInfo {
  /** Internal assay code used in events */
  assayCode: string;
  /** Full display name for the assay */
  displayName: string;
  /** Short name or acronym for compact display */
  shortName: string;
}

export interface EventTypeInfo {
  /** Event code matching CorEvent.eventCode */
  eventCode: string;
  /** Human-readable name for this event type */
  displayName: string;
  /** Category for grouping: workflow, state, activity, metric, system */
  category: 'workflow' | 'state' | 'activity' | 'metric' | 'system';
}

export interface CustomerInfo {
  /** UUID identifying the customer system */
  atlasKey: string;
  /** Customer/facility name */
  customerName: string;
  /** Region: North America, EMEA, APAC, LATAM */
  region: Region;
  /** IANA timezone string for the site */
  siteTimezone: string;
}
