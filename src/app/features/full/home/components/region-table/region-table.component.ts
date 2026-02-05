import { Component, Input, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { System } from '../../../../../core/models/system.model';

@Component({
  selector: 'app-region-table',
  templateUrl: './region-table.component.html',
  styleUrl: './region-table.component.scss',
  standalone: false
})
export class RegionTableComponent implements AfterViewInit, OnChanges {
  @Input() systems: System[] = [];
  @Input() region: string = '';

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['customerName', 'serialNumber', 'lastEventTime', 'lastAlertTime'];
  dataSource = new MatTableDataSource<System>([]);

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item: System, property: string) => {
      switch (property) {
        case 'customerName':
          return item.customerName.toLowerCase();
        case 'serialNumber':
          return item.serialNumber.toLowerCase();
        case 'lastEventTime':
          return item.lastEventTime ? item.lastEventTime.getTime() : 0;
        case 'lastAlertTime':
          return item.lastAlertTime ? item.lastAlertTime.getTime() : 0;
        default:
          return '';
      }
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['systems']) {
      this.dataSource.data = this.systems;
    }
  }

  formatDateTime(date: Date | null): string {
    if (!date) {
      return '—';
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
}
