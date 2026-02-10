/**
 * COR Instrument Message schema — matches the RFP JSON schema.
 * Messages are delivered via Azure Event Hub in bundles every 5-10 minutes.
 */

export type ModuleName = 'System' | 'PX' | 'MX' | 'GX';
export type ModuleSide = 'NA' | 'Left' | 'Right';

export interface CorModule {
  moduleName: ModuleName;
  moduleSide: ModuleSide;
  moduleSerialNumber: string;
  events: import('./cor-event.model').CorEvent[];
}

export interface CorMessage {
  /** ISO 8601 date-time with offset — when the message was created */
  messageDateTimeOffset: string;
  /** System serial number */
  serialNumber: string;
  /** Four-component semantic version: MAJOR.MINOR.BUILD.REVISION */
  softwareVersion: string;
  /** UUID identifying the system in Atlas */
  atlasKey: string;
  /** Modules reporting events in this message */
  modules: CorModule[];
}
