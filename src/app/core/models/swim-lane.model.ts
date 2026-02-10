/**
 * Swim lane configuration for the plot page.
 * Derived from the system's module configuration.
 */

import { ModuleName, ModuleSide } from './cor-message.model';

export type SwimLanePosition = 'left' | 'px' | 'right';

export type SwimLaneAxisType =
  | 'alertsErrors'
  | 'assayWorkflow'
  | 'pxState'
  | 'stateTransition';

export interface SwimLaneAxis {
  name: string;
  type: SwimLaneAxisType;
}

export interface SwimLaneConfig {
  position: SwimLanePosition;
  moduleName: ModuleName;
  moduleSide: ModuleSide;
  moduleSerialNumber: string;
  axes: SwimLaneAxis[];
}

/**
 * All 8 valid COR module configurations.
 * Format: Left-PX-Right (empty means no module on that side)
 */
export type InstrumentConfiguration =
  | 'empty-PX-MX'
  | 'MX-PX-empty'
  | 'empty-PX-GX'
  | 'GX-PX-empty'
  | 'MX-PX-MX'
  | 'MX-PX-GX'
  | 'GX-PX-MX'
  | 'GX-PX-GX';
