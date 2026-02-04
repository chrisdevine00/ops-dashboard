import { Component, OnInit, OnDestroy } from '@angular/core';
import { EChartsOption } from 'echarts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// BD Brand Colors
const BD_BLUE = '#0446ED';
const BD_ORANGE = '#FF6E00';
const BD_RED = '#FF6B61';
const BD_GRAY = '#BFB8B8';

interface WorkflowTask {
  name: string;
  acronym: string;
  start: Date;
  end: Date;
  status: 'normal' | 'warning' | 'alert';
  lane: number;
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

    for (let i = 0; i < count; i++) {
      const workflow = workflowTypes[Math.floor(Math.random() * workflowTypes.length)];
      const lane = Math.floor(Math.random() * laneCount);

      // Random start time between 07:00 and 06:00 next day (24hr period)
      const startMinutes = Math.random() * (24 * 60);
      const start = new Date(baseDate.getTime() + startMinutes * 60000);

      // Duration between 30 minutes and 4 hours
      const durationMinutes = 30 + Math.random() * 210;
      const end = new Date(start.getTime() + durationMinutes * 60000);

      // Random status
      const rand = Math.random();
      const status = rand > 0.85 ? 'warning' : rand > 0.95 ? 'alert' : 'normal';

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

    // Generate 24-hour timeline labels (07:00 to 07:00 next day)
    const timeLabels: string[] = [];
    for (let hour = 0; hour < 25; hour++) {
      const displayHour = (7 + hour) % 24;
      timeLabels.push(`${displayHour.toString().padStart(2, '0')}:00`);
    }

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

      const color = workflow.status === 'warning' ? BD_ORANGE :
                    workflow.status === 'alert' ? BD_RED : BD_BLUE;

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

      // Add alert markers
      if (workflow.status === 'alert' || Math.random() > 0.7) {
        const alertTime = startHours + Math.random() * (endHours - startHours);
        alertMarkers.push({
          coord: [alertTime, workflow.lane],
          symbolSize: 8,
          itemStyle: { color: BD_RED }
        });
      }
    });

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
        formatter: (params: any) => {
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
          return '';
        },
        backgroundColor: 'rgba(6, 10, 61, 0.95)',
        borderColor: BD_BLUE,
        borderWidth: 1,
        textStyle: { color: '#FFFFFF' }
      },
      grid: {
        left: '5%',
        right: '3%',
        top: '15%',
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
        data: customLabels || Array.from({ length: laneCount }, (_, i) => `Lane ${i + 1}`),
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
        {
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
          data: seriesData
        },
        {
          type: 'scatter',
          symbolSize: 8,
          data: alertMarkers,
          itemStyle: {
            color: BD_RED
          },
          z: 10
        }
      ]
    };
  }

  private generateCharts(): void {
    // Left GX: 10 workflows across 10 lanes
    const leftGxWorkflows = this.generateMockWorkflows(25, 10);
    this.leftGxChartOptions = this.createGanttChart('Left GX', leftGxWorkflows, 10);

    // Right MX: 12 workflows across 12 lanes
    const rightMxWorkflows = this.generateMockWorkflows(30, 12);
    this.rightMxChartOptions = this.createGanttChart('Right MX', rightMxWorkflows, 12);

    // PX: Sankey diagram for workflow state transitions
    this.pxChartOptions = this.createSankeyChart();
  }

  private createSankeyChart(): EChartsOption {
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
          if (params.dataType === 'edge') {
            return `${params.data.source} → ${params.data.target}<br/><strong>${params.value}</strong> workflows`;
          }
          return `<strong>${params.name}</strong><br/>${params.value || 0} workflows`;
        },
        backgroundColor: 'rgba(6, 10, 61, 0.95)',
        borderColor: BD_BLUE,
        borderWidth: 1,
        textStyle: { color: '#FFFFFF' }
      },
      series: [
        {
          type: 'graph',
          layout: 'none',
          symbolSize: 60,
          roam: false,
          label: {
            show: true,
            fontSize: 10,
            fontWeight: 500,
            color: '#FFFFFF'
          },
          edgeSymbol: ['none', 'arrow'],
          edgeSymbolSize: 8,
          data: [
            { name: 'Received', x: 50, y: 150, value: 100, itemStyle: { color: BD_BLUE } },
            { name: 'Accessioning', x: 150, y: 100, value: 95, itemStyle: { color: BD_BLUE } },
            { name: 'Pre-analytical', x: 250, y: 150, value: 90, itemStyle: { color: BD_BLUE } },
            { name: 'Testing', x: 350, y: 100, value: 85, itemStyle: { color: BD_BLUE } },
            { name: 'Analysis', x: 450, y: 150, value: 80, itemStyle: { color: BD_BLUE } },
            { name: 'Review', x: 550, y: 100, value: 75, itemStyle: { color: BD_ORANGE } },
            { name: 'Validation', x: 650, y: 150, value: 70, itemStyle: { color: BD_BLUE } },
            { name: 'Complete', x: 750, y: 125, value: 68, itemStyle: { color: '#4caf50' } }
          ],
          links: [
            // Forward progression
            { source: 'Received', target: 'Accessioning', value: 85, lineStyle: { color: BD_BLUE, width: 2 } },
            { source: 'Received', target: 'Pre-analytical', value: 10, lineStyle: { color: BD_BLUE, width: 1, type: 'dashed' } },
            { source: 'Accessioning', target: 'Pre-analytical', value: 80, lineStyle: { color: BD_BLUE, width: 2 } },
            { source: 'Pre-analytical', target: 'Testing', value: 75, lineStyle: { color: BD_BLUE, width: 2 } },
            { source: 'Testing', target: 'Analysis', value: 70, lineStyle: { color: BD_BLUE, width: 2 } },
            { source: 'Analysis', target: 'Review', value: 75, lineStyle: { color: BD_BLUE, width: 2 } },
            { source: 'Review', target: 'Validation', value: 70, lineStyle: { color: BD_BLUE, width: 2 } },
            { source: 'Validation', target: 'Complete', value: 68, lineStyle: { color: BD_BLUE, width: 2 } },

            // Backflow/rework paths
            { source: 'Review', target: 'Testing', value: 5, lineStyle: { color: BD_RED, width: 1.5, type: 'dashed' } },
            { source: 'Validation', target: 'Review', value: 2, lineStyle: { color: BD_RED, width: 1, type: 'dashed' } },
            { source: 'Testing', target: 'Pre-analytical', value: 3, lineStyle: { color: BD_ORANGE, width: 1, type: 'dashed' } }
          ],
          lineStyle: {
            opacity: 0.7,
            curveness: 0.2
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 3
            }
          }
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
