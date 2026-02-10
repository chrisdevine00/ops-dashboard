/**
 * Abstract API service for the COR Dashboard.
 * Defines the contract that both the mock implementation and a real
 * backend-connected implementation must satisfy.
 *
 * In production, this would make HTTP calls to a C# .NET backend.
 * During development, MockCorApiService provides simulated data.
 *
 * Register a concrete implementation via the DI provider:
 *   { provide: CorApiService, useClass: MockCorApiService }
 * in the appropriate NgModule or application config providers array.
 */

import { Observable } from 'rxjs';
import {
  SystemsListResponse,
  SystemEventsRequest,
  SystemEventsResponse,
  ReferenceDataResponse,
  AuthUserInfo,
} from './api-contracts';

export abstract class CorApiService {
  /** Retrieve all COR systems with their current status */
  abstract getSystems(): Observable<SystemsListResponse>;

  /** Retrieve events for a specific system within a date range */
  abstract getSystemEvents(request: SystemEventsRequest): Observable<SystemEventsResponse>;

  /** Retrieve reference data (assays, event types, customers) */
  abstract getReferenceData(): Observable<ReferenceDataResponse>;

  /** Get the currently authenticated user's info */
  abstract getCurrentUser(): Observable<AuthUserInfo>;
}
