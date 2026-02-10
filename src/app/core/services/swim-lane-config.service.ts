/**
 * Determines swim lane configuration from a system's module list.
 * Always produces PX at the bottom, with 0-2 Left/Right lanes above.
 */

import { Injectable } from '@angular/core';
import { ModuleSlot } from '../models/cor-system.model';
import { SwimLaneConfig, SwimLaneAxis } from '../models/swim-lane.model';

@Injectable({ providedIn: 'root' })
export class SwimLaneConfigService {
  /**
   * Build swim lane configs from a system's module configuration.
   * Returns lanes in display order: Left (if any), Right (if any), PX (always last/bottom).
   */
  buildSwimLanes(modules: ModuleSlot[]): SwimLaneConfig[] {
    const lanes: SwimLaneConfig[] = [];

    // Left module (if present)
    const leftModule = modules.find(m => m.moduleSide === 'Left');
    if (leftModule) {
      lanes.push(this.buildAnalyzerLane(leftModule, 'left'));
    }

    // Right module (if present)
    const rightModule = modules.find(m => m.moduleSide === 'Right');
    if (rightModule) {
      lanes.push(this.buildAnalyzerLane(rightModule, 'right'));
    }

    // PX is always present and always at the bottom
    const pxModule = modules.find(m => m.moduleName === 'PX');
    if (pxModule) {
      lanes.push(this.buildPxLane(pxModule));
    }

    return lanes;
  }

  /**
   * Get a display label for a swim lane (e.g., "Left GX", "Right MX").
   */
  getLaneLabel(config: SwimLaneConfig): string {
    if (config.position === 'px') return 'PX';
    return `${config.moduleSide} ${config.moduleName}`;
  }

  private buildAnalyzerLane(
    module: ModuleSlot,
    position: 'left' | 'right'
  ): SwimLaneConfig {
    const axes: SwimLaneAxis[] = [
      { name: 'Alerts & Errors', type: 'alertsErrors' },
      { name: 'State Transition', type: 'stateTransition' },
      { name: 'Assay Workflows', type: 'assayWorkflow' },
    ];

    return {
      position,
      moduleName: module.moduleName,
      moduleSide: module.moduleSide,
      moduleSerialNumber: module.moduleSerialNumber,
      axes,
    };
  }

  private buildPxLane(module: ModuleSlot): SwimLaneConfig {
    const axes: SwimLaneAxis[] = [
      { name: 'Alerts & Errors', type: 'alertsErrors' },
      { name: 'PX States', type: 'pxState' },
    ];

    return {
      position: 'px',
      moduleName: module.moduleName,
      moduleSide: module.moduleSide,
      moduleSerialNumber: module.moduleSerialNumber,
      axes,
    };
  }
}
