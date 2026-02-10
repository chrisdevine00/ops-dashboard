import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SystemsService } from '../../../../../core/services/systems.service';
import { System } from '../../../../../core/models/system.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false
})
export class HomeComponent implements OnInit, OnDestroy {
  allCount = 0;
  displayedColumns = ['status', 'customerName', 'region', 'serialNumber', 'lastEventTime', 'lastAlertTime'];
  dataSource = new MatTableDataSource<System>([]);
  searchControl = new FormControl('');

  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();

  constructor(private systemsService: SystemsService) {}

  ngOnInit(): void {
    // Initial load
    this.systemsService.getSystemsFlat()
      .pipe(takeUntil(this.destroy$))
      .subscribe(systems => {
        this.allCount = systems.length;
        this.dataSource.data = systems;
      });

    // Set up search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.systemsService.searchSystems(query || '')
        .pipe(takeUntil(this.destroy$))
        .subscribe(systems => {
          this.dataSource.data = systems;
        });
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  getStatus(system: System): 'ok' | 'warning' | 'critical' {
    if (!system.lastAlertTime) return 'ok';
    const hoursAgo = (Date.now() - system.lastAlertTime.getTime()) / (1000 * 60 * 60);
    if (hoursAgo <= 4) return 'critical';
    if (hoursAgo <= 24) return 'warning';
    return 'ok';
  }

  formatDateTime(date: Date | null): string {
    if (!date) return '\u2014';
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
