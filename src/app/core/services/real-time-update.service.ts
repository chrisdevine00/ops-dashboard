import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { startWith, share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RealTimeUpdateService {
  private updateInterval$?: Observable<number>;

  startPolling(intervalMs: number): Observable<number> {
    this.updateInterval$ = interval(intervalMs).pipe(
      startWith(0), // Emit immediately
      share()
    );
    return this.updateInterval$;
  }

  stopPolling(): void {
    this.updateInterval$ = undefined;
  }
}
