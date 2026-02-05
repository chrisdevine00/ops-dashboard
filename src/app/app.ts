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
const BD_NEBULA_DARK = '#00A88F'; // Dark green - device state
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

// Instrument maintenance/adjustment periods
interface InstrumentWorkflow {
  name: string;
  startHour: number;  // Hours from 07:00
  endHour: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  // Facility info
  facilityName = 'Main Laboratory';
  serialNumber = 'SN20240847';

  // Machine serial numbers
  leftGxSerial = 'SN20241201';
  rightMxSerial = 'SN20241202';
  // PX uses the main serialNumber

  // PX System Events (hours from 07:00 start)
  // These events affect all machines and trigger cross-chart indicators
  private pxSystemEvents: { hour: number; type: 'boot' | 'powerCycle'; label: string }[] = [];

  // Time displays
  siteTimeShort = '';
  localTimeShort = '';
  private readonly siteTimezone = 'Europe/London';  // UTC+0/+1
  private clockTimer: any;


  // Date navigation
  currentDate: Date = new Date();
  today: Date = new Date();
  formattedDate = '';

  get isToday(): boolean {
    return this.currentDate.toDateString() === this.today.toDateString();
  }

  // Auto-refresh
  private readonly REFRESH_INTERVAL = 10 * 60; // 10 minutes in seconds
  private refreshCountdown = this.REFRESH_INTERVAL;
  refreshTextShort = '';
  private refreshTimer: any;

  // Chart options
  leftGxChartOptions: EChartsOption = {};
  rightMxChartOptions: EChartsOption = {};
  pxChartOptions: EChartsOption = {};

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.updateFormattedDate();
    this.updateClocks();
    this.startClockTimer();
    this.generateCharts();
    this.startRefreshTimer();
  }

  private startClockTimer(): void {
    this.clockTimer = setInterval(() => {
      this.updateClocks();
    }, 1000);
  }

  private updateClocks(): void {
    const now = new Date();

    // Site time - short format with timezone offset
    const siteTime = now.toLocaleString('en-GB', {
      timeZone: this.siteTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    this.siteTimeShort = `${siteTime} +1`;

    // Local time - short format with timezone offset
    const localTime = now.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const offsetHours = -Math.round(now.getTimezoneOffset() / 60);
    const offsetStr = offsetHours >= 0 ? `+${offsetHours}` : `${offsetHours}`;
    this.localTimeShort = `${localTime} ${offsetStr}`;
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
  }

  prevDay(): void {
    this.currentDate = new Date(this.currentDate.getTime() - 24 * 60 * 60 * 1000);
    this.updateFormattedDate();
    this.generateCharts();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.updateFormattedDate();
    this.generateCharts();
  }

  onDateChange(event: any): void {
    if (event.value) {
      this.currentDate = event.value;
      this.updateFormattedDate();
      this.generateCharts();
      }
  }

  private generateMockWorkflows(count: number, laneCount: number, allowedTypes?: string[]): WorkflowTask[] {
    const allWorkflowTypes = [
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

    // Filter workflow types if allowedTypes is specified
    const workflowTypes = allowedTypes
      ? allWorkflowTypes.filter(wt => allowedTypes.includes(wt.acronym))
      : allWorkflowTypes;

    const workflows: WorkflowTask[] = [];
    const baseDate = new Date(this.currentDate);
    baseDate.setHours(7, 0, 0, 0); // Start at 07:00

    // Tests can't start until after PX Power Cycle (07:00), Boot (07:15), and Online (07:30)
    // First test can start at 07:45
    const testStartOffset = 45 * 60000; // 45 minutes in ms
    const testStartTime = baseDate.getTime() + testStartOffset;

    // Operating window: 07:45 to 20:00 (12.25 hours = 735 minutes)
    const operatingWindowMinutes = 12.25 * 60;

    // Track end times for each lane to prevent overlaps
    const laneEndTimes: number[] = Array(laneCount).fill(testStartTime);

    // Generate random start times spread across the operating window (starting at 07:15)
    const startTimes: { time: number; lane: number }[] = [];
    for (let i = 0; i < count; i++) {
      const randomStartMinutes = Math.random() * operatingWindowMinutes;
      startTimes.push({
        time: testStartTime + randomStartMinutes * 60000,
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

  // Generate instrument maintenance periods
  private getInstrumentWorkflows(): InstrumentWorkflow[] {
    return [
      { name: 'Refilling Pipettes', startHour: 2, endHour: 2.5 },
      { name: 'Adding Media', startHour: 6, endHour: 6.75 },
      { name: 'Calibration Check', startHour: 12, endHour: 12.5 },
    ];
  }

  private createGanttChart(title: string, workflows: WorkflowTask[], laneCount: number, customLabels?: string[], showXAxis: boolean = true): EChartsOption {
    const baseDate = new Date(this.currentDate);
    baseDate.setHours(7, 0, 0, 0);

    // Y-axis labels: workflow lanes + gap + Alerts & Errors at top
    const laneLabels = customLabels || Array.from({ length: laneCount }, (_, i) => `Lane ${i + 1}`);
    const yAxisLabels = [...laneLabels, 'Alerts & Errors'];
    const ALERTS_Y_INDEX = yAxisLabels.length - 1;

    // Get instrument maintenance periods
    const instrumentWorkflows = this.getInstrumentWorkflows();

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
          fontSize: 9,
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
            acronym: workflow.acronym,
            code: this.generateAlertCode()
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
          acronym: 'SYS',
          code: this.generateAlertCode()
        }
      });
    }

    return {
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        confine: false,
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
                                  alert.severity === 'warning' ? BD_AURORA : '#AAAAAA';
            return `
              <div style="min-width: 180px;">
                <strong>Alert</strong><br/>
                <strong>Code:</strong> ${alert.code}<br/>
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
        left: 80,
        right: '2%',
        top: 8,
        bottom: showXAxis ? 40 : 8,
        containLabel: false
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 24,
        interval: 1,
        axisLabel: {
          show: showXAxis,
          formatter: (value: number) => {
            const hour = (7 + value) % 24;
            return `${hour.toString().padStart(2, '0')}:00`;
          },
          rotate: 45,
          fontSize: 10
        },
        axisTick: {
          show: showXAxis
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
        // Instrument maintenance columns (vertical bands)
        {
          name: 'InstrumentWorkflows',
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const dataIndex = params.dataIndex;
            const item = instrumentWorkflows[dataIndex];
            if (!item) return;

            const xStart = api.coord([item.startHour, 0]);
            const xEnd = api.coord([item.endHour, 0]);
            const yTop = api.coord([0, ALERTS_Y_INDEX]);
            const yBottom = api.coord([0, 0]);
            const chartHeight = yBottom[1] - yTop[1] + api.size([0, 1])[1];

            return {
              type: 'group',
              children: [
                // Light gray fill
                {
                  type: 'rect',
                  shape: {
                    x: xStart[0],
                    y: yTop[1] - api.size([0, 1])[1] / 2,
                    width: xEnd[0] - xStart[0],
                    height: chartHeight
                  },
                  style: {
                    fill: 'rgba(191, 184, 184, 0.15)'
                  },
                  z: 0
                },
                // Left border (darker gray dotted)
                {
                  type: 'line',
                  shape: {
                    x1: xStart[0],
                    y1: yTop[1] - api.size([0, 1])[1] / 2,
                    x2: xStart[0],
                    y2: yTop[1] - api.size([0, 1])[1] / 2 + chartHeight
                  },
                  style: {
                    stroke: 'rgba(128, 128, 128, 0.6)',
                    lineWidth: 1,
                    lineDash: [3, 3]
                  },
                  z: 0
                },
                // Right border (darker gray dotted)
                {
                  type: 'line',
                  shape: {
                    x1: xEnd[0],
                    y1: yTop[1] - api.size([0, 1])[1] / 2,
                    x2: xEnd[0],
                    y2: yTop[1] - api.size([0, 1])[1] / 2 + chartHeight
                  },
                  style: {
                    stroke: 'rgba(128, 128, 128, 0.6)',
                    lineWidth: 1,
                    lineDash: [3, 3]
                  },
                  z: 0
                }
              ]
            };
          },
          data: instrumentWorkflows.map((_, i) => i),
          silent: false,
          tooltip: {
            formatter: (params: any) => {
              const item = instrumentWorkflows[params.dataIndex];
              if (!item) return '';
              const startHour = (7 + item.startHour) % 24;
              const endHour = (7 + item.endHour) % 24;
              const startMin = Math.round((item.startHour % 1) * 60);
              const endMin = Math.round((item.endHour % 1) * 60);
              return `
                <strong>${item.name}</strong><br/>
                ${Math.floor(startHour).toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')} -
                ${Math.floor(endHour).toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}
              `;
            }
          }
        },
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
              z: 1
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
            const y = api.coord([0, laneCount - 0.5]);
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
        },
        // Midnight indicator line
        {
          name: 'Midnight',
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const midnightX = api.coord([17, 0]); // 17 hours from 07:00 = midnight
            const yTop = api.coord([0, ALERTS_Y_INDEX]);
            const yBottom = api.coord([0, 0]);
            const chartHeight = yBottom[1] - yTop[1] + api.size([0, 1])[1];

            return {
              type: 'group',
              children: [
                // Invisible hover area
                {
                  type: 'rect',
                  shape: {
                    x: midnightX[0] - 5,
                    y: yTop[1] - api.size([0, 1])[1] / 2,
                    width: 10,
                    height: chartHeight
                  },
                  style: {
                    fill: 'transparent'
                  },
                  z: 1
                },
                // Vertical solid line
                {
                  type: 'line',
                  shape: {
                    x1: midnightX[0],
                    y1: yTop[1] - api.size([0, 1])[1] / 2,
                    x2: midnightX[0],
                    y2: yTop[1] - api.size([0, 1])[1] / 2 + chartHeight
                  },
                  style: {
                    stroke: '#aaa',
                    lineWidth: 1
                  },
                  z: 1
                }
              ]
            };
          },
          data: [{ value: 0, nextDate: this.getNextDayFormatted() }],
          tooltip: {
            formatter: () => {
              return `<strong>Date Change</strong><br/>${this.getNextDayFormatted()}`;
            }
          },
          z: 1
        },
        // PX System Event indicator lines
        {
          name: 'PX Events',
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const event = this.pxSystemEvents[params.dataIndex];
            if (!event) return;

            const eventX = api.coord([event.hour, 0]);
            const yTop = api.coord([0, ALERTS_Y_INDEX]);
            const yBottom = api.coord([0, 0]);
            const chartHeight = yBottom[1] - yTop[1] + api.size([0, 1])[1];
            const color = event.type === 'boot' ? BD_NEBULA : BD_AURORA;

            return {
              type: 'group',
              children: [
                // Invisible hover area
                {
                  type: 'rect',
                  shape: {
                    x: eventX[0] - 5,
                    y: yTop[1] - api.size([0, 1])[1] / 2,
                    width: 10,
                    height: chartHeight
                  },
                  style: {
                    fill: 'transparent'
                  },
                  z: 1
                },
                // Vertical line
                {
                  type: 'line',
                  shape: {
                    x1: eventX[0],
                    y1: yTop[1] - api.size([0, 1])[1] / 2,
                    x2: eventX[0],
                    y2: yTop[1] - api.size([0, 1])[1] / 2 + chartHeight
                  },
                  style: {
                    stroke: color,
                    lineWidth: 2,
                    lineDash: [4, 4]
                  },
                  z: 1
                }
              ]
            };
          },
          data: this.pxSystemEvents.map((e, i) => ({ value: i, event: e })),
          tooltip: {
            formatter: (params: any) => {
              const event = this.pxSystemEvents[params.dataIndex];
              if (!event) return '';
              const hour = (7 + event.hour) % 24;
              const minutes = Math.round((event.hour % 1) * 60);
              const timeStr = `${Math.floor(hour).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
              return `<strong>PX ${event.label}</strong><br/>Time: ${timeStr}`;
            }
          },
          z: 1
        }
      ]
    };
  }

  private getNextDayFormatted(): string {
    const nextDay = new Date(this.currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  private generateCharts(): void {
    // Generate PX system events that affect all machines
    // Sequence: Power Cycle -> Boot -> Online (then tests can start)
    this.pxSystemEvents = [
      { hour: 0, type: 'powerCycle', label: 'Power Cycle' },     // 07:00 - power cycle first
      { hour: 0.25, type: 'boot', label: 'System Boot' },        // 07:15 - boot sequence
    ];

    // Left GX: HPV tests only across 9 lanes (no x-axis, shared at bottom)
    const leftGxWorkflows = this.generateMockWorkflows(20, 9, ['HPV']);
    this.leftGxChartOptions = this.createGanttChart('Left GX', leftGxWorkflows, 9, undefined, false);

    // Right MX: workflows across 9 lanes (no x-axis, shared at bottom)
    const rightMxWorkflows = this.generateMockWorkflows(20, 9);
    this.rightMxChartOptions = this.createGanttChart('Right MX', rightMxWorkflows, 9, undefined, false);

    // PX: State transition timeline chart
    this.pxChartOptions = this.createStateTransitionChart();
  }

  private generateMockDeviceWorkflows(): DeviceWorkflow[] {
    const baseDate = new Date(this.currentDate);
    baseDate.setHours(7, 0, 0, 0); // Start at 07:00 to match other charts

    const workflows: DeviceWorkflow[] = [
      // === Online workflow at 07:30 (after Power Cycle at 07:00 and Boot at 07:15) ===
      {
        startTime: new Date(baseDate.getTime() + 30 * 60000), // 07:30
        states: [
          { timestamp: new Date(baseDate.getTime() + 30 * 60000), state: 'Powered Off' },
          { timestamp: new Date(baseDate.getTime() + 30 * 60000 + 30000), state: 'Powered on Starting' },  // +30s
          { timestamp: new Date(baseDate.getTime() + 30 * 60000 + 45000), state: 'Offline Idle' },         // +45s
          { timestamp: new Date(baseDate.getTime() + 30 * 60000 + 60000), state: 'Offline Starting' },     // +1m
          { timestamp: new Date(baseDate.getTime() + 30 * 60000 + 90000), state: 'Online Pause Idle' },    // +1.5m
          { timestamp: new Date(baseDate.getTime() + 30 * 60000 + 120000), state: 'Online' },              // +2m
        ]
      },
    ];

    return workflows;
  }

  // Store alerts for cross-chart reference
  private gxAlerts: { timestamp: Date; severity: 'warning' | 'error' | 'info'; source: string; message: string; code: string }[] = [];
  private mxAlerts: { timestamp: Date; severity: 'warning' | 'error' | 'info'; source: string; message: string; code: string }[] = [];

  private generateAlertCode(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  private generateMockPxAlerts(): { timestamp: Date; severity: 'warning' | 'error' | 'info'; source: string; message: string; code: string }[] {
    const alerts: { timestamp: Date; severity: 'warning' | 'error' | 'info'; source: string; message: string; code: string }[] = [];
    const baseDate = new Date(this.currentDate);
    baseDate.setHours(7, 0, 0, 0);

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
      message: a.message,
      code: this.generateAlertCode()
    }));

    // MX-referenced alerts
    this.mxAlerts = [
      { minutesFromStart: 180, severity: 'error' as const, source: 'Right MX', message: 'FluA processing error' },   // 21:00
      { minutesFromStart: 540, severity: 'warning' as const, source: 'Right MX', message: 'VP workflow warning' },   // 03:00
    ].map(a => ({
      timestamp: new Date(baseDate.getTime() + a.minutesFromStart * 60000),
      severity: a.severity,
      source: a.source,
      message: a.message,
      code: this.generateAlertCode()
    }));

    // Combine all alerts
    pxAlerts.forEach(({ minutesFromStart, severity, source, message }) => {
      alerts.push({
        timestamp: new Date(baseDate.getTime() + minutesFromStart * 60000),
        severity,
        source,
        message,
        code: this.generateAlertCode()
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
    const displayHour = (7 + hours) % 24;
    return `${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private createStateTransitionChart(): EChartsOption {
    const workflows = this.generateMockDeviceWorkflows();
    const alerts = this.generateMockPxAlerts();

    const baseDate = new Date(this.currentDate);
    baseDate.setHours(7, 0, 0, 0); // Timeline starts at 18:00

    // Simple Y-axis layout: Device State at 0, Alerts at 1
    const DEVICE_STATE_Y = 0;
    const ALERTS_Y = 1;

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

    // Generate heartbeat dots for off hours (20:00 to 07:00 = hours 13-24 on timeline)
    // Hourly dots are larger, 10-min interval dots are smaller
    const heartbeatData: any[] = [];
    // From 20:00 (hour 13) to 07:00 next day (hour 24), every 10 minutes (1/6 hour)
    for (let hour = 13; hour < 24; hour += (10 / 60)) {
      const isHourMark = Math.abs(hour - Math.round(hour)) < 0.01;
      heartbeatData.push({
        value: [hour, DEVICE_STATE_Y],
        symbolSize: isHourMark ? 6 : 3,
        isHourly: isHourMark
      });
    }

    const formatTimeFn = this.formatTime.bind(this);

    return {
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        confine: false,
        formatter: (params: any) => {
          // Handle alert dots
          if (params.seriesName === 'Alerts' && params.data.alert) {
            const alert = params.data.alert;
            const timeStr = formatTimeFn(params.value[0]);
            const severityColor = alert.severity === 'extended' ? BD_AURORA_LIGHT :
                                  alert.severity === 'warning' ? BD_AURORA : '#AAAAAA';
            return `
              <div style="min-width: 200px;">
                <strong>Alert</strong><br/>
                <strong>Code:</strong> ${alert.code}<br/>
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

          // Handle heartbeat dots
          if (params.seriesName === 'Heartbeat') {
            const timeStr = formatTimeFn(params.value[0]);
            return `
              <div style="min-width: 150px;">
                <strong>System Heartbeat</strong><br/>
                <strong>Time:</strong> ${timeStr}<br/>
                <span style="color: #aaa;">Off-hours monitoring</span>
              </div>
            `;
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
        left: 80,
        right: '2%',
        top: 8,
        bottom: 35,
        containLabel: false
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 24, // 24 hours from 18:00 to 18:00 next day
        interval: 1,
        axisLabel: {
          formatter: (value: number) => {
            const hour = (7 + value) % 24;
            return `${hour.toString().padStart(2, '0')}:00`;
          },
          fontSize: 10,
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
        data: ['Device State', 'Alerts & Errors'],
        axisLabel: {
          fontSize: 10,
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
        // Instrument maintenance columns (vertical bands)
        {
          name: 'InstrumentWorkflows',
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const dataIndex = params.dataIndex;
            const instrumentWorkflows = this.getInstrumentWorkflows();
            const item = instrumentWorkflows[dataIndex];
            if (!item) return;

            const xStart = api.coord([item.startHour, 0]);
            const xEnd = api.coord([item.endHour, 0]);
            const yTop = api.coord([0, 1]);
            const yBottom = api.coord([0, 0]);
            const laneHeight = api.size([0, 1])[1];
            const chartHeight = yBottom[1] - yTop[1] + laneHeight;

            return {
              type: 'group',
              children: [
                // Light gray fill
                {
                  type: 'rect',
                  shape: {
                    x: xStart[0],
                    y: yTop[1] - laneHeight / 2,
                    width: xEnd[0] - xStart[0],
                    height: chartHeight
                  },
                  style: {
                    fill: 'rgba(191, 184, 184, 0.15)'
                  },
                  z: 0
                },
                // Left border (darker gray dotted)
                {
                  type: 'line',
                  shape: {
                    x1: xStart[0],
                    y1: yTop[1] - laneHeight / 2,
                    x2: xStart[0],
                    y2: yTop[1] - laneHeight / 2 + chartHeight
                  },
                  style: {
                    stroke: 'rgba(128, 128, 128, 0.6)',
                    lineWidth: 1,
                    lineDash: [3, 3]
                  },
                  z: 0
                },
                // Right border (darker gray dotted)
                {
                  type: 'line',
                  shape: {
                    x1: xEnd[0],
                    y1: yTop[1] - laneHeight / 2,
                    x2: xEnd[0],
                    y2: yTop[1] - laneHeight / 2 + chartHeight
                  },
                  style: {
                    stroke: 'rgba(128, 128, 128, 0.6)',
                    lineWidth: 1,
                    lineDash: [3, 3]
                  },
                  z: 0
                }
              ]
            };
          },
          data: [0], // Only show first instrument workflow on PX chart
          silent: false
        },
        // Background highlight for alerts section
        {
          name: 'AlertsBackground',
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const yPos = api.coord([0, 1]);
            const xStart = api.coord([0, 0]);
            const xEnd = api.coord([24, 0]);
            const height = api.size([0, 1])[1]; // Dynamic lane height

            return {
              type: 'rect',
              shape: {
                x: xStart[0],
                y: yPos[1] - height / 2,
                width: xEnd[0] - xStart[0],
                height: height
              },
              style: {
                fill: 'rgba(255, 107, 97, 0.08)' // Light red background
              },
              z: 1
            };
          },
          data: [0],
          silent: true
        },
        {
          name: 'Device State',
          type: 'scatter',
          data: workflowDotsData,
          symbolSize: 12,
          itemStyle: {
            color: BD_NEBULA_DARK,
            borderColor: '#fff',
            borderWidth: 2
          },
          emphasis: {
            scale: 1.3,
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 168, 143, 0.5)'
            }
          },
          z: 2
        },
        // PX System Events (Boot, Power Cycle) markers on Device State lane
        {
          name: 'PX System Events',
          type: 'scatter',
          data: this.pxSystemEvents.map(event => ({
            value: [event.hour, DEVICE_STATE_Y],
            event: event
          })),
          symbol: (value: any, params: any) => {
            const event = params.data?.event;
            return event?.type === 'boot' ? 'triangle' : 'circle';
          },
          symbolSize: 14,
          itemStyle: {
            color: (params: any) => {
              const event = params.data?.event;
              return event?.type === 'boot' ? BD_NEBULA : BD_AURORA;
            },
            borderColor: '#fff',
            borderWidth: 2
          },
          emphasis: {
            scale: 1.5
          },
          tooltip: {
            formatter: (params: any) => {
              const event = params.data?.event;
              if (!event) return '';
              const hour = (7 + event.hour) % 24;
              const minutes = Math.round((event.hour % 1) * 60);
              const timeStr = `${Math.floor(hour).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
              const typeLabel = event.type === 'boot' ? 'Boot' : 'Power Cycle';
              return `<strong>PX ${typeLabel}</strong><br/>Time: ${timeStr}<br/>${event.label}`;
            }
          },
          z: 3
        },
        // PX System Event indicator lines (matching GX/MX charts)
        {
          name: 'PX Event Lines',
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const event = this.pxSystemEvents[params.dataIndex];
            if (!event) return;

            const eventX = api.coord([event.hour, 0]);
            const yTop = api.coord([0, 1]);
            const yBottom = api.coord([0, 0]);
            const laneHeight = api.size([0, 1])[1];
            const chartHeight = yBottom[1] - yTop[1] + laneHeight;
            const color = event.type === 'boot' ? BD_NEBULA : BD_AURORA;

            return {
              type: 'line',
              shape: {
                x1: eventX[0],
                y1: yTop[1] - laneHeight / 2,
                x2: eventX[0],
                y2: yTop[1] - laneHeight / 2 + chartHeight
              },
              style: {
                stroke: color,
                lineWidth: 2,
                lineDash: [4, 4]
              },
              z: 1
            };
          },
          data: this.pxSystemEvents.map((e, i) => i),
          silent: true,
          z: 1
        },
        {
          name: 'Heartbeat',
          type: 'scatter',
          data: heartbeatData,
          symbolSize: (value: any, params: any) => {
            return params.data.symbolSize || 4;
          },
          itemStyle: {
            color: '#999999'  // Lighter gray
          },
          emphasis: {
            scale: 1.3
          },
          z: 1
        },
        {
          name: 'Alerts',
          type: 'scatter',
          data: alertData,
          symbolSize: 10,
          symbol: 'diamond',
          z: 3
        },
        // Midnight indicator line
        {
          name: 'Midnight',
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const midnightX = api.coord([17, 0]); // 17 hours from 07:00 = midnight
            const yTop = api.coord([0, 1]);
            const yBottom = api.coord([0, 0]);
            const laneHeight = api.size([0, 1])[1];
            const chartHeight = yBottom[1] - yTop[1] + laneHeight;

            return {
              type: 'group',
              children: [
                // Invisible hover area
                {
                  type: 'rect',
                  shape: {
                    x: midnightX[0] - 5,
                    y: yTop[1] - laneHeight / 2,
                    width: 10,
                    height: chartHeight
                  },
                  style: {
                    fill: 'transparent'
                  },
                  z: 5
                },
                // Vertical solid line
                {
                  type: 'line',
                  shape: {
                    x1: midnightX[0],
                    y1: yTop[1] - laneHeight / 2,
                    x2: midnightX[0],
                    y2: yTop[1] - laneHeight / 2 + chartHeight
                  },
                  style: {
                    stroke: '#aaa',
                    lineWidth: 1
                  },
                  z: 5
                }
              ]
            };
          },
          data: [{ value: 0, nextDate: this.getNextDayFormatted() }],
          tooltip: {
            formatter: () => {
              return `<strong>Date Change</strong><br/>${this.getNextDayFormatted()}`;
            }
          },
          z: 1
        }
      ]
    };
  }

  private startRefreshTimer(): void {
    this.refreshCountdown = this.REFRESH_INTERVAL;
    this.updateRefreshText();

    this.refreshTimer = setInterval(() => {
      this.refreshCountdown--;
      this.updateRefreshText();

      if (this.refreshCountdown <= 0) {
        this.refreshNow();
      }
    }, 1000);
  }

  private updateRefreshText(): void {
    const minutes = Math.floor(this.refreshCountdown / 60);
    const seconds = this.refreshCountdown % 60;
    this.refreshTextShort = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  refreshNow(): void {
    // Reset countdown and refresh data
    this.refreshCountdown = this.REFRESH_INTERVAL;
    this.updateRefreshText();
    this.generateCharts();
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    if (this.clockTimer) {
      clearInterval(this.clockTimer);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
