/**
 * API request/response contracts for the COR Dashboard backend.
 * These define what a C# .NET backend would serve.
 */

import { CorSystem } from '../models/cor-system.model';
import { CorModule } from '../models/cor-message.model';
import { AssayInfo, EventTypeInfo, CustomerInfo } from '../models/cor-reference-data.model';

// --- Systems ---

export interface SystemsListResponse {
  systems: CorSystem[];
}

// --- Events ---

export interface SystemEventsRequest {
  serialNumber: string;
  /** ISO 8601 date — start of the query range */
  startDate: string;
  /** ISO 8601 date — end of the query range */
  endDate: string;
}

export interface SystemEventsResponse {
  serialNumber: string;
  /** IANA timezone string for the site (RTM-38: needed for plot page display) */
  siteTimezone: string;
  /** Instrument software version (RTM-38: displayed on plot page header) */
  softwareVersion: string;
  /** Modules with their events for the requested date range */
  modules: CorModule[];
}

// --- Reference Data ---

export interface ReferenceDataResponse {
  assays: AssayInfo[];
  eventTypes: EventTypeInfo[];
  customers: CustomerInfo[];
}

// --- Auth ---

export interface AuthUserInfo {
  displayName: string;
  email: string;
  roles: string[];
}
