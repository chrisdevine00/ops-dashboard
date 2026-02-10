/**
 * System model interfaces for the ops dashboard home page
 */

import { ModuleSlot } from './cor-system.model';

export type Region = 'North America' | 'EMEA' | 'APAC' | 'LATAM';

export interface System {
  serialNumber: string;
  customerName: string;
  region: Region;
  lastEventTime: Date | null;
  lastAlertTime: Date | null;
  moduleConfiguration: ModuleSlot[];
}

export interface SystemsByRegion {
  region: Region;
  systems: System[];
}
