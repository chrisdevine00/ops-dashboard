/**
 * COR System model for the home/start page.
 * Enriched system data returned by the backend API.
 */

import { ModuleName, ModuleSide } from './cor-message.model';

export type Region = 'North America' | 'EMEA' | 'APAC' | 'LATAM';

export interface ModuleSlot {
  moduleName: ModuleName;
  moduleSide: ModuleSide;
  moduleSerialNumber: string;
}

export interface CorSystem {
  serialNumber: string;
  customerName: string;
  region: Region;
  /** IANA timezone string for the site where the instrument is installed */
  siteTimezone: string;
  softwareVersion: string;
  atlasKey: string;
  /** ISO 8601 date-time — last event received, null if never */
  lastEventTime: string | null;
  /** ISO 8601 date-time — last alert received, null if never */
  lastAlertTime: string | null;
  /**
   * Module configuration: always includes PX, plus 0-2 MX/GX modules.
   * 8 valid configurations: empty-PX-MX, MX-PX-empty, empty-PX-GX,
   * GX-PX-empty, MX-PX-MX, MX-PX-GX, GX-PX-MX, GX-PX-GX
   */
  moduleConfiguration: ModuleSlot[];
}

export interface CorSystemsByRegion {
  region: Region;
  systems: CorSystem[];
}
