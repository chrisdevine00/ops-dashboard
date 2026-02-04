import { Component, OnInit, OnDestroy } from '@angular/core';
import { EChartsOption } from 'echarts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// BD Brand Colors
const BD_BLUE = '#0446ED';       // Reserved for UI chrome
const BD_ORANGE = '#FF6E00';     // Brand accent
const BD_GRAY = '#BFB8B8';       // Neutral

// BD Secondary Colors for Data Visualization
const BD_COMET = '#2995C5';       // Cyan/teal - primary chart color
const BD_NEBULA = '#00C9A7';      // Green - success/completed
const BD_AURORA = '#FA7C23';      // Orange - warnings (4-12hr)
const BD_AURORA_LIGHT = '#FFB84D'; // Light orange - extended (12hr+)
const BD_INFRARED = '#FF6B61';    // Red - errors/alerts
const BD_ECLIPSE = '#FFC300';     // Gold - highlights
const BD_ULTRAVIOLET = '#9199D8'; // Purple - alternative data

interface WorkflowTask {
  name: string;
  acronym: string;
  start: Date;
  end: Date;
  status: 'normal' | 'warning' | 'alert';
  lane: number;
}

interface StateTransition {
  timestamp: Date;
  state: string;
}

// A workflow is a sequence of state transitions that happen together
interface DeviceWorkflow {
  startTime: Date;
  states: StateTransition[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  // Metrics
  activeWorkflows = 0;
  completedToday = 0;
  avgWorkflowTime = 0;
  alertsGenerated = 0;

  // Date navigation
  currentDate: Date = new Date();
  formattedDate = '';

  // Chart options
  leftGxChartOptions: EChartsOption = {};
  rightMxChartOptions: EChartsOption = {};
  pxChartOptions: EChartsOption = {};

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.updateFormattedDate();
    this.generateCharts();
    this.updateMetrics();
  }

  private updateFormattedDate(): void {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    this.formattedDate = this.currentDate.toLocaleDateString('en-US', options);
  }

  nextDay(): void {
    this.currentDate = new Date(this.currentDate.getTime() + 24 * 60 * 60 * 1000);
    this.updateFormattedDate();
    this.generateCharts();
    this.updateMetrics();
  }

  prevDay(): void {
    this.currentDate = new Date(this.currentDate.getTime() - 24 * 60 * 60 * 1000);
    this.updateFormattedDate();
    this.generateCharts();
    this.updateMetrics();
  }

  private generateMockWorkflows(count: number, laneCount: number): WorkflowTask[] {
    const workflowTypes = [
      { name: 'Complete Blood Count', acronym: 'CBC' },
      { name: 'HPV Analysis', acronym: 'HPV' },
      { name: 'Chemistry Panel', acronym: 'CHEM' },
      { name: 'Urinalysis', acronym: 'UA' },
      { name: 'Lipid Panel', acronym: 'LIP' },
      { name: 'Thyroid Function', acronym: 'TSH' },
      { name: 'Liver Function', acronym: 'LFT' },
      { name: 'Renal Panel', acronym: 'REN' },
      { name: 'Glucose Test', acronym: 'GLU' },
      { name: 'Hemoglobin A1C', acronym: 'A1C' },
      { name: 'Electrolyte Panel', acronym: 'ELEC' },
      { name: 'Coagulation Studies', acronym: 'COAG' },
    ];

    const workflows: WorkflowTask[] = [];
    const baseDate = new Date(this.currentDate);
    baseDate.setHours(7, 0, 0, 0); // Start at 07:00

    // Operating window: 07:00 to 20:00 (13 hours = 780 minutes)
    const operatingWindowMinutes = 13 * 60;

    // Track end times for each lane to prevent overlaps
    const laneEndTimes: number[] = Array(laneCount).fill(baseDate.getTime());

    // Generate random start times spread across the operating window
    const startTimes: { time: number; lane: number }[] = [];
    for (let i = 0; i < count; i++) {
      const randomStartMinutes = Math.random() * operatingWindowMinutes;
      startTimes.push({
        time: baseDate.getTime() + randomStartMinutes * 60000,
        lane: -1 // Will be assigned
      });
    }

    // Sort by start time
    startTimes.sort((a, b) => a.time - b.time);

    // Assign lanes ensuring no overlaps
    for (const item of startTimes) {
      const workflow = workflowTypes[Math.floor(Math.random() * workflowTypes.length)];

      // Find a lane where this workflow can fit (lane end time <= desired start)
      let lane = -1;
      for (let l = 0; l < laneCount; l++) {
        if (laneEndTimes[l] <= item.time) {
          lane = l;
          break;
        }
      }

      // If no lane available, find the one with earliest end and adjust start
      if (lane === -1) {
        lane = 0;
        let earliestEnd = laneEndTimes[0];
        for (let l = 1; l < laneCount; l++) {
          if (laneEndTimes[l] < earliestEnd) {
            earliestEnd = laneEndTimes[l];
            lane = l;
          }
        }
        item.time = laneEndTimes[lane] + 5 * 60000; // 5 min gap
      }

      const start = new Date(item.time);

      // Duration varies: most are under 4 hours, some go longer
      let durationMinutes: number;
      const rand = Math.random();
      if (rand > 0.95) {
        // ~5% are extended (12-16 hours)
        durationMinutes = 720 + Math.random() * 240;
      } else if (rand > 0.85) {
        // ~10% are warnings (4-12 hours)
        durationMinutes = 240 + Math.random() * 480;
      } else {
        // ~85% are normal (30 min to 4 hours)
        durationMinutes = 30 + Math.random() * 210;
      }
      const end = new Date(start.getTime() + durationMinutes * 60000);

      // Update lane end time
      laneEndTimes[lane] = end.getTime();

      // Status based on duration
      const durationHours = durationMinutes / 60;
      const status: 'normal' | 'warning' | 'alert' =
        durationHours >= 12 ? 'alert' :    // Extended (12hr+) - we'll use light orange
        durationHours >= 4 ? 'warning' :   // Warning (4-12hr)
        'normal';                          // Normal (<4hr)

      workflows.push({
        name: workflow.name,
        acronym: workflow.acronym,
        start,
        end,
        status,
        lane
      });
    }

    return workflows.sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  private createGanttChart(title: string, workflows: WorkflowTask[], laneCount: number, customLabels?: string[]): EChartsOption {
    const baseDate = new Date(this.currentDate);
    baseDate.setHours(7, 0, 0, 0);

    // Y-axis labels: workflow lanes + gap + Alerts & Errors at top
    const laneLabels = customLabels || Array.from({ length: laneCount }, (_, i) => `Lane ${i + 1}`);
    const yAxisLabels = [...laneLabels, '', 'Alerts & Errors'];
    const ALERTS_Y_INDEX = yAxisLabels.length - 1;

    // Prepare series data for Gantt chart
    const seriesData: any[] = [];
    const alertMarkers: any[] = [];

    workflows.forEach((workflow) => {
      const startTime = workflow.start.getTime();
      const endTime = workflow.end.getTime();
      const baseTime = baseDate.getTime();

      // Calculate position in 24-hour timeline (in hours from 07:00)
      const startHours = (startTime - baseTime) / (1000 * 60 * 60);
      const endHours = (endTime - baseTime) / (1000 * 60 * 60);

      const color = workflow.status === 'alert' ? BD_AURORA_LIGHT :  // Extended (12hr+)
                    workflow.status === 'warning' ? BD_AURORA :      // Warning (4-12hr)
                    BD_COMET;                                        // Normal (<4hr)

      seriesData.push({
        name: workflow.acronym,
        value: [workflow.lane, startHours, endHours, endHours - startHours],
        itemStyle: { color },
        label: {
          show: true,
          position: 'insideLeft',
          formatter: workflow.acronym,
          color: '#FFFFFF',
          fontSize: 11,
          fontWeight: 'bold'
        },
        workflowData: workflow // Store for tooltip
      });

      // Add alert markers to the Alerts & Errors lane at top for long-running workflows
      if (workflow.status === 'alert' || workflow.status === 'warning') {
        const alertTime = startHours + Math.random() * (endHours - startHours);
        const severity = workflow.status === 'alert' ? 'extended' : 'warning';
        alertMarkers.push({
          value: [alertTime, ALERTS_Y_INDEX],
          itemStyle: {
            color: severity === 'extended' ? BD_AURORA_LIGHT : BD_AURORA
          },
          alert: {
            time: alertTime,
            severity: severity,
            workflow: workflow.name,
            acronym: workflow.acronym
          }
        });
      }
    });

    // Add some random info alerts
    for (let i = 0; i < 3; i++) {
      const alertTime = Math.random() * 24;
      alertMarkers.push({
        value: [alertTime, ALERTS_Y_INDEX],
        itemStyle: { color: '#333333' },
        alert: {
          time: alertTime,
          severity: 'info',
          workflow: 'System',
          acronym: 'SYS'
        }
      });
    }

    return {
      title: {
        text: title,
        left: '2%',
        top: 10,
        textStyle: {
          fontSize: 18,
          fontWeight: 500,
          color: '#060A3D'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          // Handle workflow bars
          if (params.componentType === 'series' && params.data.workflowData) {
            const wf = params.data.workflowData;
            const duration = Math.round((wf.end.getTime() - wf.start.getTime()) / (1000 * 60));
            return `
              <strong>${wf.name}</strong><br/>
              <strong>ID:</strong> ${wf.acronym}<br/>
              <strong>Start:</strong> ${wf.start.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})}<br/>
              <strong>End:</strong> ${wf.end.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})}<br/>
              <strong>Duration:</strong> ${duration} min<br/>
              <strong>Status:</strong> ${wf.status.toUpperCase()}
            `;
          }
          // Handle alert markers
          if (params.seriesName === 'Alerts' && params.data.alert) {
            const alert = params.data.alert;
            const hours = Math.floor(alert.time);
            const minutes = Math.round((alert.time - hours) * 60);
            const displayHour = (7 + hours) % 24;
            const timeStr = `${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            const severityColor = alert.severity === 'extended' ? BD_AURORA_LIGHT :
                                  alert.severity === 'warning' ? BD_AURORA : '#333';
            return `
              <div style="min-width: 180px;">
                <strong>Alert</strong><br/>
                <strong>Time:</strong> ${timeStr}<br/>
                <strong>Severity:</strong> <span style="color: ${severityColor}; font-weight: bold;">${alert.severity.toUpperCase()}</span><br/>
                <strong>Workflow:</strong> ${alert.workflow} (${alert.acronym})
              </div>
            `;
          }
          return '';
        },
        backgroundColor: 'rgba(6, 10, 61, 0.95)',
        borderColor: BD_BLUE,
        borderWidth: 1,
        textStyle: { color: '#FFFFFF' }
      },
      grid: {
        left: '8%',
        right: '3%',
        top: '12%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 24,
        interval: 1,
        axisLabel: {
          formatter: (value: number) => {
            const hour = (7 + value) % 24;
            return `${hour.toString().padStart(2, '0')}:00`;
          },
          rotate: 45,
          fontSize: 10
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(191, 184, 184, 0.2)',
            type: 'dashed'
          }
        },
        axisLine: {
          lineStyle: { color: BD_GRAY }
        }
      },
      yAxis: {
        type: 'category',
        data: yAxisLabels,
        axisLabel: {
          fontSize: 10,
          color: '#060A3D'
        },
        axisLine: {
          lineStyle: { color: BD_GRAY }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(191, 184, 184, 0.1)'
          }
        }
      },
      series: [
        // Background highlight for alerts section
        {
          name: 'AlertsBackground',
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const yPos = api.coord([0, ALERTS_Y_INDEX]);
            const xStart = api.coord([0, 0]);
            const xEnd = api.coord([24, 0]);
            const height = api.size([0, 1])[1];

            return {
              type: 'rect',
              shape: {
                x: xStart[0],
                y: yPos[1] - height / 2,
                width: xEnd[0] - xStart[0],
                height: height
              },
              style: {
                fill: 'rgba(255, 107, 97, 0.08)'
              },
              z: 0
            };
          },
          data: [0],
          silent: true
        },
        // Divider line between alerts and workflow lanes
        {
          name: 'Divider',
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const y = api.coord([0, laneCount + 0.5]);
            const xStart = api.coord([0, 0]);
            const xEnd = api.coord([24, 0]);

            return {
              type: 'line',
              shape: {
                x1: xStart[0],
                y1: y[1],
                x2: xEnd[0],
                y2: y[1]
              },
              style: {
                stroke: BD_GRAY,
                lineWidth: 1,
                lineDash: [4, 4]
              },
              z: 0
            };
          },
          data: [0],
          silent: true
        },
        // Workflow bars
        {
          name: 'Workflows',
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const categoryIndex = api.value(0);
            const start = api.coord([api.value(1), categoryIndex]);
            const end = api.coord([api.value(2), categoryIndex]);
            const height = api.size([0, 1])[1] * 0.6;

            return {
              type: 'rect',
              shape: {
                x: start[0],
                y: start[1] - height / 2,
                width: end[0] - start[0],
                height: height
              },
              style: api.style()
            };
          },
          encode: {
            x: [1, 2],
            y: 0
          },
          data: seriesData,
          z: 2
        },
        // Alert markers in the Alerts & Errors lane
        {
          name: 'Alerts',
          type: 'scatter',
          symbolSize: 10,
          symbol: 'diamond',
          data: alertMarkers,
          z: 3
        }
      ]
    };
  }

  private generateCharts(): void {
    // Left GX: 10 workflows across 10 lanes
    const leftGxWorkflows = this.generateMockWorkflows(20, 9);
    this.leftGxChartOptions = this.createGanttChart('Left GX', leftGxWorkflows, 9);

    // Right MX: workflows across 9 lanes
    const rightMxWorkflows = this.generateMockWorkflows(20, 9);
    this.rightMxChartOptions = this.createGanttChart('Right MX', rightMxWorkflows, 9);

    // PX: State transition timeline chart
    this.pxChartOptions = this.createStateTransitionChart();
  }

  private generateMockDeviceWorkflows(): DeviceWorkflow[] {
    const baseDate = new Date(this.currentDate);
    baseDate.setHours(18, 0, 0, 0); // Start at 18:00 to match wireframe

    const workflows: DeviceWorkflow[] = [
      // === Boot sequence at 18:00 ===
      {
        startTime: new Date(baseDate.getTime()),
        states: [
          { timestamp: new Date(baseDate.getTime()), state: 'Powered Off' },
          { timestamp: new Date(baseDate.getTime() + 30000), state: 'Powered on Starting' },  // +30s
          { timestamp: new Date(baseDate.getTime() + 45000), state: 'Offline Idle' },         // +45s
          { timestamp: new Date(baseDate.getTime() + 60000), state: 'Offline Starting' },     // +1m
          { timestamp: new Date(baseDate.getTime() + 90000), state: 'Online Pause Idle' },    // +1.5m
          { timestamp: new Date(baseDate.getTime() + 120000), state: 'Online' },              // +2m
        ]
      },
      // === Brief pause sequence at 22:15 ===
      {
        startTime: new Date(baseDate.getTime() + 255 * 60000),  // 22:15
        states: [
          { timestamp: new Date(baseDate.getTime() + 255 * 60000), state: 'Online Pause Idle' },
          { timestamp: new Date(baseDate.getTime() + 255 * 60000 + 20000), state: 'Pause Idle' },
          { timestamp: new Date(baseDate.getTime() + 255 * 60000 + 45000), state: 'Online Pause Idle' },
          { timestamp: new Date(baseDate.getTime() + 255 * 60000 + 60000), state: 'Online' },
        ]
      },
      // === Shutdown sequence at 01:30 ===
      {
        startTime: new Date(baseDate.getTime() + 450 * 60000),  // 01:30
        states: [
          { timestamp: new Date(baseDate.getTime() + 450 * 60000), state: 'Offline Starting' },
          { timestamp: new Date(baseDate.getTime() + 450 * 60000 + 15000), state: 'Offline Completing' },
          { timestamp: new Date(baseDate.getTime() + 450 * 60000 + 30000), state: 'Offline Idle' },
          { timestamp: new Date(baseDate.getTime() + 450 * 60000 + 45000), state: 'Shutdown' },
          { timestamp: new Date(baseDate.getTime() + 450 * 60000 + 60000), state: 'Powered Off' },
        ]
      },
    ];

    return workflows;
  }

  // Store alerts for cross-chart reference
  private gxAlerts: { timestamp: Date; severity: 'warning' | 'error' | 'info'; source: string; message: string }[] = [];
  private mxAlerts: { timestamp: Date; severity: 'warning' | 'error' | 'info'; source: string; message: string }[] = [];

  private generateMockPxAlerts(): { timestamp: Date; severity: 'warning' | 'error' | 'info'; source: string; message: string }[] {
    const alerts: { timestamp: Date; severity: 'warning' | 'error' | 'info'; source: string; message: string }[] = [];
    const baseDate = new Date(this.currentDate);
    baseDate.setHours(18, 0, 0, 0);

    // PX-specific alerts (aligned with boot/shutdown sequences)
    const pxAlerts = [
      { minutesFromStart: 1, severity: 'info' as const, source: 'PX', message: 'System powered on' },
      { minutesFromStart: 5, severity: 'info' as const, source: 'PX', message: 'Boot sequence complete' },
      { minutesFromStart: 450, severity: 'info' as const, source: 'PX', message: 'Initiating shutdown' },
    ];

    // GX-referenced alerts (spread across 24hr period)
    this.gxAlerts = [
      { minutesFromStart: 120, severity: 'warning' as const, source: 'Left GX', message: 'HPV workflow delayed' },   // 20:00
      { minutesFromStart: 360, severity: 'error' as const, source: 'Left GX', message: 'CBC analysis failed' },      // 00:00
    ].map(a => ({
      timestamp: new Date(baseDate.getTime() + a.minutesFromStart * 60000),
      severity: a.severity,
      source: a.source,
      message: a.message
    }));

    // MX-referenced alerts
    this.mxAlerts = [
      { minutesFromStart: 180, severity: 'error' as const, source: 'Right MX', message: 'FluA processing error' },   // 21:00
      { minutesFromStart: 540, severity: 'warning' as const, source: 'Right MX', message: 'VP workflow warning' },   // 03:00
    ].map(a => ({
      timestamp: new Date(baseDate.getTime() + a.minutesFromStart * 60000),
      severity: a.severity,
      source: a.source,
      message: a.message
    }));

    // Combine all alerts
    pxAlerts.forEach(({ minutesFromStart, severity, source, message }) => {
      alerts.push({
        timestamp: new Date(baseDate.getTime() + minutesFromStart * 60000),
        severity,
        source,
        message
      });
    });

    alerts.push(...this.gxAlerts);
    alerts.push(...this.mxAlerts);

    // Sort by timestamp
    return alerts.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private formatTime(hoursFromStart: number): string {
    const totalMinutes = hoursFromStart * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    const displayHour = (18 + hours) % 24;
    return `${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private createStateTransitionChart(): EChartsOption {
    const workflows = this.generateMockDeviceWorkflows();
    const alerts = this.generateMockPxAlerts();

    const baseDate = new Date(this.currentDate);
    baseDate.setHours(18, 0, 0, 0); // Timeline starts at 18:00

    // Simple Y-axis layout: Device State at 0, Alerts at 2
    const DEVICE_STATE_Y = 0;
    const ALERTS_Y = 2;

    // Create scatter data for workflow dots (one dot per workflow at start time)
    const workflowDotsData = workflows.map((workflow, index) => {
      const hoursFromStart = (workflow.startTime.getTime() - baseDate.getTime()) / (1000 * 60 * 60);
      return {
        value: [hoursFromStart, DEVICE_STATE_Y],
        workflowIndex: index,
        workflow: workflow
      };
    });

    // Convert alerts to scatter data - positioned at top
    const alertData = alerts.map(alert => {
      const hoursFromStart = (alert.timestamp.getTime() - baseDate.getTime()) / (1000 * 60 * 60);
      const color = alert.severity === 'error' ? BD_INFRARED :
                    alert.severity === 'warning' ? BD_AURORA : '#333333'; // Black for info
      return {
        value: [hoursFromStart, ALERTS_Y],
        itemStyle: { color },
        alert: alert
      };
    });

    const formatTimeFn = this.formatTime.bind(this);

    return {
      title: {
        text: 'PX',
        left: '2%',
        top: 10,
        textStyle: {
          fontSize: 18,
          fontWeight: 500,
          color: '#060A3D'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          // Handle alert dots
          if (params.seriesName === 'Alerts' && params.data.alert) {
            const alert = params.data.alert;
            const timeStr = formatTimeFn(params.value[0]);
            const severityColor = alert.severity === 'extended' ? BD_AURORA_LIGHT :
                                  alert.severity === 'warning' ? BD_AURORA : '#333';
            return `
              <div style="min-width: 200px;">
                <strong>Alert</strong><br/>
                <strong>Time:</strong> ${timeStr}<br/>
                <strong>Source:</strong> ${alert.source}<br/>
                <strong>Severity:</strong> <span style="color: ${severityColor}; font-weight: bold;">${alert.severity.toUpperCase()}</span><br/>
                <strong>Message:</strong> ${alert.message}
              </div>
            `;
          }

          // Handle workflow dots
          if (params.seriesName === 'Device State' && params.data.workflow) {
            const workflow = params.data.workflow as DeviceWorkflow;
            let html = '<div style="min-width: 250px;"><strong>Device State Workflow</strong><br/><br/>';
            html += '<table style="width: 100%; border-collapse: collapse;">';
            html += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.2);"><th style="text-align: left; padding: 2px 8px 2px 0;">Time</th><th style="text-align: left; padding: 2px 0;">State</th></tr>';

            workflow.states.forEach((state) => {
              const timeStr = state.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
              html += `<tr><td style="padding: 2px 8px 2px 0; color: #aaa;">${timeStr}</td><td style="padding: 2px 0;">${state.state}</td></tr>`;
            });

            html += '</table></div>';
            return html;
          }

          return '';
        },
        backgroundColor: 'rgba(6, 10, 61, 0.95)',
        borderColor: BD_BLUE,
        borderWidth: 1,
        textStyle: { color: '#FFFFFF' },
        extraCssText: 'max-height: 400px; overflow-y: auto;'
      },
      grid: {
        left: '12%',
        right: '3%',
        top: '20%',
        bottom: '25%',
        containLabel: false
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 24, // 24 hours from 18:00 to 18:00 next day
        interval: 1,
        axisLabel: {
          formatter: (value: number) => {
            const hour = (18 + value) % 24;
            return `${hour.toString().padStart(2, '0')}:00`;
          },
          fontSize: 9,
          rotate: 45
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(191, 184, 184, 0.3)',
            type: 'dashed'
          }
        },
        axisLine: {
          lineStyle: { color: BD_GRAY }
        }
      },
      yAxis: {
        type: 'category',
        data: ['Device State', '', 'Alerts & Errors'],
        axisLabel: {
          fontSize: 11,
          color: '#060A3D',
          fontWeight: 500
        },
        splitLine: {
          show: false
        },
        axisLine: {
          lineStyle: { color: BD_GRAY }
        }
      },
      series: [
        // Background highlight for alerts section
        {
          name: 'AlertsBackground',
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const yStart = api.coord([0, 2]);
            const yEnd = api.coord([0, 2]);
            const xStart = api.coord([0, 0]);
            const xEnd = api.coord([24, 0]);
            const height = 30;

            return {
              type: 'rect',
              shape: {
                x: xStart[0],
                y: yStart[1] - height / 2,
                width: xEnd[0] - xStart[0],
                height: height
              },
              style: {
                fill: 'rgba(255, 107, 97, 0.08)' // Light red background
              },
              z: 0
            };
          },
          data: [0],
          silent: true
        },
        // Divider line between alerts and device state
        {
          name: 'Divider',
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const y = api.coord([0, 1]);
            const xStart = api.coord([0, 0]);
            const xEnd = api.coord([24, 0]);

            return {
              type: 'line',
              shape: {
                x1: xStart[0],
                y1: y[1],
                x2: xEnd[0],
                y2: y[1]
              },
              style: {
                stroke: BD_GRAY,
                lineWidth: 1,
                lineDash: [4, 4]
              },
              z: 0
            };
          },
          data: [0],
          silent: true
        },
        {
          name: 'Device State',
          type: 'scatter',
          data: workflowDotsData,
          symbolSize: 14,
          itemStyle: {
            color: BD_COMET,
            borderColor: '#fff',
            borderWidth: 2
          },
          emphasis: {
            scale: 1.5,
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(41, 149, 197, 0.5)'
            }
          },
          z: 2
        },
        {
          name: 'Alerts',
          type: 'scatter',
          data: alertData,
          symbolSize: 12,
          symbol: 'diamond',
          z: 3
        }
      ]
    };
  }

  private updateMetrics(): void {
    // Mock metrics based on workflows
    this.activeWorkflows = Math.floor(Math.random() * 8) + 2;
    this.completedToday = Math.floor(Math.random() * 40) + 20;
    this.avgWorkflowTime = Math.floor(Math.random() * 60) + 90; // 90-150 minutes
    this.alertsGenerated = Math.floor(Math.random() * 5) + 1;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
