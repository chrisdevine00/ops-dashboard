import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SystemsService } from '../../../../../core/services/systems.service';
import { SystemsByRegion } from '../../../../../core/models/system.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false
})
export class HomeComponent implements OnInit, OnDestroy {
  systemsByRegion: SystemsByRegion[] = [];
  searchControl = new FormControl('');

  private destroy$ = new Subject<void>();

  constructor(private systemsService: SystemsService) {}

  ngOnInit(): void {
    // Initial load
    this.loadSystems();

    // Set up search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchSystems(query || '');
    });
  }

  private loadSystems(): void {
    this.systemsService.getSystemsByRegion()
      .pipe(takeUntil(this.destroy$))
      .subscribe(systems => {
        this.systemsByRegion = systems;
      });
  }

  private searchSystems(query: string): void {
    this.systemsService.searchSystems(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe(systems => {
        this.systemsByRegion = systems;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
